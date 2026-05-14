import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/dashboard', '/settings', '/billing']
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Role-based redirects
  if (user && request.nextUrl.pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // OAuth users who haven't completed onboarding — redirect to onboarding
    const onboardingDone = user.user_metadata?.onboarding_completed === true
    const isOAuthUser = user.identities?.some(
      (id: any) => id.provider === 'google'
    )
    if (isOAuthUser && !onboardingDone) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    if (profile?.role === 'lender') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/lender'
      return NextResponse.redirect(url)
    }

    if (profile?.role === 'gig_worker') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/worker'
      return NextResponse.redirect(url)
    }
  }

  // Skip onboarding if user already has a role AND completed onboarding
  if (user && request.nextUrl.pathname === '/onboarding') {
    const onboardingDone = user.user_metadata?.onboarding_completed === true

    if (onboardingDone) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'lender') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/lender'
        return NextResponse.redirect(url)
      }

      if (profile?.role === 'gig_worker') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/worker'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
