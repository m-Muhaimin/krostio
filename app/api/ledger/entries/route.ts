import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data, error } = await supabase
    .from('ledger_entries')
    .select('id, platform, gross_amount, net_amount, period_start, period_end, currency, created_at')
    .eq('user_id', user.id)
    .order('period_start', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to frontend-friendly field names
  const entries = (data || []).map((entry: any) => ({
    id: entry.id,
    platform: entry.platform,
    gross_amount: entry.gross_amount,
    net_amount: entry.net_amount,
    period_start: entry.period_start,
    period_end: entry.period_end,
    currency: entry.currency,
    created_at: entry.created_at,
  }));

  return NextResponse.json({
    entries,
    limit,
    offset,
  });
}
