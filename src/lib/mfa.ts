import { generateSecret, generateURI, verifySync } from 'otplib'
import { toDataURL } from 'qrcode'
import { SignJWT, jwtVerify } from 'jose'

const APP_NAME = 'Krostio'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

export function generateMFASecret(email: string) {
  const secret = generateSecret(20)
  const uri = generateURI({ issuer: APP_NAME, label: email, secret, algorithm: 'sha1', digits: 6, period: 30 })
  return { secret, uri }
}

export async function generateQRCode(uri: string) {
  return toDataURL(uri, { width: 240, margin: 2 })
}

export function verifyMFAToken(token: string, secret: string): boolean {
  try {
    return verifySync({ token, secret, strategy: 'totp' })
  } catch {
    return false
  }
}

export async function signMfaChallengeToken(payload: { sub: string; email: string }) {
  return new SignJWT({ ...payload, aud: 'mfa_challenge', role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .setSubject(payload.sub)
    .sign(getSecret())
}

export async function signMfaStepupToken(payload: { sub: string }) {
  return new SignJWT({ ...payload, aud: 'mfa_stepup', role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .setSubject(payload.sub)
    .sign(getSecret())
}

export async function verifyMfaChallengeToken(token: string): Promise<{ sub: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    if (payload.aud !== 'mfa_challenge') return null
    return { sub: payload.sub as string, email: payload.email as string }
  } catch {
    return null
  }
}

export async function verifyMfaStepupToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    if (payload.aud !== 'mfa_stepup') return null
    return { sub: payload.sub as string }
  } catch {
    return null
  }
}
