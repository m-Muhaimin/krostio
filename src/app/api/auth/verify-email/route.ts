import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { verifyEmailToken } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const payload = await verifyEmailToken(token)
    if (!payload || payload.purpose !== 'verify_email') {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', payload.sub)

    if (error) {
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
