import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const workerId = searchParams.get('worker_id')

  // Get the user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // If lender, check if they have permission to view this worker's score
  if (profile.role === 'lender') {
    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID required' }, { status: 400 })
    }

    // Check for approved request
    const { data: request } = await supabase
      .from('lender_requests')
      .select('*')
      .eq('lender_id', user.id)
      .eq('worker_id', workerId)
      .eq('status', 'approved')
      .single()

    if (!request) {
      return NextResponse.json(
        { error: 'No approved access request. Ask the worker to share their score.' },
        { status: 403 }
      )
    }

    const { data: score } = await supabase
      .from('credit_scores')
      .select('*')
      .eq('user_id', workerId)
      .single()

    return NextResponse.json({ score, access_level: 'lender' })
  }

  // Gig worker - return their own score
  const { data: score } = await supabase
    .from('credit_scores')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ score, access_level: 'owner' })
}
