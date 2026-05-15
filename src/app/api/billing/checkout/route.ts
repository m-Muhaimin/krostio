import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRO_MONTHLY_PRICE_ID, ONE_TIME_PRICE_ID } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { priceId } = await request.json()
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID required' }, { status: 400 })
  }

  // Determine if this is a subscription or one-time purchase
  const isOneTime = priceId === ONE_TIME_PRICE_ID
  const isSubscription = priceId === PRO_MONTHLY_PRICE_ID

  if (!isOneTime && !isSubscription) {
    return NextResponse.json({ error: 'Unknown price ID' }, { status: 400 })
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isOneTime ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?upgraded=true`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    ...(isSubscription && { subscription_data: { trial_period_days: 14 } }),
    client_reference_id: user.id,
    metadata: { user_id: user.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
