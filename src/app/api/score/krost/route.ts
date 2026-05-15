import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { calculateKrostScore } from '@/lib/scoring-engine'
import type { KrostScoreInput } from '@/types'
import { syncOnChainAttestation } from '@/lib/score-sync'

/**
 * GET /api/score/krost
 *
 * Returns the Krost Score (300–850) for the current user.
 * Calculates from income_records if available, otherwise returns null.
 *
 * Query params:
 *   ?refresh=true — forces recalculation instead of returning cached
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const refresh = searchParams.get('refresh') === 'true'

  // If not forcing refresh, check for cached Krost score in the DB
  if (!refresh) {
    const { data: krostRecord } = await supabase
      .from('krost_scores')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (krostRecord) {
      return NextResponse.json({
        score: krostRecord.score,
        tier: krostRecord.tier,
        breakdown: krostRecord.breakdown,
        factors: krostRecord.factors,
        calculatedAt: krostRecord.calculated_at,
        cached: true,
      })
    }
  }

  // Fetch income records to compute the score
  const { data: records } = await supabase
    .from('income_records')
    .select('*')
    .eq('user_id', user.id)
    .order('period_start', { ascending: false })

  if (!records || records.length === 0) {
    return NextResponse.json({
      score: null,
      tier: null,
      factors: [],
      breakdown: null,
      calculatedAt: null,
      message: 'No income records found. Connect a platform first.',
    })
  }

  // Derive Krost Score inputs from income records
  const monthlyMap = new Map<string, number[]>()
  let positiveMonths = 0
  let totalMonths = 0
  let platforms = new Set<string>()

  for (const r of records) {
    const monthKey = r.period_start.slice(0, 7)
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, [])
      totalMonths++
    }
    monthlyMap.get(monthKey)!.push(r.net_earnings)
    platforms.add(r.platform)
  }

  // Calculate monthly totals
  const monthlyTotals = Array.from(monthlyMap.entries())
    .map(([month, earnings]) => ({
      month,
      total: earnings.reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Average monthly income
  const avgMonthly = monthlyTotals.length > 0
    ? monthlyTotals.reduce((s, m) => s + m.total, 0) / monthlyTotals.length
    : 0

  // Platform tenure
  const dates = records.map(r => new Date(r.period_start))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  const tenureMonths = Math.max(1, Math.round(
    (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  ))

  // Volatility (CV)
  let cv = 0
  if (monthlyTotals.length >= 2) {
    const avg = monthlyTotals.reduce((s, m) => s + m.total, 0) / monthlyTotals.length
    if (avg > 0) {
      const variance = monthlyTotals.reduce((s, m) => s + (m.total - avg) ** 2, 0) / monthlyTotals.length
      cv = Math.sqrt(variance) / avg
    }
  }

  // Earning consistency (% months with positive earnings)
  for (const [, earnings] of monthlyMap) {
    if (earnings.reduce((a, b) => a + b, 0) > 0) positiveMonths++
  }
  const earningConsistency = totalMonths > 0
    ? (positiveMonths / totalMonths) * 100
    : 0

  // Trajectory (linear regression slope on last 12 months)
  let trajectorySlope = 0
  if (monthlyTotals.length >= 3) {
    const slice = monthlyTotals.slice(-12)
    const n = slice.length
    const indices = slice.map((_, i) => i)
    const totals = slice.map(m => m.total)
    const sumX = indices.reduce((a, b) => a + b, 0)
    const sumY = totals.reduce((a, b) => a + b, 0)
    const sumXY = indices.reduce((s, i) => s + i * totals[i], 0)
    const sumX2 = indices.reduce((s, i) => s + i * i, 0)
    if (n * sumX2 - sumX * sumX !== 0) {
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      const meanY = sumY / n
      if (meanY !== 0) trajectorySlope = slope / meanY
    }
  }

  // v2 — Cross-platform growth: new platforms adopted in the last 12 months
  let crossPlatformGrowth = 0
  try {
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
    const { data: recentConnections } = await supabase
      .from('platform_connections')
      .select('platform')
      .eq('user_id', user.id)
      .gte('connected_at', twelveMonthsAgo.toISOString())
    if (recentConnections) {
      crossPlatformGrowth = new Set(recentConnections.map(c => c.platform)).size
    }
  } catch {
    // Non-critical — default to 0
  }

  // v2 inputs
  const input: KrostScoreInput = {
    avgMonthlyIncome: avgMonthly,
    platformTenureMonths: tenureMonths,
    incomeVolatility: cv,
    platformDiversity: platforms.size,
    earningConsistency,
    incomeTrajectory: trajectorySlope,
    taxCompliance: false,                // TODO: query tax_compliance table when available
    crossPlatformGrowth,                 // computed from platform_connections
    ledgerDepth: monthlyTotals.length,   // months of available data
  }

  const result = calculateKrostScore(input)

  // Persist the score
  const { data: existingRecord } = await supabase
    .from('krost_scores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const payload = {
    user_id: user.id,
    score: result.score,
    tier: result.tier,
    breakdown: result.breakdown,
    factors: result.factors,
    calculated_at: result.calculatedAt,
  }

  if (existingRecord) {
    await supabase
      .from('krost_scores')
      .update(payload)
      .eq('id', existingRecord.id)
  } else {
    await supabase.from('krost_scores').insert(payload)
  }

  // ─── Auto-sync to on-chain if user has a passport with wallet ───
  try {
    const { data: passport } = await supabase
      .from('passports')
      .select('wallet_address')
      .eq('user_id', user.id)
      .maybeSingle()

    if (passport?.wallet_address) {
      // Non-blocking — don't await, fire and forget on-chain sync
      syncOnChainAttestation({
        workerAddress: passport.wallet_address as `0x${string}`,
        score: result.score,
        monthlyAvgIncome: avgMonthly,
        incomeVolatility: cv,
        tenureMonths,
        platformDiversity: platforms.size,
        reliabilityScore: earningConsistency,
      }).then(syncResult => {
        if (syncResult.success) {
          console.log(`[krost-sync] On-chain attestation complete: tx=${syncResult.txHash}`)
        } else {
          console.warn(`[krost-sync] On-chain sync skipped: ${syncResult.error}`)
        }
      })
    }
  } catch {
    // Non-critical — score saved even if on-chain fails
    console.warn('[krost-sync] Failed to check passport for on-chain sync')
  }

  return NextResponse.json({ ...result, cached: false })
}
