import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { verifyMfaStepupToken } from '@/lib/mfa'
import {
  plaid,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  PLAID_CLIENT_NAME,
  PLAID_REDIRECT_URI,
} from '@/lib/plaid'

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  // Check MFA: if enabled, require a valid step-up token
  const { data: profile } = await supabase
    .from('profiles')
    .select('mfa_enabled')
    .eq('id', user.id)
    .single()

  if (profile?.mfa_enabled) {
    const stepupToken = request.headers.get('x-mfa-stepup')
    if (!stepupToken) {
      return NextResponse.json({ error: 'MFA required', mfa_required: true }, { status: 403 })
    }
    const verified = await verifyMfaStepupToken(stepupToken)
    if (!verified || verified.sub !== user.id) {
      return NextResponse.json({ error: 'MFA verification expired. Please re-verify.', mfa_required: true }, { status: 403 })
    }
  }

  try {
    const res = await plaid.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: PLAID_CLIENT_NAME,
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
      ...(process.env.PLAID_REDIRECT_URI ? { redirect_uri: PLAID_REDIRECT_URI } : {}),
    })

    return NextResponse.json({ link_token: res.data.link_token })
  } catch (err: any) {
    const msg = err?.response?.data?.error_message || err?.message || 'Plaid error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
