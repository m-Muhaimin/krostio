import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { hashPassword } from '@/lib/password-utils'
import { verifyEmailToken } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const payload = await verifyEmailToken(token)
    if (!payload || payload.purpose !== 'reset_password') {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    const passwordHash = hashPassword(password)
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('profiles')
      .update({ password_hash: passwordHash })
      .eq('id', payload.sub)

    if (error) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
