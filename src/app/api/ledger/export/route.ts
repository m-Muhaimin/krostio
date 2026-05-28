import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * GET /api/ledger/export
 *
 * Exports all ledger entries as CSV for the current user.
 * CCPA data portability requirement.
 */
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

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
