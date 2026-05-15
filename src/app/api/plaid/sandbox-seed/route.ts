import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { plaid } from '@/lib/plaid'

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
 * Body: { access_token: string, weeks?: number }
 *
 * Injects 15-30 random gig-payout transactions per week into a Plaid sandbox Item,
 * spread across the last `weeks` weeks (default: 13 ≈ 3 months).
 * After calling this, the user should re-fetch transactions via
 * POST /api/plaid/exchange or a manual sync to populate income_records.
 *
 * ONLY works in sandbox environment.
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

  const { access_token, weeks } = await request.json()
  if (!access_token) {
    return NextResponse.json({ error: 'access_token required' }, { status: 400 })
  }

  const numWeeks = Math.min(Math.max(weeks ?? 13, 1), 26) // 1–26 weeks

  // Build transactions: 15-30 random deposits per week, ending today
  const today = new Date()
  // Plaid sandbox supports dates between 2020 and ~current
  const end = today
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
      const amount = -randBetween(platform.min, platform.max) // negative = deposit
      const dateOffset = Math.floor(Math.random() * 7)
      const date = addDays(weekStart, dateOffset)

      // Don't go past today
      if (date > end) continue

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

  // Plaid sandbox accepts up to 500 transactions per call
  let totalSeeded = 0
  const batchSize = 300
  const batches: number[] = []

  for (let i = 0; i < allTransactions.length; i += batchSize) {
    const batch = allTransactions.slice(i, i + batchSize)
    try {
      const res = await plaid.sandboxTransactionsCreate({
        access_token,
        transactions: batch,
      })
      totalSeeded += batch.length
      batches.push(batch.length)
    } catch (err: any) {
      const msg = err?.response?.data?.error_message || err?.message || 'Sandbox seed failed'
      return NextResponse.json(
        {
          error: msg,
          total_seeded: totalSeeded,
          remaining: allTransactions.length - totalSeeded,
        },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    success: true,
    total_seeded: totalSeeded,
    weeks: numWeeks,
    batches: batches.length,
    date_range: {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    },
    platforms_seeded: GIG_DEPOSITS.map((g) => g.name),
  })
}
