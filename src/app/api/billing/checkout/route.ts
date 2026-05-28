import { NextRequest, NextResponse } from 'next/server'
import { PRO_MONTHLY_PRICE_ID, ONE_TIME_PRICE_ID, PADDLE_CLIENT_TOKEN, getPaddleApiBase } from '@/lib/paddle'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  const { priceId } = await request.json()
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID required' }, { status: 400 })
  }

  const isOneTime = priceId === ONE_TIME_PRICE_ID
  const isSubscription = priceId === PRO_MONTHLY_PRICE_ID

  if (!isOneTime && !isSubscription) {
    return NextResponse.json({ error: 'Unknown price ID' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('paddle_customer_id, email')
    .eq('id', user.id)
    .single()

  const customerId = profile?.paddle_customer_id
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  if (isOneTime) {
    return NextResponse.json({
      url: null,
      settings: {
        displayMode: 'overlay',
        token: PADDLE_CLIENT_TOKEN,
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: user.email ?? profile?.email ?? undefined,
        },
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: `${appUrl}/dashboard/billing?upgraded=true`,
        },
      },
    })
  }

  return NextResponse.json({
    url: null,
    settings: {
      displayMode: 'overlay',
      token: PADDLE_CLIENT_TOKEN,
      items: [{ priceId, quantity: 1 }],
      customer: {
        email: user.email ?? profile?.email ?? undefined,
      },
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        successUrl: `${appUrl}/dashboard/billing?upgraded=true`,
      },
    },
  })
}
