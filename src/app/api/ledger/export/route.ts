import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * GET /api/ledger/export
 *
 * Exports all ledger entries as CSV for the current user.
 * CCPA data portability requirement.
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

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('platform, gross_amount, net_amount, currency, period_start, period_end, payment_date, category, source, verified_at')
    .eq('user_id', user.id)
    .order('period_start', { ascending: false })

  if (!entries || entries.length === 0) {
    return NextResponse.json({ error: 'No ledger entries found' }, { status: 404 })
  }

  // Build CSV
  const headers = ['Platform', 'Gross Amount', 'Net Amount', 'Currency', 'Period Start', 'Period End', 'Payment Date', 'Category', 'Source', 'Verified At']
  const rows = entries.map(e => [
    e.platform,
    e.gross_amount?.toString() || '',
    e.net_amount?.toString() || '',
    e.currency || 'USD',
    e.period_start,
    e.period_end,
    e.payment_date || '',
    e.category || '',
    e.source || '',
    e.verified_at || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="krost-ledger-export-${user.id.slice(0, 8)}.csv"`,
    },
  })
}
