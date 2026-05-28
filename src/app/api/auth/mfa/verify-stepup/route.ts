import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { verifyMFAToken, signMfaStepupToken } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })

  const supabase = createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('mfa_secret, mfa_enabled')
    .eq('id', currentUser.user.id)
    .single()

  if (!profile?.mfa_enabled || !profile?.mfa_secret) {
    return NextResponse.json({ error: 'MFA is not enabled' }, { status: 400 })
  }

  if (!verifyMFAToken(token, profile.mfa_secret)) {
    return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 })
  }

  const stepupToken = await signMfaStepupToken({ sub: currentUser.user.id })

  return NextResponse.json({ stepupToken })
}
