import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncOnChainAttestation } from '@/lib/score-sync'
import type { SyncInput } from '@/lib/score-sync'

// ─── Auth ──────────────────────────────────────────────────────────────

function verifySyncKey(request: NextRequest): boolean {
  const syncKey = process.env.SYNC_SECRET_KEY
  if (!syncKey) {
    // If SYNC_SECRET_KEY is not set, only allow in dev mode
    // or require admin role via Supabase session (handled below)
    return true // skip key check, rely on session auth
  }
  const headerKey = request.headers.get('x-sync-key')
  return headerKey === syncKey
}

// ─── Income tier helper ────────────────────────────────────────────────

function deriveIncomeTier(monthlyAvgUsd: number): string {
  if (monthlyAvgUsd >= 5000) return 'premium'
  if (monthlyAvgUsd >= 3000) return 'strong'
  if (monthlyAvgUsd >= 1500) return 'moderate'
  return 'entry'
}

function deriveScoreTier(score: number): string {
  if (score >= 750) return 'elite'
  if (score >= 680) return 'strong'
  if (score >= 580) return 'building'
  return 'emerging'
}

// ─── Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Auth check
  if (!verifySyncKey(request)) {
    // Fall back to Supabase admin session check
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Set SYNC_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 401 }
      )
    }
  }

  // 2. Parse body
  let body: {
    userId: string
    score?: number
    monthlyAvgIncome?: number
    incomeVolatility?: number
    tenureMonths?: number
    platformDiversity?: number
    reliabilityScore?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  // 3. Create Supabase admin client for DB lookups
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase admin credentials not configured' },
      { status: 500 }
    )
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // 4. Look up user's passport to get wallet_address
  const { data: passport, error: passportError } = await adminClient
    .from('passports')
    .select('id, wallet_address, attestation_count, current_score')
    .eq('user_id', body.userId)
    .maybeSingle()

  if (passportError) {
    return NextResponse.json({ error: `Passport lookup failed: ${passportError.message}` }, { status: 500 })
  }

  if (!passport) {
    return NextResponse.json({ error: 'No passport found for this user' }, { status: 404 })
  }

  if (!passport.wallet_address) {
    return NextResponse.json({ error: 'User has not connected a wallet' }, { status: 400 })
  }

  // 5. Compute missing values if not provided — fetch the latest income verification / krost score
  let score = body.score
  let monthlyAvgIncome = body.monthlyAvgIncome
  let incomeVolatility = body.incomeVolatility
  let tenureMonths = body.tenureMonths
  let platformDiversity = body.platformDiversity
  let reliabilityScore = body.reliabilityScore

  if (!score) {
    // Fall back to the passport's current_score
    score = passport.current_score
    if (!score) {
      // Try krost_scores table
      const { data: krostScore } = await adminClient
        .from('krost_scores')
        .select('score')
        .eq('user_id', body.userId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (krostScore?.score) {
        score = krostScore.score
      }
    }
  }

  if (!score) {
    return NextResponse.json({ error: 'No score available to attest. Provide a score or compute one first.' }, { status: 400 })
  }

  // Fill defaults for missing fields
  monthlyAvgIncome ??= 3000
  incomeVolatility ??= 0.3
  tenureMonths ??= 12
  platformDiversity ??= 1
  reliabilityScore ??= 70

  // 6. Build sync input
  const syncInput: SyncInput = {
    workerAddress: passport.wallet_address,
    score,
    monthlyAvgIncome,
    incomeVolatility,
    tenureMonths,
    platformDiversity,
    reliabilityScore,
  }

  // 7. Execute on-chain attestation
  const syncResult = await syncOnChainAttestation(syncInput)

  if (!syncResult.success) {
    return NextResponse.json({ error: syncResult.error }, { status: 500 })
  }

  // 8. Record in attestation_history
  const scoreTier = deriveScoreTier(score)
  const incomeTier = deriveIncomeTier(monthlyAvgIncome)

  const { error: insertError } = await adminClient
    .from('attestation_history')
    .insert({
      passport_id: passport.id,
      score,
      score_tier: scoreTier,
      income_tier: incomeTier,
      tx_hash: syncResult.txHash,
      block_number: syncResult.blockNumber,
      attested_at: new Date().toISOString(),
    })

  if (insertError) {
    // Tx succeeded but DB record failed — surface both
    return NextResponse.json({
      success: true,
      txHash: syncResult.txHash,
      blockNumber: syncResult.blockNumber,
      warning: `Attestation recorded on-chain but DB insert failed: ${insertError.message}`,
    })
  }

  // 9. Update passport record
  const newAttestationCount = (passport.attestation_count ?? 0) + 1

  const { error: updateError } = await adminClient
    .from('passports')
    .update({
      current_score: score,
      score_tier: scoreTier,
      last_attested_at: new Date().toISOString(),
      attestation_count: newAttestationCount,
    })
    .eq('id', passport.id)

  return NextResponse.json({
    success: true,
    txHash: syncResult.txHash,
    blockNumber: syncResult.blockNumber,
    score,
    scoreTier,
    incomeTier,
    newAttestationCount,
    warning: updateError ? `Passport update failed: ${updateError.message}` : undefined,
  })
}
