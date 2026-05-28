import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyKrostJwt } from './jwt'
import { createClient } from '@supabase/supabase-js'

const COOKIE_NAME = 'krost_session'

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const token = request.cookies.get(COOKIE_NAME)?.value
  let userId: string | null = null

  if (token) {
    const payload = await verifyKrostJwt(token)
    if (payload) {
      userId = payload.sub
    } else {
      // Invalid token — clear the cookie
      const domain = request.nextUrl.hostname.includes('krostio.com') ? '.krostio.com' : undefined
      let clearCookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
      if (domain) clearCookie += `; Domain=${domain}`
      supabaseResponse.headers.append('Set-Cookie', clearCookie)
    }
  }

  // Protected routes
  const protectedPaths = ['/dashboard', '/settings', '/billing']
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !userId) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Auto-create profile for new users who don't have one yet
  if (userId && token) {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile?.role) {
      // Try to extract info from JWT payload
      const payload = await verifyKrostJwt(token)
      if (payload?.email) {
        const admin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
        await admin.from('profiles').upsert({
          id: userId,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0] || 'User',
          role: 'gig_worker',
        }, { onConflict: 'id' })
      }
    }
  }

  return supabaseResponse
}
