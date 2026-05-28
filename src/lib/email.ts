import nodemailer from 'nodemailer'
import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

const FROM = process.env.SMTP_FROM || 'Krostio <hello@krost.xyz>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const APP_NAME = 'Krostio'

export async function sendEmail(to: string, subject: string, html: string) {
  const transport = getTransport()
  if (!transport) {
    console.warn('[email] SMTP not configured — skipping send to', to)
    return
  }

  try {
    await transport.sendMail({ from: FROM, to, subject, html })
    console.log('[email] sent to', to, '—', subject)
  } catch (err) {
    console.error('[email] failed to send to', to, err)
  }
}

export function signEmailToken(payload: { sub: string; email: string; purpose: string }, expiresIn = '1h') {
  return new SignJWT({ ...payload, aud: 'email', role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setSubject(payload.sub)
    .sign(getSecret())
}

export async function verifyEmailToken(token: string): Promise<{ sub: string; email: string; purpose: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    if (payload.aud !== 'email') return null
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      purpose: payload.purpose as string,
    }
  } catch {
    return null
  }
}

// ─── Templates ──────────────────────────────────────────────────────

function wrap(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f5f5f0;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:15px;line-height:1.6;color:#17171c"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px"><table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)"><tr><td style="padding:40px 36px 0;text-align:center"><img src="${APP_URL}/icon.svg" width="40" height="40" alt="${APP_NAME}" style="border-radius:8px;margin-bottom:16px"><h1 style="font-family:Inter,sans-serif;font-size:22px;font-weight:600;margin:0 0 6px;color:#17171c">${APP_NAME}</h1></td></tr>${body}<tr><td style="padding:16px 36px 32px;text-align:center;font-size:12px;color:#93939f"><p style="margin:0 0 4px">${APP_NAME} — Gig income verification platform</p><p style="margin:0">If you didn't request this email, you can safely ignore it.</p></td></tr></table></td></tr></table></body></html>`
}

function btn(href: string, label: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:20px 0"><tr><td align="center" style="background:#17171c;border-radius:40px;padding:0"><a href="${href}" style="display:inline-block;padding:12px 28px;font-family:Inter,sans-serif;font-size:14px;font-weight:500;color:#fff;text-decoration:none;border-radius:40px">${label}</a></td></tr></table>`
}

export function welcomeEmail(name: string) {
  return wrap(`<tr><td style="padding:8px 36px 0"><p style="margin:0 0 16px;font-size:16px">Hi ${name},</p><p style="margin:0 0 16px">Welcome to <strong>${APP_NAME}</strong>. Your account is ready.</p><p style="margin:0 0 16px">Connect your gig platforms — DoorDash, Uber, Upwork, and more — and we'll automatically track your income, generate professional PDF statements, and calculate your Krostio credit score.</p><p style="margin:0 0 4px">Here's what you can do next:</p><ul style="margin:4px 0 16px;padding-left:20px"><li style="margin-bottom:6px">Connect your first platform</li><li style="margin-bottom:6px">Generate an income statement PDF</li><li style="margin-bottom:6px">Share your verified income with lenders</li></ul></td></tr><tr><td align="center" style="padding:0 36px">${btn(`${APP_URL}/dashboard`, 'Go to dashboard')}</td></tr>`)
}

export function verifyEmailEmail(name: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`
  return wrap(`<tr><td style="padding:8px 36px 0"><p style="margin:0 0 16px;font-size:16px">Hi ${name},</p><p style="margin:0 0 16px">Please verify your email address to start using ${APP_NAME}.</p><p style="margin:0 0 4px">Click the button below to confirm your email:</p></td></tr><tr><td align="center" style="padding:0 36px">${btn(url, 'Verify email')}</td></tr><tr><td style="padding:8px 36px 0"><p style="margin:0;font-size:13px;color:#93939f">This link expires in 1 hour. If you didn't create an account, you can ignore this email.</p></td></tr>`)
}

export function resetPasswordEmail(name: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`
  return wrap(`<tr><td style="padding:8px 36px 0"><p style="margin:0 0 16px;font-size:16px">Hi ${name},</p><p style="margin:0 0 16px">We received a request to reset your ${APP_NAME} password.</p><p style="margin:0 0 4px">Click the button below to set a new password:</p></td></tr><tr><td align="center" style="padding:0 36px">${btn(url, 'Reset password')}</td></tr><tr><td style="padding:8px 36px 0"><p style="margin:0;font-size:13px;color:#93939f">This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p></td></tr>`)
}

export function reportSharedEmail(viewerName: string, shareUrl: string, workerName: string) {
  return wrap(`<tr><td style="padding:8px 36px 0"><p style="margin:0 0 16px;font-size:16px">Hi ${viewerName},</p><p style="margin:0 0 16px"><strong>${workerName}</strong> has shared their verified income report with you.</p><p style="margin:0 0 16px">Click below to view their professional income statement — a 24-month PDF verified through ${APP_NAME}.</p></td></tr><tr><td align="center" style="padding:0 36px">${btn(shareUrl, 'View income report')}</td></tr><tr><td style="padding:8px 36px 0"><p style="margin:0;font-size:13px;color:#93939f">This link expires on the date set by the worker. ${APP_NAME} never shares your email with third parties.</p></td></tr>`)
}
