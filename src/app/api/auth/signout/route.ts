import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function POST() {
  const cookieStore = await cookies()
  const redirectUrl = new URL('/', process.env.NEXT_PUBLIC_APP_URL).toString()

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

  await supabase.auth.signOut()

  const headers = new Headers()
  headers.set('Location', redirectUrl)
  for (const { name, value, options } of cookiesToSet) {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  }

  return new Response(null, { status: 302, headers })
}
