import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get monthly rollup from ledger_entries
  const { data, error } = await supabase
    .from('ledger_entries')
    .select('platform, gross_amount, net_amount, period_start, period_end, created_at')
    .eq('user_id', user.id)
    .order('period_start', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = data || [];

  if (entries.length === 0) {
    return NextResponse.json({
      total_platforms: 0,
      avg_monthly_income: 0,
      total_career_earnings: 0,
      total_entries: 0,
      monthly_breakdown: [],
      earliest_income_date: null,
      latest_income_date: null,
    });
  }

  // Compute summary
  const platforms = new Set(entries.map((e: any) => e.platform));
  const platformCount = platforms.size;

  // Group by month
  const monthlyMap = new Map<string, { gross: number; net: number; count: number; platforms: Set<string> }>();
  for (const entry of entries) {
    if (!entry.gross_amount) continue;
    const month = entry.period_start?.substring(0, 7) || 'unknown';
    const existing = monthlyMap.get(month) || { gross: 0, net: 0, count: 0, platforms: new Set() };
    existing.gross += Number(entry.gross_amount) || 0;
    existing.net += Number(entry.net_amount) || 0;
    existing.count += 1;
    existing.platforms.add(entry.platform);
    monthlyMap.set(month, existing);
  }

  const months = Array.from(monthlyMap.entries()).sort(([a], [b]) => b.localeCompare(a));
  const totalEarnings = months.reduce((sum, [, v]) => sum + v.gross, 0);
  const avgMonthly = months.length > 0 ? totalEarnings / months.length : 0;

  const monthlyBreakdown = months.map(([month, data]) => ({
    month: month + '-01',
    gross_total: data.gross,
    net_total: data.net,
    payment_count: data.count,
    platforms: data.platforms.size,
  }));

  return NextResponse.json({
    total_platforms: platformCount,
    avg_monthly_income: Math.round(avgMonthly * 100) / 100,
    total_career_earnings: totalEarnings,
    total_entries: entries.length,
    earliest_income_date: entries[entries.length - 1]?.period_start || null,
    latest_income_date: entries[0]?.period_start || null,
    monthly_breakdown: monthlyBreakdown,
  });
}
