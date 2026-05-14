import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type Stripe from 'stripe'

// Stripe webhook signature verification needs the raw body, not a parsed one.
// In Next.js 16 App Router, `request.text()` already gives us that.

// Admin client: uses the service-role key, bypasses RLS. Required because
// Stripe webhooks arrive with no user session and would otherwise be blocked.
function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
}

type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end?: number | null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = adminSupabase()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!subscriptionId) {
          // One-time payment or setup session — nothing to write.
          break
        }

        const sub = (await stripe.subscriptions.retrieve(subscriptionId)) as SubscriptionWithPeriod
        const priceId = sub.items.data[0]?.price.id ?? null
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null

        const { error } = await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            // Use the real Stripe status — 'trialing' for new trials, 'active' otherwise.
            subscription_status: sub.status,
            stripe_current_period_end: periodEnd,
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('[stripe webhook] checkout.session.completed update failed:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as SubscriptionWithPeriod
        const priceId = sub.items.data[0]?.price.id ?? null
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null

        // 'canceled' for deleted, real status for updated.
        const status = event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            stripe_price_id: priceId,
            stripe_current_period_end: periodEnd,
          })
          .eq('stripe_subscription_id', sub.id)

        if (error) {
          console.error(`[stripe webhook] ${event.type} update failed:`, error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
        const subscriptionId = invoice.subscription
        if (!subscriptionId) break

        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId)

        if (error) {
          console.error('[stripe webhook] invoice.payment_failed update failed:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        break
      }

      default:
        // Ignore events we don't care about.
        break
    }
  } catch (err) {
    console.error('[stripe webhook] handler crashed:', err)
    return NextResponse.json({ error: 'handler error' }, { status: 500 })
  }

  // Bust the cached billing page so the dashboard reflects the new plan immediately.
  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard')

  return NextResponse.json({ received: true })
}
