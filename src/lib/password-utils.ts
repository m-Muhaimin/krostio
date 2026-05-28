import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  const hash = scryptSync(password, salt, 64).toString('hex')
  const hashBuf = Buffer.from(hash, 'hex')
  const keyBuf = Buffer.from(key, 'hex')
  return hashBuf.length === keyBuf.length && timingSafeEqual(hashBuf, keyBuf)
}
