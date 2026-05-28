import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { verifyPassword } from '@/lib/password-utils'
import { signKrostJwt, serializeKrostSessionCookie } from '@/lib/auth-utils'
import { signMfaChallengeToken } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, name, password_hash, mfa_enabled')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (!profile?.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!verifyPassword(password, profile.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (profile.mfa_enabled) {
      const challengeToken = await signMfaChallengeToken({
        sub: profile.id,
        email: profile.email!,
      })

      const redirectUrl = new URL('/mfa-challenge', request.url)
      const response = NextResponse.redirect(redirectUrl)
      response.cookies.set('mfa_challenge', challengeToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 300,
      })

      return response
    }

    const token = await signKrostJwt({
      sub: profile.id,
      email: profile.email!,
      name: profile.name || undefined,
    })

    const redirectUrl = new URL('/dashboard', request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set(
      'Set-Cookie',
      serializeKrostSessionCookie(token, 7 * 24 * 60 * 60)
    )

    return response
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
