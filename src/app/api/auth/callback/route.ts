import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', {
        message: error.message,
        status: (error as { status?: number }).status,
        name: error.name,
        code,
      })
    }
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // Detect OAuth signup: user has a Google identity from this session
        const isOAuthUser = user.identities?.some(
          id => id.provider === 'google'
        )
        const onboardingDone = user.user_metadata?.onboarding_completed === true

        // Needs onboarding if:
        // 1. No profile/role at all, OR
        // 2. OAuth user who hasn't explicitly completed onboarding
        const needsOnboarding = !profile?.role ||
          (isOAuthUser && !onboardingDone)

        if (needsOnboarding) {
          const onboardingUrl = new URL('/onboarding', origin)
          onboardingUrl.searchParams.set('next', next)
          return NextResponse.redirect(onboardingUrl)
        }

        // Has role + completed onboarding → redirect to appropriate dashboard
        if (profile.role === 'lender') {
          return NextResponse.redirect(`${origin}/dashboard/lender`)
        }
        return NextResponse.redirect(`${origin}/dashboard/worker`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
