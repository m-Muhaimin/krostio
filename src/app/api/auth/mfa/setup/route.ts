import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateMFASecret, generateQRCode } from '@/lib/mfa'

export async function POST() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { secret, uri } = generateMFASecret(currentUser.user.email)

  const supabase = createServerSupabaseClient()
  await supabase.from('profiles').update({ mfa_secret: secret }).eq('id', currentUser.user.id)

  const qrCode = await generateQRCode(uri)

  return NextResponse.json({ qrCode, secret })
}
