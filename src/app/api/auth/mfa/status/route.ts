import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { verifyMfaChallengeToken } from '@/lib/mfa'

export async function GET() {
  const currentUser = await getCurrentUser()
  if (currentUser) {
    const supabase = createServerSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('mfa_enabled')
      .eq('id', currentUser.user.id)
      .single()
    return NextResponse.json({ mfa_enabled: profile?.mfa_enabled ?? false })
  }

  const cookieStore = await cookies()
  const challengeToken = cookieStore.get('mfa_challenge')?.value
  if (challengeToken) {
    const challenge = await verifyMfaChallengeToken(challengeToken)
    if (challenge?.sub) {
      return NextResponse.json({ mfa_enabled: true })
    }
  }

  return NextResponse.json({ mfa_enabled: false })
}
