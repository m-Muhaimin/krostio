import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { plaid } from '@/lib/plaid'
import { syncPlaidItem } from '@/lib/plaid-sync'

/**
 * POST /api/plaid/exchange
 *
 * Body: { public_token: string, institution?: { name, institution_id } }
 *
 * Flow:
 * 1. Exchanges public_token for an access_token
 * 2. Delegates to syncPlaidItem() which:
 *    - Fetches 90d of Plaid transactions
 *    - Detects gig platforms
 *    - Upserts platform_connections
 *    - Writes income_records + ledger_entries
 *    - Recalculates income verification score
 *
 * Returns the sync result including detected platforms and score.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { public_token, institution } = await request.json()
  if (!public_token) {
    return NextResponse.json({ error: 'public_token required' }, { status: 400 })
  }

  // 1. Exchange public token for Plaid access token
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

  // 2. Sync data (fetch transactions, store, calculate score)
  let result
  try {
    result = await syncPlaidItem(accessToken, user.id, itemId, {
      name: institution?.name,
      institution_id: institution?.institution_id,
    })
  } catch (err: any) {
    const msg = err?.response?.data?.error_message || err?.message || 'Plaid sync failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    item_id: itemId,
    platforms_connected: result.platformsDetected,
    income_records_added: result.rowsAdded,
    score: result.score,
  })
}
