import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  plaid,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  PLAID_CLIENT_NAME,
  PLAID_REDIRECT_URI,
} from '@/lib/plaid'

/**
 * POST /api/plaid/link-token
 * Creates a Plaid Link token for the current user.
 * Returns { link_token } that the client passes to <PlaidLink>.
 */
export async function POST(_request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await plaid.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: PLAID_CLIENT_NAME,
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
      // Only set redirect_uri when running in a real env (Plaid sandbox accepts localhost
      // but only if it's registered on the dashboard).
      ...(process.env.PLAID_REDIRECT_URI ? { redirect_uri: PLAID_REDIRECT_URI } : {}),
    })

    return NextResponse.json({ link_token: res.data.link_token })
  } catch (err: any) {
    const msg = err?.response?.data?.error_message || err?.message || 'Plaid error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
