import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('krost_scores')
    .select('id, score, score_tier, breakdown, factors, calculated_at')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // No score yet — return base state
    return NextResponse.json({
      score: null,
      tier: null,
      factors: null,
      message: 'No score computed yet. Connect a platform to get started.',
    });
  }

  // Detect score tier dynamically if not stored
  const score = data.score;
  let tier = data.score_tier;
  if (!tier) {
    if (score >= 750) tier = 'Elite';
    else if (score >= 680) tier = 'Strong';
    else if (score >= 580) tier = 'Building';
    else tier = 'Emerging';
  }

  return NextResponse.json({
    id: data.id,
    score,
    tier,
    factors: data.factors,
    breakdown: data.breakdown,
    income_snapshot: data.breakdown, // alias for backward compatibility
    created_at: data.calculated_at,
  });
}
