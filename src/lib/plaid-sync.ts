import { plaid } from './plaid'
import type { Transaction } from 'plaid'
import type { GigPlatform } from '@/types'

/**
 * Map Plaid merchant/category data to our GigPlatform enum.
 * Plaid surfaces gig payouts as deposits from "UBER PAYMENTS", "DOORDASH INC", etc.
 */
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
  // Retail / marketplace sellers (typically show up as payment processor names)
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

/**
 * Pull 90 days of transactions for an item, filter to gig-platform deposits,
 * and aggregate into weekly income_records rows.
 *
 * Plaid returns negative amounts for credits/deposits, so deposits have amount < 0.
 * We flip the sign to store positive earnings.
 */
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
  type Bucket = {
    platform: GigPlatform
    weekStart: string
    weekEnd: string
    gross: number
    count: number
  }
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
      buckets.set(key, {
        platform,
        weekStart: weekStartIso,
        weekEnd: weekEndIso,
        gross: amount,
        count: 1,
      })
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
