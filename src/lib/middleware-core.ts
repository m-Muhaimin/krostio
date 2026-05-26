import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Use .kristo.com so cookies work across both apex and www domains
  const cookieDomain = request.nextUrl.hostname.includes('kristo.com') ? '.kristo.com' : undefined

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
      cookieOptions: {
        domain: cookieDomain,
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

  // Auto-create profile for authenticated users who signed up via email
  // (email signup stores role in user_metadata but doesn't create a profiles row)
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role) {
      const metaRole = user.user_metadata?.role as string | undefined
      if (metaRole === 'gig_worker') {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          name:
            (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string) ||
            user.email?.split('@')[0] ||
            'User',
          role: 'gig_worker',
        })
      }
    }
  }

  return supabaseResponse
}
