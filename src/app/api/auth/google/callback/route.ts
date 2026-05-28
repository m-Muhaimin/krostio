import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/google-oauth'
import { signKrostJwt, serializeKrostSessionCookie } from '@/lib/auth-utils'
import { createClient } from '@supabase/supabase-js'

async function getGoogleUserInfo(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Google userinfo failed: ${await res.text()}`)
  return res.json() as Promise<{
    sub: string
    email: string
    name: string
    picture: string
    email_verified: boolean
  }>
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=google_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/login?error=invalid_request`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('google_oauth_state')?.value
  const codeVerifier = cookieStore.get('google_code_verifier')?.value
  const next = cookieStore.get('oauth_next')?.value || '/dashboard'

  cookieStore.delete('google_oauth_state')
  cookieStore.delete('google_code_verifier')
  cookieStore.delete('oauth_next')

  if (!storedState || !codeVerifier || state !== storedState) {
    return NextResponse.redirect(`${origin}/login?error=state_mismatch`)
  }

  let tokens
  try {
    tokens = await exchangeCodeForTokens(code, codeVerifier)
  } catch (err) {
    console.error('[google/callback] token exchange failed:', err)
    return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`)
  }

  let googleUser
  try {
    googleUser = await getGoogleUserInfo(tokens.access_token)
  } catch (err) {
    console.error('[google/callback] userinfo failed:', err)
    return NextResponse.redirect(`${origin}/login?error=userinfo_failed`)
  }

  if (!googleUser.email_verified) {
    return NextResponse.redirect(`${origin}/login?error=email_not_verified`)
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Create or update user in the profiles table directly.
  // We use the service-role client so we don't depend on Supabase Auth.
  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existing } = await db
    .from('profiles')
    .select('id, email, role')
    .eq('email', googleUser.email)
    .single()

  let userId: string

  if (existing) {
    userId = existing.id
    await db.from('profiles').update({
      name: googleUser.name,
      avatar_url: googleUser.picture,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)
  } else {
    const { data: newProfile, error: createError } = await db
      .from('profiles')
      .insert({
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.picture,
        role: 'gig_worker',
      })
      .select('id')
      .single()

    if (createError || !newProfile?.id) {
      console.error('[google/callback] profile insert failed:', createError)
      return NextResponse.redirect(`${origin}/login?error=user_creation_failed`)
    }

    userId = newProfile.id
  }

  // Sign our own JWT — completely provider-agnostic
  const token = await signKrostJwt({
    sub: userId,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    aud: 'authenticated',
    role: 'authenticated',
  })

  const sessionCookie = serializeKrostSessionCookie(token, 7 * 24 * 60 * 60)

  const headers = new Headers()
  headers.set('Location', `${origin}${next}`)
  headers.append('Set-Cookie', sessionCookie)

  return new Response(null, { status: 302, headers })
}
