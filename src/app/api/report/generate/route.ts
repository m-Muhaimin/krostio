import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateReport } from '@/lib/pdf-render'

/**
 * POST /api/report/generate
 * Creates a PDF income verification report for the authenticated user.
 * Requires an active subscription (Pro) OR passes through free-tier limit check.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const isPro = profile.subscription_status === 'active' || profile.subscription_status === 'trialing'
    const isFree = profile.subscription_status === 'free' || profile.subscription_status === null

    if (isFree) {
      // Free tier: check if user has generated a report before
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count && count >= 1) {
        return NextResponse.json(
          { error: 'Free tier limit reached. Upgrade to Pro for unlimited reports.', upgrade: true },
          { status: 402 }
        )
      }
    }

    const result = await generateReport(user.id)

    return NextResponse.json({
      ...result,
      message: isFree
        ? 'Free report generated. Upgrade to Pro for unlimited reports and longer share links.'
        : 'Report generated successfully.',
    })
  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}
