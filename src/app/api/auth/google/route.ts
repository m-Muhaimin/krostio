import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getGoogleAuthURL, generateState, generateCodeVerifier } from '@/lib/google-oauth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const redirect = searchParams.get('redirect') || '/dashboard'

  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const authUrl = getGoogleAuthURL(state, codeVerifier)

  const cookieStore = await cookies()

  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 300,
  }

  cookieStore.set('google_oauth_state', state, cookieOpts)
  cookieStore.set('google_code_verifier', codeVerifier, cookieOpts)
  cookieStore.set('oauth_next', redirect, { ...cookieOpts, httpOnly: false })

  return NextResponse.redirect(authUrl)
}
