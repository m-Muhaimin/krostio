import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { signKrostJwt, serializeKrostSessionCookie } from '@/lib/auth-utils'
import { verifyMFAToken, verifyMfaChallengeToken } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  try {
    const { token: mfaCode } = await request.json()
    if (!mfaCode) return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })

    const challengeToken = request.cookies.get('mfa_challenge')?.value
    if (!challengeToken) {
      return NextResponse.json({ error: 'No challenge session found. Please sign in again.' }, { status: 401 })
    }

    const challenge = await verifyMfaChallengeToken(challengeToken)
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge expired. Please sign in again.' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('mfa_secret, name')
      .eq('id', challenge.sub)
      .single()

    if (!profile?.mfa_secret) {
      return NextResponse.json({ error: 'MFA is not configured' }, { status: 400 })
    }

    if (!verifyMFAToken(mfaCode, profile.mfa_secret)) {
      return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 })
    }

    const jwt = await signKrostJwt({
      sub: challenge.sub,
      email: challenge.email,
      name: profile.name || undefined,
    })

    const redirectUrl = new URL('/dashboard', request.url)
    const response = NextResponse.redirect(redirectUrl)

    response.cookies.set('krost_session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    response.cookies.delete('mfa_challenge')

    return response
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
