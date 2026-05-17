import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { calculateKrostScore, getScoreTier, generateTips } from '@/lib/scoring-engine';

/**
 * POST /api/score/calculate
 * Recalculate the user's Krost Score from their income data and store it.
 * Call this when new income data arrives, or periodically to refresh.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch income entries
  const { data: entries, error: entriesError } = await supabase
    .from('income_verifications')
    .select('gross_amount, net_amount, period_start, platform')
    .eq('user_id', user.id)
    .order('period_start', { ascending: false });

  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 });
  }

  const ledgerEntries = entries || [];

  // Compute factors
  const platforms = new Set(ledgerEntries.map((e: any) => e.platform));
  const monthsSet = new Set(ledgerEntries.map((e: any) => e.period_start?.substring(0, 7)));
  const totalMonths = monthsSet.size;

  // Monthly breakdown
  const monthlyMap = new Map<string, { gross: number; net: number; count: number }>();
  for (const e of ledgerEntries) {
    const m = e.period_start?.substring(0, 7) || 'unknown';
    const existing = monthlyMap.get(m) || { gross: 0, net: 0, count: 0 };
    existing.gross += Number(e.gross_amount) || 0;
    existing.net += Number(e.net_amount) || 0;
    existing.count += 1;
    monthlyMap.set(m, existing);
  }

  const monthlyBreakdown = Array.from(monthlyMap.entries())
    .map(([month, d]) => ({
      month: month + '-01',
      gross_total: d.gross,
      net_total: d.net,
      payment_count: d.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const totalEarnings = ledgerEntries.reduce((sum: number, e: any) => sum + (Number(e.gross_amount) || 0), 0);
  const avgMonthly = totalMonths > 0 ? totalEarnings / totalMonths : 0;

  // Volatility
  const monthlyValues = monthlyBreakdown.map(m => m.gross_total);
  const mean = monthlyValues.reduce((a, b) => a + b, 0) / (monthlyValues.length || 1);
  const variance = monthlyValues.reduce((sq, v) => sq + (v - mean) ** 2, 0) / (monthlyValues.length || 1);
  const volatility = mean > 0 ? Math.sqrt(variance) / mean : 0;

  const scoreResult = calculateKrostScore({
    avgMonthlyIncome: avgMonthly,
    platformTenureMonths: totalMonths,
    incomeVolatility: Math.min(1, volatility),
    platformDiversity: platforms.size,
    earningConsistency: monthlyBreakdown.filter(m => m.gross_total > 0).length / (monthlyBreakdown.length || 1),
    incomeTrajectory: 0.05,
    taxCompliance: 0,
    crossPlatformGrowth: platforms.size / Math.max(1, totalMonths),
    ledgerDepth: totalMonths,
  });

  // Store score
  const admin = createAdminClient();
  const { data: stored, error: insertError } = await admin
    .from('krost_scores')
    .insert({
      user_id: user.id,
      score: scoreResult.total,
      score_tier: scoreResult.tier,
      factors: scoreResult.factors as any,
      income_snapshot: {
        avgMonthlyIncome: avgMonthly,
        platformTenureMonths: totalMonths,
        platformDiversity: platforms.size,
        monthlyBreakdown,
      } as any,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const tips = generateTips(scoreResult);

  return NextResponse.json({
    score: scoreResult.total,
    tier: scoreResult.tier,
    factors: scoreResult.factors,
    income_snapshot: {
      avg_monthly_income: avgMonthly,
      total_platforms: platforms.size,
      total_career_earnings: totalEarnings,
      tenure_months: totalMonths,
    },
    tips,
    stored_id: stored.id,
    created_at: stored.created_at,
  });
}
