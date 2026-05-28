import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendEmail, verifyEmailEmail, signEmailToken } from '@/lib/email'

export async function POST() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_verified, name')
    .eq('id', currentUser.user.id)
    .single()

  if (profile?.email_verified) {
    return NextResponse.json({ ok: true, already_verified: true })
  }

  const token = await signEmailToken(
    { sub: currentUser.user.id, email: currentUser.user.email, purpose: 'verify_email' },
    '24h'
  )

  await sendEmail(currentUser.user.email, 'Verify your email', verifyEmailEmail(currentUser.user.name || 'there', token))

  return NextResponse.json({ ok: true })
}
