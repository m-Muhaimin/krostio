import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendEmail, resetPasswordEmail, signEmailToken } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const supabase = createServerSupabaseClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ ok: true })
    }

    const token = await signEmailToken(
      { sub: profile.id, email: normalizedEmail, purpose: 'reset_password' },
      '1h'
    )

    sendEmail(normalizedEmail, 'Reset your Krostio password', resetPasswordEmail(profile.name || 'there', token))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
