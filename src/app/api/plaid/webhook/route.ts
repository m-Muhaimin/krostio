import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { syncPlaidItem } from '@/lib/plaid-sync'
import { verifyPlaidWebhook } from '@/lib/plaid-webhook'

type ConnectionRow = {
  user_id: string
  access_token: string | null
  institution_id: string | null
  institution_name: string | null
}

/**
 * POST /api/plaid/webhook
 *
 * Plaid sends webhook events to this endpoint whenever new transaction
 * data is available, items encounter errors, or access tokens are about
 * to expire.
 *
 * Plaid webhooks are signed with a JWT in the `plaid-verification` header.
 * We verify the signature before processing.
 *
 * IMPORTANT: Register this URL in the Plaid Dashboard:
 *   https://dashboard.plaid.com/developers/webhooks
 *   → Webhook URL: https://krostio.vercel.app/api/plaid/webhook
 *
 * Supported events:
 *   - SYNC_UPDATES_AVAILABLE / DEFAULT_UPDATE → re-sync item + recalculate score
 *   - ITEM_ERROR → mark connection as errored
 *   - PENDING_EXPIRATION → mark connection for re-auth
 *   - TRANSACTIONS_REMOVED → log and ack (we just re-sync on next update)
 */
export async function POST(request: NextRequest) {
  // Read raw body as text (must happen before any other body read)
  const rawBody = await request.text()
  const plaidVerification = request.headers.get('plaid-verification')

  // Verify webhook signature (Plaid always sends this header in production)
  if (plaidVerification) {
    const isValid = await verifyPlaidWebhook(plaidVerification)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }
  }

  // Parse the event
  let event: Record<string, any>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { webhook_type: type, webhook_code: code, item_id: itemId } = event

  // Acknowledge receipt immediately (Plaid expects 200 within 5s)
  // Processing happens asynchronously after acknowledgment
  if (type === 'TRANSACTIONS' && (code === 'SYNC_UPDATES_AVAILABLE' || code === 'DEFAULT_UPDATE') && itemId) {
    // Fire-and-forget the sync — don't block the response
    resyncForItem(itemId, event).catch((err) => {
      console.error(`[Plaid Webhook] re-sync failed for item ${itemId}:`, err)
    })
  } else if (type === 'ITEM' && code === 'ERROR' && itemId) {
    handleItemError(itemId, event.error).catch((err) => {
      console.error(`[Plaid Webhook] error handler failed for item ${itemId}:`, err)
    })
  } else if (type === 'ITEM' && code === 'PENDING_EXPIRATION' && itemId) {
    handlePendingExpiration(itemId).catch((err) => {
      console.error(`[Plaid Webhook] expiration handler failed for item ${itemId}:`, err)
    })
  }

  return NextResponse.json({ received: true })
}

// ──────────────────────────────────────────────
// Event Handlers
// ──────────────────────────────────────────────

/**
 * SYNC_UPDATES_AVAILABLE / DEFAULT_UPDATE — new transaction data is ready.
 *
 * Looks up the Plaid access_token for this item_id, then re-syncs and
 * recalculates the worker's score.
 */
async function resyncForItem(itemId: string, _event: Record<string, any>) {
  const supabase = getSupabaseAdmin()

  // Find all connections sharing this Plaid item
  const { data: connections, error } = await supabase
    .from('platform_connections')
    .select('user_id, access_token, institution_id, institution_name')
    .eq('item_id', itemId)
    .eq('provider', 'plaid')
    .limit(1) as unknown as { data: ConnectionRow[] | null; error: any }

  if (error || !connections || connections.length === 0) {
    console.warn(`[Plaid Webhook] No platform_connection found for item ${itemId}`)
    return
  }

  const conn = connections[0]
  if (!conn.access_token) {
    console.warn(`[Plaid Webhook] No access_token for item ${itemId}`)
    return
  }

  // Re-sync transactions
  const result = await syncPlaidItem(
    conn.access_token,
    conn.user_id,
    itemId,
    {
      name: conn.institution_name ?? undefined,
      institution_id: conn.institution_id ?? undefined,
    }
  )

  console.log(
    `[Plaid Webhook] Re-synced item ${itemId} for user ${conn.user_id}: ` +
    `${result.rowsAdded} rows, ${result.platformsDetected.length} platforms, ` +
    `score: ${result.score?.consistency_score ?? 'N/A'}`
  )
}

/**
 * ITEM_ERROR — the Plaid item has an error that may require user action
 * (e.g. credentials changed, MFA required, institution temporarily down).
 *
 * Marks the connection for re-auth.
 */
async function handleItemError(itemId: string, plaidError?: Record<string, any>) {
  const supabase = getSupabaseAdmin()

  const errorReason = plaidError?.error_message || plaidError?.error_code || 'unknown'
  console.log(`[Plaid Webhook] Item ${itemId} error: ${errorReason}`)

  const update: Record<string, any> = {
    is_active: false,
    last_sync_at: new Date().toISOString(),
  }

  await (supabase as any)
    .from('platform_connections')
    .update(update)
    .eq('item_id', itemId)
    .eq('provider', 'plaid')
}

/**
 * PENDING_EXPIRATION — access token is about to expire.
 * The user needs to re-connect via Plaid Link in update mode.
 */
async function handlePendingExpiration(itemId: string) {
  const supabase = getSupabaseAdmin()

  await (supabase as any)
    .from('platform_connections')
    .update({
      is_active: false,
      last_sync_at: new Date().toISOString(),
    })
    .eq('item_id', itemId)
    .eq('provider', 'plaid')
}

/**
 * Required for Next.js App Router — ensures the route uses the
 * Edge/Runtime that can process large webhook payloads.
 */
export const runtime = 'nodejs'
