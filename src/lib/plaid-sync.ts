import { plaid } from './plaid'
import type { Transaction } from 'plaid'
import type { GigPlatform } from '@/types'

/**
 * Map Plaid merchant/category data to our GigPlatform enum.
 */
const PLATFORM_PATTERNS: Array<{ pattern: RegExp; platform: GigPlatform }> = [
  { pattern: /\bUBER\s*EATS\b|UBEREATS/i, platform: 'ubereats' },
  { pattern: /\bUBER\b/i, platform: 'uber' },
  { pattern: /\bLYFT\b/i, platform: 'lyft' },
  { pattern: /DOORDASH/i, platform: 'doordash' },
  { pattern: /GRUBHUB/i, platform: 'grubhub' },
  { pattern: /INSTACART/i, platform: 'instacart' },
  { pattern: /FIVERR/i, platform: 'fiverr' },
  { pattern: /UPWORK/i, platform: 'upwork' },
  { pattern: /FREELANCER/i, platform: 'freelancer' },
  { pattern: /\bTURO\b/i, platform: 'turo' },
  { pattern: /AIRBNB/i, platform: 'airbnb' },
  { pattern: /AMAZON\s*FLEX|AMZN\s*FLEX/i, platform: 'amazon_flex' },
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

export type LedgerRow = {
  user_id: string
  platform: GigPlatform
  gross_amount: number
  net_amount: number
  currency: string
  period_start: string
  period_end: string
  payment_date: string
  category: string
  platform_ref_id: string
  source: string
}

/**
 * Pull transactions for an item, filter to gig-platform deposits,
 * and aggregate into weekly income_records + ledger_entries rows.
 */
export async function fetchGigIncomeForItem(
  accessToken: string,
  userId: string,
  daysBack = 90
): Promise<{ incomeRows: IncomeRow[], ledgerRows: LedgerRow[] }> {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - daysBack)

  const startDate = start.toISOString().slice(0, 10)
  const endDate = end.toISOString().slice(0, 10)

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
    if (offset > 5000) break
  }

  type Bucket = {
    platform: GigPlatform
    weekStart: string
    weekEnd: string
    gross: number
    count: number
  }
  const buckets = new Map<string, Bucket>()
  const ledgerRows: LedgerRow[] = []

  for (const tx of all) {
    if (tx.amount >= 0) continue
    const platform = detectPlatform(tx.merchant_name ?? null, tx.name)
    if (!platform) continue

    const amount = Math.abs(tx.amount)

    ledgerRows.push({
      user_id: userId,
      platform,
      gross_amount: amount,
      net_amount: amount,
      currency: tx.iso_currency_code || 'USD',
      period_start: tx.date,
      period_end: tx.date,
      payment_date: tx.date,
      category: tx.personal_finance_category?.primary || 'gig_payout',
      platform_ref_id: tx.transaction_id,
      source: 'plaid',
    })

    const txDate = new Date(tx.date)
    const day = txDate.getUTCDay()
    const diffToMonday = (day + 6) % 7
    const weekStart = new Date(txDate)
    weekStart.setUTCDate(weekStart.getUTCDate() - diffToMonday)
    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6)

    const weekStartIso = weekStart.toISOString().slice(0, 10)
    const weekEndIso = weekEnd.toISOString().slice(0, 10)
    const key = `${platform}|${weekStartIso}`

    const existing = buckets.get(key)
    if (existing) {
      existing.gross += amount
      existing.count += 1
    } else {
      buckets.set(key, {
        platform,
        weekStart: weekStartIso,
        weekEnd: weekEndIso,
        gross: amount,
        count: 1,
      })
    }
  }

  const incomeRows = Array.from(buckets.values()).map((b) => ({
    user_id: userId,
    platform: b.platform,
    period_start: b.weekStart,
    period_end: b.weekEnd,
    gross_earnings: Math.round(b.gross * 100) / 100,
    net_earnings: Math.round(b.gross * 100) / 100,
    trips_completed: b.count,
    hours_active: 0,
    rating: null,
    currency: 'USD',
  }))

  return { incomeRows, ledgerRows }
}

/**
 * syncPlaidItem — used by webhooks and manual re-sync.
 * Fetches income + ledger rows, writes to DB, recalculates scores.
 */
export async function syncPlaidItem(
  accessToken: string,
  userId: string,
  itemId: string,
  institution?: { name?: string; institution_id?: string }
) {
  const { incomeRows, ledgerRows } = await fetchGigIncomeForItem(accessToken, userId, 90)

  // Dynamically import admin client to avoid top-level module issues
  const { createClient } = await import('@supabase/supabase-js')
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  if (incomeRows.length > 0) {
    await admin.from('income_records').insert(incomeRows)
  }
  if (ledgerRows.length > 0) {
    await admin.from('ledger_entries').insert(ledgerRows)
  }

  const platforms = Array.from(new Set(ledgerRows.map((r) => r.platform)))

  // Recalculate Krost score
  const { data: allIncome } = await admin
    .from('income_records')
    .select('*')
    .eq('user_id', userId)

  let score = null
  if (allIncome && allIncome.length > 0) {
    // Simplified inline scoring
    const total = allIncome.reduce((s: number, r: any) => s + (r.gross_earnings || 0), 0)
    const months = Math.max(1, allIncome.length / 4)
    const monthlyAvg = total / months
    score = { consistency_score: Math.min(100, Math.round((monthlyAvg / 5000) * 100)), annualized_income: total }
  }

  return {
    rowsAdded: incomeRows.length + ledgerRows.length,
    platformsDetected: platforms,
    score,
  }
}
