import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { hashPassword } from '@/lib/password-utils'
import { signKrostJwt, serializeKrostSessionCookie } from '@/lib/auth-utils'
import { sendEmail, welcomeEmail, verifyEmailEmail, signEmailToken } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const supabase = createServerSupabaseClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = hashPassword(password)

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: randomUUID(),
        email: normalizedEmail,
        name: name.trim(),
        password_hash: passwordHash,
        auth_provider: 'email',
        role: 'gig_worker',
      })
      .select('id, email, name')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    const token = await signKrostJwt({
      sub: profile.id,
      email: profile.email!,
      name: profile.name || undefined,
    })

    const verificationToken = await signEmailToken(
      { sub: profile.id, email: profile.email!, purpose: 'verify_email' },
      '24h'
    )

    await Promise.allSettled([
      sendEmail(profile.email!, 'Welcome to Krostio', welcomeEmail(profile.name || 'there')),
      sendEmail(profile.email!, 'Verify your email', verifyEmailEmail(profile.name || 'there', verificationToken)),
    ])

    const redirectUrl = new URL('/dashboard', request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.headers.set(
      'Set-Cookie',
      serializeKrostSessionCookie(token, 7 * 24 * 60 * 60)
    )

    return response
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
