import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { plaid } from '@/lib/plaid'
import { fetchGigIncomeForItem } from '@/lib/plaid-sync'
import { calculateCreditScore } from '@/lib/scoring-engine'
import { createServiceSupabaseClient } from '@/lib/supabase-service'

/**
 * Gig payout names used by real platforms when depositing via Plaid-enabled bank accounts.
 * Plaid sandbox doesn't seed these by default, so we inject them for end-to-end testing.
 */
const GIG_DEPOSITS: Array<{ name: string; min: number; max: number; tail: number }> = [
  { name: 'UBER *TRIP', min: 15, max: 85, tail: 65 },
  { name: 'UBER *EATS DELIVERY', min: 8, max: 45, tail: 25 },
  { name: 'LYFT *RIDE', min: 12, max: 70, tail: 55 },
  { name: 'DOORDASH *DELIVERY', min: 6, max: 35, tail: 20 },
  { name: 'INSTACART *ORDER', min: 10, max: 60, tail: 40 },
  { name: 'GRUBHUB *DELIVERY', min: 7, max: 30, tail: 18 },
  { name: 'FIVERR *EARNINGS', min: 25, max: 300, tail: 120 },
  { name: 'UPWORK *PAYMENT', min: 50, max: 500, tail: 200 },
]

function randBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * POST /api/plaid/sandbox-seed
 * Body: { access_token: string, weeks?: number, resync?: boolean }
 *
 * 1. Injects 15-30 random fake gig-payout transactions per week across
 *    the last `weeks` weeks (default: 13 ≈ 3 months).
 * 2. If `resync: true`, also re-fetches transactions, writes income_records,
 *    and recalculates the credit score — all in one call.
 *
 * ONLY works in sandbox PLAID_ENV.
 */
export async function POST(request: NextRequest) {
  if (process.env.PLAID_ENV !== 'sandbox') {
    return NextResponse.json(
      { error: 'This endpoint only works in sandbox environment' },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { access_token: rawToken, weeks, resync } = await request.json()

  // Resolve access_token — either passed directly or looked up from the user's connections
  let accessToken = rawToken
  let resolvedItemId: string | null = null

  if (!accessToken) {
    // Look up the most recent plaid connection for this user
    const { data: conn } = await supabase
      .from('platform_connections')
      .select('access_token, item_id')
      .eq('user_id', user.id)
      .eq('provider', 'plaid')
      .order('last_sync_at', { ascending: false })
      .limit(1)
      .single()

    if (!conn?.access_token) {
      return NextResponse.json(
        { error: 'No Plaid connection found. Connect via Plaid Link first, or provide access_token directly.' },
        { status: 400 }
      )
    }
    accessToken = conn.access_token
    resolvedItemId = conn.item_id
  }

  const numWeeks = Math.min(Math.max(weeks ?? 13, 1), 26)

  // Build fake transactions
  const today = new Date()
  const start = addDays(today, -(numWeeks * 7))

  const allTransactions: Array<{
    amount: number
    date_transacted: string
    date_posted: string
    description: string
    name: string
    iso_currency_code: string
  }> = []

  for (let w = 0; w < numWeeks; w++) {
    const weekStart = addDays(start, w * 7)
    const depositsPerWeek = 15 + Math.floor(Math.random() * 16) // 15-30 per week

    for (let d = 0; d < depositsPerWeek; d++) {
      const platform = GIG_DEPOSITS[Math.floor(Math.random() * GIG_DEPOSITS.length)]
      const amount = -randBetween(platform.min, platform.max)
      const dateOffset = Math.floor(Math.random() * 7)
      const date = addDays(weekStart, dateOffset)

      if (date > today) continue

      allTransactions.push({
        name: platform.name,
        amount,
        date_transacted: date.toISOString().slice(0, 10),
        date_posted: date.toISOString().slice(0, 10),
        description: `${platform.name} payout`,
        iso_currency_code: 'USD',
      })
    }
  }

  // Seed in batches of 300
  let totalSeeded = 0
  const batchSize = 300
  for (let i = 0; i < allTransactions.length; i += batchSize) {
    const batch = allTransactions.slice(i, i + batchSize)
    try {
      await plaid.sandboxTransactionsCreate({
        access_token: accessToken,
        transactions: batch,
      } as any)
      totalSeeded += batch.length
    } catch (err: any) {
      const msg = err?.response?.data?.error_message || err?.message || 'Sandbox seed failed'
      return NextResponse.json(
        { error: msg, total_seeded: totalSeeded },
        { status: 500 }
      )
    }
  }

  // Resync: fetch transactions + recalculate score
  let syncResult = null
  if (resync) {
    try {
      const { incomeRows, ledgerRows } = await fetchGigIncomeForItem(accessToken, user.id, numWeeks * 7)

      // Write income_records (delete existing ones from this item's previous sync first?)
      // We upsert to avoid duplicates: one row per (user_id, platform, period_start)
      const service = createServiceSupabaseClient()
      if (incomeRows.length > 0) {
        // For sandbox testing, clear old income records for this user first
        await service.from('income_records').delete().eq('user_id', user.id)
        await service.from('income_records').insert(incomeRows)
      }
      if (ledgerRows.length > 0) {
        await service.from('ledger_entries').delete().eq('user_id', user.id)
        await service.from('ledger_entries').insert(ledgerRows)
      }

      // Recalculate score
      const { data: allIncome } = await service
        .from('income_records')
        .select('*')
        .eq('user_id', user.id)

      let score = null
      if (allIncome && allIncome.length > 0) {
        try {
          const calc = calculateCreditScore(allIncome as any, user.id)
          const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          await service
            .from('income_verifications')
            .upsert(
              {
                user_id: calc.user_id,
                consistency_score: calc.consistency_score,
                annualized_income: calc.annualized_income,
                monthly_avg_income: calc.monthly_avg_income,
                income_volatility: calc.income_volatility,
                tenure_months: calc.tenure_months,
                platform_diversity: calc.platform_diversity,
                diversity_score: calc.diversity_score,
                trajectory_label: calc.trajectory_label,
                trajectory_slope: calc.trajectory_slope,
                lender_ready_status: calc.lender_ready_status,
                score_factors: calc.score_factors,
                calculated_at: calc.calculated_at,
                expires_at,
              },
              { onConflict: 'user_id' }
            )
          score = calc
        } catch {
          // not enough data
        }
      }

      // Update last_sync_at on the connection
      await service
        .from('platform_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('provider', 'plaid')

      syncResult = {
        income_rows: incomeRows.length,
        platforms_detected: incomeRows.length > 0
          ? Array.from(new Set(incomeRows.map((r) => r.platform)))
          : [],
        score: score?.consistency_score ?? null,
      }
    } catch (err: any) {
      syncResult = { error: err?.message ?? 'Sync failed after seeding' }
    }
  }

  return NextResponse.json({
    success: true,
    total_seeded: totalSeeded,
    weeks: numWeeks,
    date_range: {
      start: start.toISOString().slice(0, 10),
      end: today.toISOString().slice(0, 10),
    },
    platforms_seeded: GIG_DEPOSITS.map((g) => g.name),
    sync: syncResult,
  })
}
