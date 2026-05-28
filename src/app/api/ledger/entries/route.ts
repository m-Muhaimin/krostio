import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * GET /api/ledger/entries
 *
 * Returns paginated ledger entries for the current user.
 *
 * Query params:
 *   ?page=1    — page number (default 1)
 *   ?limit=50  — entries per page (default 50, max 200)
 *   ?platform=uber — filter by platform (optional)
 *   ?from=2026-01-01 — start date filter (optional)
 *   ?to=2026-12-31 — end date filter (optional)
 *
 * POST /api/ledger/entries
 *
 * Create a manual ledger entry (for CSV upload fallback).
 */
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
  const platform = searchParams.get('platform')
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')

  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('ledger_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  if (platform) {
    query = query.eq('platform', platform)
  }
  if (fromDate) {
    query = query.gte('period_start', fromDate)
  }
  if (toDate) {
    query = query.lte('period_end', toDate)
  }

  const { data: entries, count, error } = await query
    .order('period_start', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    entries: entries || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: count ? Math.ceil(count / limit) : 0,
    },
  })
}

/**
 * POST /api/ledger/entries
 *
 * Create a manual ledger entry (CSV upload or manual input).
 */
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  const body = await request.json()
  const { platform, gross_amount, net_amount, period_start, period_end, payment_date, category, platform_ref_id } = body

  if (!platform || gross_amount == null || !period_start) {
    return NextResponse.json(
      { error: 'platform, gross_amount, and period_start are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('ledger_entries')
    .insert({
      user_id: user.id,
      platform,
      gross_amount,
      net_amount: net_amount ?? gross_amount,
      period_start,
      period_end: period_end ?? period_start,
      payment_date: payment_date ?? null,
      category: category ?? null,
      platform_ref_id: platform_ref_id ?? null,
      source: 'manual',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry: data }, { status: 201 })
}
