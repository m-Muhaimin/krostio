import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { email, score, platform, role } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from('waitlist').insert({
      email,
      score_estimate: score,
      source_platform: platform,
      role: role || 'gig_worker',
    })

    if (error) {
      // Duplicate email is not an error for the user
      if (error.code === '23505') {
        return NextResponse.json({ success: true, existing: true })
      }
      console.error('[Waitlist] Insert error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Waitlist] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
