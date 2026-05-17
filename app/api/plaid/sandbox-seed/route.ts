import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { categorizeEarnings } from '@/lib/plaid';

const PLATFORMS = ['uber', 'doordash', 'lyft', 'instacart', 'grubhub'];
const CATEGORIES: Record<string, string> = {
  uber: 'rides', doordash: 'delivery', lyft: 'rides',
  instacart: 'delivery', grubhub: 'delivery',
};

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(from: Date, to: Date): string {
  const d = new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
  return d.toISOString().split('T')[0];
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate 12 months of fake weekly income for 2-3 random platforms
    const now = new Date();
    const startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1); // 12 months back

    const numPlatforms = 2 + Math.floor(Math.random() * 2); // 2-3 platforms
    const userPlatforms = PLATFORMS.sort(() => Math.random() - 0.5).slice(0, numPlatforms);

    const entries: any[] = [];

    for (const platform of userPlatforms) {
      const baseWeekly = randomAmount(300, 1200);
      let trend = 1;

      // Create weekly entries for 52-ish weeks
      const d = new Date(startDate);
      while (d < now) {
        // Add some randomness and a slight upward trend
        trend += (Math.random() - 0.45) * 0.05;
        trend = Math.max(0.6, Math.min(1.5, trend));

        const weeklyGross = randomAmount(
          baseWeekly * trend * 0.7,
          baseWeekly * trend * 1.3
        );

        entries.push({
          user_id: user.id,
          platform,
          gross_earnings: weeklyGross,
          net_earnings: Math.round(weeklyGross * randomAmount(0.75, 0.95) * 100) / 100,
          period_start: randomDate(d, new Date(Math.min(d.getTime() + 7 * 86400000, now.getTime()))),
          period_end: randomDate(d, new Date(Math.min(d.getTime() + 7 * 86400000, now.getTime()))),
          currency: 'USD',
        });
        d.setDate(d.getDate() + 7);
      }
    }

    // Insert all entries in batches of 50
    let inserted = 0;
    for (let i = 0; i < entries.length; i += 50) {
      const batch = entries.slice(i, i + 50);
      const { error } = await supabase.from('income_records').insert(batch);
      if (error) {
        console.error('Batch insert error:', error);
        continue;
      }
      inserted += batch.length;
    }

    // Create platform connections for each platform
    for (const platform of userPlatforms) {
      await supabase.from('platform_connections').upsert({
        user_id: user.id,
        platform,
        provider: 'plaid_sandbox',
        last_sync_at: new Date().toISOString(),
        is_active: true,
      }, { onConflict: 'user_id,platform' });
    }

    // Trigger score recalculation
    try {
      const { data: scoreData } = await supabase
        .from('income_records')
        .select('gross_earnings, period_start, platform')
        .eq('user_id', user.id);

      if (scoreData && scoreData.length > 0) {
        // Calculate inputs for scoring engine
        const platforms = new Set(scoreData.map((e: any) => e.platform));
        const months = new Set(scoreData.map((e: any) => e.period_start?.substring(0, 7)));
        const totalGross = scoreData.reduce((sum: number, e: any) => sum + Number(e.gross_earnings || 0), 0);
        const monthCount = months.size || 1;
        const avgMonthly = totalGross / monthCount;

        // Monthly incomes for volatility calc
        const monthlyIncomes: number[] = [];
        for (const month of months) {
          const monthEntries = scoreData.filter((e: any) => e.period_start?.startsWith(month));
          const monthTotal = monthEntries.reduce((s: number, e: any) => s + Number(e.gross_earnings || 0), 0);
          monthlyIncomes.push(monthTotal);
        }
        const avg = monthlyIncomes.reduce((s: number, v: number) => s + v, 0) / monthlyIncomes.length;
        const variance = monthlyIncomes.reduce((s: number, v: number) => s + (v - avg) ** 2, 0) / monthlyIncomes.length;
        const volatility = avg > 0 ? Math.sqrt(variance) / avg : 1;

        // Consistent months
        const consistentMonths = monthlyIncomes.filter(v => v > 0).length;
        const consistency = monthCount > 0 ? consistentMonths / monthCount : 0;

        // Trajectory (simplified: compare first 6 months to last 6 months)
        const mid = Math.floor(monthlyIncomes.length / 2);
        const firstHalf = monthlyIncomes.slice(0, mid).reduce((s, v) => s + v, 0);
        const secondHalf = monthlyIncomes.slice(mid).reduce((s, v) => s + v, 0);
        const trajectory = firstHalf > 0 ? (secondHalf - firstHalf) / firstHalf / 6 : 0;

        const scoreInputs = {
          avgMonthlyIncome: avgMonthly,
          platformTenureMonths: monthCount,
          incomeVolatility: Math.min(1, volatility),
          platformDiversity: platforms.size,
          earningConsistency: Math.min(1, consistency),
          incomeTrajectory: Math.max(-0.05, Math.min(0.15, trajectory)),
          taxCompliance: Math.random() > 0.3 ? 1 : 0,
          crossPlatformGrowth: platforms.size / Math.max(monthCount, 1),
          ledgerDepth: monthCount,
        };

        // Import dynamically
        const { calculateKrostScore } = await import('@/lib/scoring-engine');
        const result = calculateKrostScore(scoreInputs);

        await supabase.from('krost_scores').insert({
          user_id: user.id,
          score: result.total,
          score_tier: result.tier,
          breakdown: scoreInputs,
          factors: result.factors,
        });
      }
    } catch (scoreErr) {
      console.error('Score calculation error (non-fatal):', scoreErr);
    }

    return NextResponse.json({
      message: `Seeded ${inserted} income entries across ${userPlatforms.length} platforms`,
      platforms: userPlatforms,
      entriesCreated: inserted,
    });
  } catch (error: any) {
    console.error('Sandbox seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed sandbox data' },
      { status: 500 }
    );
  }
}
