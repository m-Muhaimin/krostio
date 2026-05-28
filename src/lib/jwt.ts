import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

export type KrostJwtPayload = {
  sub: string
  email: string
  aud: string
  role: string
  name?: string
  picture?: string
}

export async function signKrostJwt(
  payload: KrostJwtPayload,
  expiresIn = '7d'
): Promise<string> {
  return new SignJWT({ ...payload, aud: 'authenticated', role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setSubject(payload.sub)
    .sign(getSecret())
}

export async function verifyKrostJwt(
  token: string
): Promise<KrostJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ['HS256'],
    })
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      aud: payload.aud as string,
      role: payload.role as string,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
    }
  } catch {
    return null
  }
}
