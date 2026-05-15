import { plaid } from './plaid'
import { getSupabaseAdmin } from './supabase-admin'
import { calculateCreditScore } from './scoring-engine'
import type { Transaction } from 'plaid'
import type { GigPlatform, IncomeRecord } from '@/types'

// ──────────────────────────────────────────────
// Platform detection from Plaid merchant names
// ──────────────────────────────────────────────

const PLATFORM_PATTERNS: Array<{ pattern: RegExp; platform: GigPlatform }> = [
  // Rideshare + delivery
  { pattern: /\bUBER\s*EATS\b|UBEREATS/i, platform: 'ubereats' },
  { pattern: /\bUBER\b/i, platform: 'uber' },
  { pattern: /\bLYFT\b/i, platform: 'lyft' },
  { pattern: /DOORDASH/i, platform: 'doordash' },
  { pattern: /GRUBHUB/i, platform: 'grubhub' },
  { pattern: /INSTACART/i, platform: 'instacart' },
  // Freelance + creative
  { pattern: /FIVERR/i, platform: 'fiverr' },
  { pattern: /UPWORK/i, platform: 'upwork' },
  { pattern: /FREELANCER/i, platform: 'freelancer' },
  // Asset rental
  { pattern: /\bTURO\b/i, platform: 'turo' },
  { pattern: /AIRBNB/i, platform: 'airbnb' },
  { pattern: /AMAZON\s*FLEX|AMZN\s*FLEX/i, platform: 'amazon_flex' },
  // Retail / marketplace sellers
  { pattern: /SHOPIFY/i, platform: 'shopify' },
  { pattern: /\bETSY\b/i, platform: 'etsy' },
  { pattern: /MERCARI/i, platform: 'mercari' },
  { pattern: /POSHMARK/i, platform: 'poshmark' },
  { pattern: /\bEBAY\b|EBAY\s*COMMERCE/i, platform: 'ebay' },
  { pattern: /DEPOP/i, platform: 'depop' },
  { pattern: /STOCKX/i, platform: 'stockx' },
  { pattern: /WHATNOT/i, platform: 'whatnot' },
]

function detectPlatform(merchantName: string | null, name: string): GigPlatform | null {
  const text = `${merchantName || ''} ${name}`.trim()
  for (const { pattern, platform } of PLATFORM_PATTERNS) {
    if (pattern.test(text)) return platform
  }
  return null
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type IncomeRow = {
  user_id: string
  platform: GigPlatform
  period_start: string
  period_end: string
  gross_earnings: number
  net_earnings: number
  trips_completed: number
  hours_active: number
  rating: number | null
  currency: string
}

export type SyncResult = {
  rowsAdded: number
  platformsDetected: GigPlatform[]
  score: Record<string, any> | null
}

// ──────────────────────────────────────────────
// Fetch transactions from Plaid and bucket by
// platform + ISO week
// ──────────────────────────────────────────────

export async function fetchGigIncomeForItem(
  accessToken: string,
  userId: string,
  daysBack = 90
): Promise<IncomeRow[]> {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - daysBack)

  const startDate = start.toISOString().slice(0, 10)
  const endDate = end.toISOString().slice(0, 10)

  // Paginate through Plaid transactions
  const all: Transaction[] = []
  let offset = 0
  const pageSize = 500

  while (true) {
    const res = await plaid.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: { count: pageSize, offset },
    })
    all.push(...res.data.transactions)
    if (all.length >= res.data.total_transactions) break
    offset += pageSize
    if (offset > 5000) break // safety cap
  }

  // Filter to gig-platform deposits (negative amount = credit) and bucket by week+platform
  type Bucket = { platform: GigPlatform; weekStart: string; weekEnd: string; gross: number; count: number }
  const buckets = new Map<string, Bucket>()

  for (const tx of all) {
    if (tx.amount >= 0) continue // skip outgoing
    const platform = detectPlatform(tx.merchant_name ?? null, tx.name)
    if (!platform) continue

    const txDate = new Date(tx.date)
    // ISO week start (Monday)
    const day = txDate.getUTCDay() // 0=Sun
    const diffToMonday = (day + 6) % 7
    const weekStart = new Date(txDate)
    weekStart.setUTCDate(weekStart.getUTCDate() - diffToMonday)
    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6)

    const weekStartIso = weekStart.toISOString().slice(0, 10)
    const weekEndIso = weekEnd.toISOString().slice(0, 10)
    const key = `${platform}|${weekStartIso}`

    const existing = buckets.get(key)
    const amount = Math.abs(tx.amount)
    if (existing) {
      existing.gross += amount
      existing.count += 1
    } else {
      buckets.set(key, { platform, weekStart: weekStartIso, weekEnd: weekEndIso, gross: amount, count: 1 })
    }
  }

  return Array.from(buckets.values()).map((b) => ({
    user_id: userId,
    platform: b.platform,
    period_start: b.weekStart,
    period_end: b.weekEnd,
    gross_earnings: Math.round(b.gross * 100) / 100,
    net_earnings: Math.round(b.gross * 100) / 100, // Plaid only shows net deposits
    trips_completed: b.count,
    hours_active: 0,
    rating: null,
    currency: 'USD',
  }))
}

// ──────────────────────────────────────────────
// Reusable sync: fetch Plaid data, write to
// income_records + ledger_entries, recalculate
// score. Used by both exchange and webhook flows.
// ──────────────────────────────────────────────

export async function syncPlaidItem(
  accessToken: string,
  userId: string,
  itemId: string,
  institution?: { name?: string; institution_id?: string }
): Promise<SyncResult> {
  const supabase = getSupabaseAdmin() as any

  // 1. Fetch income data from Plaid
  const incomeRows = await fetchGigIncomeForItem(accessToken, userId, 90)

  // 2. Detect platforms
  const platforms = Array.from(new Set(incomeRows.map((r) => r.platform)))
  const platformsToRecord = platforms.length > 0 ? platforms : ['other' as const]

  // 3. Upsert platform_connections
  for (const platform of platformsToRecord) {
    await supabase.from('platform_connections').upsert(
      {
        user_id: userId,
        platform,
        platform_user_id: `${userId}_${platform}`,
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

  // 4. Write to income_records
  let insertedCount = 0
  if (incomeRows.length > 0) {
    const { count } = await supabase.from('income_records').upsert(
      // Use platform + week as dedup key — upsert to avoid duplicates
      incomeRows.map((r) => ({
        ...r,
        // Use a stable ID format so repeated syncs don't create duplicates
        id: `${itemId}_${r.platform}_${r.period_start}`,
      })),
      { onConflict: 'id', ignoreDuplicates: true }
    )
    insertedCount = count ?? incomeRows.length

    // 5. Also write to ledger_entries (v2 table) in parallel
    const ledgerRows = incomeRows.map((r) => ({
      user_id: r.user_id,
      platform: r.platform,
      gross_amount: r.gross_earnings,
      net_amount: r.net_earnings,
      currency: r.currency,
      period_start: r.period_start,
      period_end: r.period_end,
      payment_date: r.period_end,
      category: detectCategory(r.platform),
      platform_ref_id: `${itemId}_${r.platform}_${r.period_start}`,
      verified_at: new Date().toISOString(),
      source: 'plaid' as const,
    }))

    await supabase.from('ledger_entries').upsert(ledgerRows, {
      onConflict: 'user_id,platform,platform_ref_id',
      ignoreDuplicates: true,
    })
  }

  // 6. Recalculate score
  let score = null
  const { data: allIncome } = await supabase
    .from('income_records')
    .select('*')
    .eq('user_id', userId)

  if (allIncome && allIncome.length > 0) {
    try {
      const calc = calculateCreditScore(allIncome as IncomeRecord[], userId)
      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      await supabase.from('income_verifications').upsert(
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
      // not enough data — score stays null
    }
  }

  return {
    rowsAdded: insertedCount,
    platformsDetected: platformsToRecord,
    score,
  }
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  uber: 'rides',
  lyft: 'rides',
  ubereats: 'delivery',
  doordash: 'delivery',
  grubhub: 'delivery',
  instacart: 'delivery',
  fiverr: 'freelance',
  upwork: 'freelance',
  freelancer: 'freelance',
  turo: 'flex',
  airbnb: 'flex',
  amazon_flex: 'delivery',
  shopify: 'marketplace',
  etsy: 'marketplace',
  mercari: 'marketplace',
  poshmark: 'marketplace',
  ebay: 'marketplace',
  depop: 'marketplace',
  stockx: 'marketplace',
  whatnot: 'marketplace',
}

function detectCategory(platform: GigPlatform): string {
  return CATEGORY_MAP[platform] || 'other'
}
