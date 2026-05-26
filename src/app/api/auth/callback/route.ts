import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function serializeCookie(
  name: string,
  value: string,
  options?: Partial<{
    maxAge: number
    path: string
    domain: string
    secure: boolean
    httpOnly: boolean
    sameSite: 'lax' | 'strict' | 'none'
  }>
): string {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
  if (options?.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`
  if (options?.path) cookie += `; Path=${options.path}`
  if (options?.domain) cookie += `; Domain=${options.domain}`
  if (options?.secure) cookie += '; Secure'
  if (options?.httpOnly) cookie += '; HttpOnly'
  if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`
  return cookie
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    // Collect cookies from supabase exchange so we can write them
    // directly onto the redirect response (bypasses Next.js's
    // ResponseCookies which doesn't serialize Set-Cookie reliably
    // on redirect responses in Next.js 16).
    const cookiesToSet: { name: string; value: string; options: any }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(toSet) {
            for (const c of toSet) {
              cookiesToSet.push(c)
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', {
        message: error.message,
        status: (error as { status?: number }).status,
        name: error.name,
      })
    }

    // Use the session user directly from the exchange instead of calling getUser()
    // because the session cookies haven't propagated to the incoming request yet.
    const user = data?.session?.user ?? null

    let redirectUrl: string

    if (user) {
      // Check if a profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role) {
        // Existing user — redirect to dashboard
        redirectUrl = `${origin}/dashboard/worker`
      } else {
        // New user — create profile as gig_worker and go to dashboard
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User'

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: displayName,
            role: 'gig_worker',
          })
        if (insertError) {
          console.warn('[auth/callback] profile insert:', insertError.message)
        }

        redirectUrl = `${origin}/dashboard/worker`
      }
    } else {
      // No user after exchange — redirect home; proxy will catch if unauthenticated
      redirectUrl = `${origin}/dashboard`
    }

    // Build a native 302 redirect with Set-Cookie headers manually
    const headers = new Headers()
    headers.set('Location', redirectUrl)
    for (const { name, value, options } of cookiesToSet) {
      headers.append('Set-Cookie', serializeCookie(name, value, options))
    }

    return new Response(null, { status: 302, headers })
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
