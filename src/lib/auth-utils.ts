import { cookies } from 'next/headers'
import { verifyKrostJwt, type KrostJwtPayload } from './jwt'

export { signKrostJwt, verifyKrostJwt } from './jwt'

const COOKIE_NAME = 'krost_session'

export function serializeKrostSessionCookie(token: string, maxAgeSeconds: number): string {
  const isProduction =
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'production'
  const domain = isProduction ? '.krostio.com' : undefined

  let cookie = `${encodeURIComponent(COOKIE_NAME)}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax`
  if (domain) cookie += `; Domain=${domain}`
  if (isProduction) cookie += '; Secure'
  return cookie
}

export function serializeClearKrostSessionCookie(): string {
  const isProduction =
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'production'
  const domain = isProduction ? '.krostio.com' : undefined

  let cookie = `${encodeURIComponent(COOKIE_NAME)}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
  if (domain) cookie += `; Domain=${domain}`
  if (isProduction) cookie += '; Secure'
  return cookie
}

export async function getCurrentUser(): Promise<{
  user: KrostJwtPayload & { id: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const payload = await verifyKrostJwt(token)
    if (!payload) return null

    return {
      user: {
        ...payload,
        id: payload.sub,
      },
    }
  } catch {
    return null
  }
}
