import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * GET /api/ledger/summary
 *
 * Returns monthly rollup of ledger entries across all platforms.
 * Queries ledger_monthly materialized view for performance.
 *
 * Query params:
 *   ?months=12  — number of trailing months (default 12, max 48)
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const months = Math.min(parseInt(searchParams.get('months') || '12', 10), 48)

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)

  // Try materialized view first, fall back to live query
  let monthlyData: Array<{
    user_id: string
    platform: string
    month: string
    gross_total: number
    net_total: number
    payment_count: number
  }> = []

  const { data: mvData, error: mvError } = await supabase
    .from('ledger_monthly')
    .select('*')
    .eq('user_id', user.id)
    .gte('month', cutoff.toISOString().slice(0, 10))
    .order('month', { ascending: false })

  if (!mvError && mvData && mvData.length > 0) {
    monthlyData = mvData
  } else {
    // Fall back to live aggregation from ledger_entries
    const { data: entries } = await supabase
      .from('ledger_entries')
      .select('platform, gross_amount, net_amount, period_start')
      .eq('user_id', user.id)
      .gte('period_start', cutoff.toISOString().slice(0, 10))
      .order('period_start', { ascending: false })

    if (entries) {
      const grouped = new Map<string, {
        gross_total: number
        net_total: number
        payment_count: number
        platforms: Set<string>
      }>()

      for (const e of entries) {
        const monthKey = e.period_start.slice(0, 7)
        if (!grouped.has(monthKey)) {
          grouped.set(monthKey, { gross_total: 0, net_total: 0, payment_count: 0, platforms: new Set() })
        }
        const group = grouped.get(monthKey)!
        group.gross_total += Number(e.gross_amount) || 0
        group.net_total += Number(e.net_amount) || 0
        group.payment_count++
        group.platforms.add(e.platform)
      }

      monthlyData = Array.from(grouped.entries())
        .map(([month, data]) => ({
          user_id: user.id,
          platform: Array.from(data.platforms).join(','),
          month,
          gross_total: data.gross_total,
          net_total: data.net_total,
          payment_count: data.payment_count,
        }))
        .sort((a, b) => b.month.localeCompare(a.month))
    }
  }

  // Compute total aggregates
  const totals = monthlyData.reduce(
    (acc, m) => ({
      gross_total: acc.gross_total + Number(m.gross_total),
      net_total: acc.net_total + Number(m.net_total),
      total_payments: acc.total_payments + m.payment_count,
      total_months: monthlyData.length,
    }),
    { gross_total: 0, net_total: 0, total_payments: 0, total_months: 0 }
  )

  // Platform-level summary
  const platformSummary = new Map<string, { gross_total: number; net_total: number; months_active: Set<string> }>()
  for (const m of monthlyData) {
    const platforms = m.platform.split(',')
    for (const p of platforms) {
      if (!platformSummary.has(p)) {
        platformSummary.set(p, { gross_total: 0, net_total: 0, months_active: new Set() })
      }
      const pData = platformSummary.get(p)!
      pData.gross_total += Number(m.gross_total) / platforms.length
      pData.net_total += Number(m.net_total) / platforms.length
      pData.months_active.add(m.month)
    }
  }

  const platforms = Array.from(platformSummary.entries()).map(([name, data]) => ({
    name,
    gross_total: Math.round(data.gross_total * 100) / 100,
    net_total: Math.round(data.net_total * 100) / 100,
    months_active: data.months_active.size,
  }))

  return NextResponse.json({
    monthly: monthlyData,
    totals: {
      ...totals,
      gross_total: Math.round(totals.gross_total * 100) / 100,
      net_total: Math.round(totals.net_total * 100) / 100,
    },
    platforms,
  })
}
