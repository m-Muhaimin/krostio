import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { plaid } from '@/lib/plaid'
import { fetchGigIncomeForItem } from '@/lib/plaid-sync'
import { calculateCreditScore } from '@/lib/scoring-engine'

/**
 * POST /api/plaid/exchange
 * Body: { public_token: string, institution?: { name, institution_id } }
 *
 * 1. Exchanges public_token for an access_token
 * 2. Stores it on platform_connections (one row per platform detected)
 * 3. Pulls 90 days of transactions, writes income_records
 * 4. Recalculates credit_score
 */
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  const { public_token, institution } = await request.json()
  if (!public_token) {
    return NextResponse.json({ error: 'public_token required' }, { status: 400 })
  }

  // 1. Exchange
  let accessToken: string
  let itemId: string
  try {
    const ex = await plaid.itemPublicTokenExchange({ public_token })
    accessToken = ex.data.access_token
    itemId = ex.data.item_id
  } catch (err: any) {
    const msg = err?.response?.data?.error_message || err?.message || 'Plaid exchange failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // 2. Pull income data
  let syncResult
  try {
    syncResult = await fetchGigIncomeForItem(accessToken, user.id, 90)
  } catch (err: any) {
    const msg = err?.response?.data?.error_message || err?.message || 'Plaid sync failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const { incomeRows, ledgerRows } = syncResult

  // 3. Detect which gig platforms this item produced
  const platforms = Array.from(new Set(ledgerRows.map((r) => r.platform)))

  // If no gig income detected, still record the connection so the user can retry
  const platformsToRecord = platforms.length > 0 ? platforms : ['other' as const]

  // 4. Upsert platform_connections
  for (const platform of platformsToRecord) {
    await supabase.from('platform_connections').upsert(
      {
        user_id: user.id,
        platform,
        platform_user_id: `${user.id}_${platform}`,
        access_token: accessToken,
        item_id: itemId,
        institution_id: institution?.institution_id ?? null,
        institution_name: institution?.name ?? null,
        provider: 'plaid',
        is_active: true,
        last_sync_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    )
  }

  // 5. Insert legacy income records and new ledger entries
  if (incomeRows.length > 0) {
    await supabase.from('income_records').insert(incomeRows)
  }
  if (ledgerRows.length > 0) {
    await supabase.from('ledger_entries').insert(ledgerRows)
  }

  // 6. Recalculate scores (v1 and v2)
  const { data: allIncome } = await supabase
    .from('income_records')
    .select('*')
    .eq('user_id', user.id)

  let score = null
  if (allIncome && allIncome.length > 0) {
    try {
      const calc = calculateCreditScore(allIncome as any, user.id)
      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      // Upsert income_verifications (unique on user_id)
      await supabase
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
    } catch (err) {
      // not enough data for a score — that's fine, leave score=null
    }
  }

  // 7. Trigger Krost Score v2 calculation (via existing API route logic or internal call)
  try {
    const krostRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/score/krost?refresh=true`, {
      headers: { cookie: request.headers.get('cookie') || '' }
    })
    if (!krostRes.ok) console.error('Krost score sync failed', await krostRes.text())
  } catch (err) {
    console.error('Krost score fetch error', err)
  }

  return NextResponse.json({
    success: true,
    item_id: itemId,
    platforms_connected: platformsToRecord,
    income_records_added: incomeRows.length,
    ledger_entries_added: ledgerRows.length,
    score,
  })
}
