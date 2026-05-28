import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * GET /api/score/history
 *
 * Returns Krost Score history timeline for the current user.
 * Currently returns the single latest score + any score_snapshots
 * from generated reports. Will be expanded once krost_score_history
 * table is populated.
 *
 * Query params:
 *   ?limit=12 — max entries to return (default 12)
 */
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 48)

  // Fetch latest Krost score
  const { data: krostScore } = await supabase
    .from('krost_scores')
    .select('score, tier, calculated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch existing income verification record for the consistency score timeline
  const { data: verifications } = await supabase
    .from('income_verifications')
    .select('consistency_score, annualized_income, calculated_at')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .limit(limit)

  // Fetch score snapshots from generated reports
  const { data: reportSnapshots } = await supabase
    .from('reports')
    .select('score_snapshot, created_at')
    .eq('user_id', user.id)
    .not('score_snapshot', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Build history timeline
  const timeline: Array<{
    date: string
    krostScore: number | null
    krostTier: string | null
    consistencyScore: number | null
    annualizedIncome: number | null
    source: string
  }> = []

  if (krostScore) {
    timeline.push({
      date: krostScore.calculated_at,
      krostScore: krostScore.score,
      krostTier: krostScore.tier,
      consistencyScore: null,
      annualizedIncome: null,
      source: 'krost_score',
    })
  }

  if (verifications) {
    for (const v of verifications) {
      if (v.calculated_at) {
        timeline.push({
          date: v.calculated_at,
          krostScore: null,
          krostTier: null,
          consistencyScore: v.consistency_score,
          annualizedIncome: v.annualized_income,
          source: 'income_verification',
        })
      }
    }
  }

  if (reportSnapshots) {
    for (const r of reportSnapshots) {
      if (r.score_snapshot && typeof r.score_snapshot === 'object') {
        timeline.push({
          date: r.created_at,
          krostScore: (r.score_snapshot as any).krost_score ?? null,
          krostTier: (r.score_snapshot as any).krost_tier ?? null,
          consistencyScore: (r.score_snapshot as any).consistency_score ?? null,
          annualizedIncome: (r.score_snapshot as any).annualized_income ?? null,
          source: 'report',
        })
      }
    }
  }

  // Sort by date descending, deduplicate by date rounded to second
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const deduped = timeline.filter((entry, index, self) =>
    index === self.findIndex(e =>
      Math.abs(new Date(e.date).getTime() - new Date(entry.date).getTime()) < 1000
    )
  ).slice(0, limit)

  return NextResponse.json({
    timeline: deduped,
    currentKrostScore: krostScore?.score ?? null,
    currentKrostTier: krostScore?.tier ?? null,
  })
}
