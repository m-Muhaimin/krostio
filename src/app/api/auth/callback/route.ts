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
  const roleParam = searchParams.get('role') as 'gig_worker' | 'lender' | null

  if (code) {
    const cookieStore = await cookies()
    const onboardingUrl = new URL('/onboarding', origin)
    onboardingUrl.searchParams.set('next', next)

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
        // Existing user — redirect to their dashboard
        if (profile.role === 'lender') {
          redirectUrl = `${origin}/dashboard/lender`
        } else {
          redirectUrl = `${origin}/dashboard/worker`
        }
      } else if (roleParam) {
        // New OAuth signup with role intent — auto-create profile &
        // redirect directly to the correct dashboard, skipping onboarding.
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
            role: roleParam,
          })
        if (insertError) {
          // Profile may already exist if race with another OAuth callback
          console.warn('[auth/callback] profile insert:', insertError.message)
        }

        // Also mark onboarding as completed in user_metadata so the
        // middleware doesn't force onboarding on the first page load.
        await supabase.auth.updateUser({
          data: { onboarding_completed: true, role: roleParam },
        })

        redirectUrl =
          roleParam === 'lender'
            ? `${origin}/dashboard/lender`
            : `${origin}/dashboard/worker`
      } else {
        // New user without role intent — send to onboarding to pick role
        redirectUrl = onboardingUrl.toString()
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
