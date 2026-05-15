import { createServiceSupabaseClient } from '@/lib/supabase-service'
import { LENDER_PRO_PRICE_ID, LENDER_SCALE_PRICE_ID } from '@/lib/stripe'

export type LenderPlan = 'free' | 'pro' | 'scale'

export type VerificationSource = 'search' | 'request' | 'report_view'

const FREE_LIMIT = 3
const PRO_LIMIT = 50
const SCALE_LIMIT = 150

export function getLenderPlan(priceId: string | null | undefined): LenderPlan {
  if (priceId && priceId === LENDER_SCALE_PRICE_ID) return 'scale'
  if (priceId && priceId === LENDER_PRO_PRICE_ID) return 'pro'
  return 'free'
}

export function getLenderQuotaLimit(priceId: string | null | undefined): number {
  switch (getLenderPlan(priceId)) {
    case 'scale':
      return SCALE_LIMIT
    case 'pro':
      return PRO_LIMIT
    default:
      return FREE_LIMIT
  }
}

function startOfThisMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
}

export async function getLenderUsageThisMonth(lenderId: string): Promise<number> {
  const service = createServiceSupabaseClient()
  const since = startOfThisMonth().toISOString()

  const { count, error } = await service
    .from('verification_usage')
    .select('id', { count: 'exact', head: true })
    .eq('lender_id', lenderId)
    .gte('used_at', since)

  if (error) {
    console.error('[lender-quota] usage query failed', error)
    return 0
  }
  return count ?? 0
}

export async function recordVerification(
  lenderId: string,
  workerId: string,
  source: VerificationSource,
): Promise<void> {
  const service = createServiceSupabaseClient()
  const { error } = await service.from('verification_usage').insert({
    lender_id: lenderId,
    worker_id: workerId,
    source,
  })
  if (error) {
    console.error('[lender-quota] insert failed', error)
    throw error
  }
}

export async function checkLenderQuota(lenderId: string): Promise<{
  used: number
  limit: number
  remaining: number
  plan: LenderPlan
}> {
  const service = createServiceSupabaseClient()

  const { data: profile } = await service
    .from('profiles')
    .select('stripe_price_id, subscription_status')
    .eq('id', lenderId)
    .single()

  const activePriceId =
    profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
      ? profile?.stripe_price_id ?? null
      : null

  const plan = getLenderPlan(activePriceId)
  const limit = getLenderQuotaLimit(activePriceId)
  const used = await getLenderUsageThisMonth(lenderId)
  const remaining = Math.max(0, limit - used)

  return { used, limit, remaining, plan }
}

/**
 * Check whether a given (lender, worker) combination has already been billed
 * this calendar month — used to avoid double-charging when a lender views the
 * same worker multiple times in a billing period.
 */
export async function hasAlreadyVerifiedThisMonth(
  lenderId: string,
  workerId: string,
): Promise<boolean> {
  const service = createServiceSupabaseClient()
  const since = startOfThisMonth().toISOString()
  const { data, error } = await service
    .from('verification_usage')
    .select('id')
    .eq('lender_id', lenderId)
    .eq('worker_id', workerId)
    .gte('used_at', since)
    .limit(1)

  if (error) {
    console.error('[lender-quota] dedupe query failed', error)
    return false
  }
  return (data?.length ?? 0) > 0
}
