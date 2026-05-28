import { NextResponse } from 'next/server'
import { serializeClearKrostSessionCookie } from '@/lib/auth-utils'

export async function POST(request: Request) {
  const redirectUrl = new URL('/', process.env.NEXT_PUBLIC_APP_URL).toString()

  const headers = new Headers()
  headers.set('Location', redirectUrl)
  headers.append('Set-Cookie', serializeClearKrostSessionCookie())

  return new Response(null, { status: 302, headers })
}
