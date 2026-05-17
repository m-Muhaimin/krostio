import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Papa from 'papaparse';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('income_records')
    .select('id, platform, gross_earnings, net_earnings, fee_amount, currency, period_start, period_end, created_at')
    .eq('user_id', user.id)
    .order('period_start', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = data || [];

  // Map to clean field names for CSV
  const rows = entries.map((e: any) => ({
    ID: e.id,
    Platform: e.platform,
    Gross_Earnings: e.gross_earnings ?? 0,
    Net_Earnings: e.net_earnings ?? 0,
    Fee_Amount: e.fee_amount ?? 0,
    Currency: e.currency || 'USD',
    Period_Start: e.period_start,
    Period_End: e.period_end,
    Recorded_At: e.created_at,
  }));

  const csv = Papa.unparse(rows, { header: true });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="krost-ledger-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
