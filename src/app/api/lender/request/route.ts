import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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

  const { worker_id } = await request.json()

  if (!worker_id) {
    return NextResponse.json({ error: 'Worker ID required' }, { status: 400 })
  }

  // Check if request already exists
  const { data: existing } = await supabase
    .from('lender_requests')
    .select('*')
    .eq('lender_id', user.id)
    .eq('worker_id', worker_id)
    .single()

  if (existing) {
    return NextResponse.json({
      message: 'Request already exists',
      request: existing,
    })
  }

  const { data: request_data, error } = await supabase
    .from('lender_requests')
    .insert({
      lender_id: user.id,
      worker_id,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ request: request_data })
}

// GET: list pending requests for a worker
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

  // Workers see incoming requests, lenders see outgoing
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'lender') {
    const { data: requests } = await supabase
      .from('lender_requests')
      .select('*')
      .eq('lender_id', user.id)
      .order('requested_at', { ascending: false })

    return NextResponse.json({ requests })
  }

  const { data: requests } = await supabase
    .from('lender_requests')
    .select('*, lender:lender_id(name, email)')
    .eq('worker_id', user.id)
    .order('requested_at', { ascending: false })

  return NextResponse.json({ requests })
}

// PATCH: approve or deny a request
export async function PATCH(request: NextRequest) {
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

  const { request_id, status } = await request.json()

  if (!['approved', 'denied'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('lender_requests')
    .update({ status })
    .eq('id', request_id)
    .eq('worker_id', user.id) // only the worker can approve/deny
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ request: data })
}
