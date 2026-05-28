import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { Paddle, EventName } from '@paddle/paddle-node-sdk'

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

function getProfileUpdate(payload: Record<string, unknown>) {
  const data = payload.data as Record<string, unknown> | undefined
  if (!data) return null

  const items = (data?.items as Array<Record<string, unknown>>) ?? []
  const priceId =
    (items[0]?.price as Record<string, unknown>)?.id as string ??
    (items[0]?.product as Record<string, unknown>)?.id as string ??
    null

  const customerId = data.customer_id as string | undefined
  const subscriptionId = data.id as string | undefined
  const status = data.status as string | undefined
  const billingPeriod = data.current_billing_period as Record<string, unknown> | undefined
  const periodEnd = billingPeriod?.ends_at as string | undefined

  return { customerId, subscriptionId, priceId, status, periodEnd }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('paddle-signature') ?? ''
  const secretKey = process.env.PADDLE_WEBHOOK_SECRET

  // Verify signature if secret is configured
  if (secretKey) {
    if (!signature) {
      return NextResponse.json({ error: 'Missing paddle-signature header' }, { status: 401 })
    }
    if (!process.env.PADDLE_API_KEY) {
      return NextResponse.json({ error: 'PADDLE_API_KEY not configured' }, { status: 500 })
    }

    try {
      const paddle = new Paddle(process.env.PADDLE_API_KEY)
      await paddle.webhooks.unmarshal(rawBody, secretKey, signature)
    } catch (err) {
      console.error('[paddle webhook] signature verification failed:', err)
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }
  } else {
    console.warn('[paddle webhook] PADDLE_WEBHOOK_SECRET not set — skipping verification')
  }

  const supabase = adminSupabase()

  try {
    const payload = JSON.parse(rawBody)
    const eventType = payload.event_type

    switch (eventType) {
      case EventName.TransactionCompleted:
      case EventName.TransactionPaid: {
        const data = payload.data as Record<string, unknown> | undefined
        if (!data) break

        const customerId = data.customer_id as string | undefined
        const subscriptionId = data.subscription_id as string | undefined
        const items = (data?.items as Array<Record<string, unknown>>) ?? []
        const priceId =
          (items[0]?.price as Record<string, unknown>)?.id as string ??
          (items[0]?.product as Record<string, unknown>)?.id as string ??
          null
        const status = data.status === 'completed' || data.status === 'paid' ? 'active' : 'past_due'
        const billingPeriod = data.billing_period as Record<string, unknown> | undefined
        const periodEnd = billingPeriod?.ends_at as string | undefined

        if (!customerId) break

        if (subscriptionId) {
          const { error } = await supabase
            .from('profiles')
            .update({
              paddle_customer_id: customerId,
              paddle_subscription_id: subscriptionId,
              paddle_price_id: priceId,
              subscription_status: status,
              paddle_current_period_end: periodEnd ? new Date(periodEnd).toISOString() : null,
            })
            .eq('paddle_customer_id', customerId)

          if (error) {
            console.error('[paddle webhook] transaction update failed:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
          }
        } else {
          const email = data.customer_email as string | undefined
          if (email) {
            const { error } = await supabase
              .from('profiles')
              .update({
                paddle_customer_id: customerId,
                subscription_status: 'active',
              })
              .eq('email', email)

            if (error) {
              console.error('[paddle webhook] one-time update failed:', error)
            }
          }
        }
        break
      }

      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated: {
        const data = payload.data as Record<string, unknown> | undefined
        if (!data) break

        const subCustomerId = data.customer_id as string | undefined
        const subId = data.id as string | undefined
        const items = (data?.items as Array<Record<string, unknown>>) ?? []
        const priceId =
          (items[0]?.price as Record<string, unknown>)?.id as string ??
          (items[0]?.product as Record<string, unknown>)?.id as string ??
          null
        const subStatus = (data.status as string) ?? 'active'
        const billingPeriod = data.current_billing_period as Record<string, unknown> | undefined
        const periodEnd = billingPeriod?.ends_at as string | undefined

        if (!subCustomerId || !subId) break

        const { error } = await supabase
          .from('profiles')
          .update({
            paddle_customer_id: subCustomerId,
            paddle_subscription_id: subId,
            paddle_price_id: priceId,
            subscription_status: subStatus,
            paddle_current_period_end: periodEnd ? new Date(periodEnd).toISOString() : null,
          })
          .eq('paddle_customer_id', subCustomerId)

        if (error) {
          console.error(`[paddle webhook] ${eventType} update failed:`, error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        break
      }

      case EventName.SubscriptionCanceled: {
        const data = payload.data as Record<string, unknown> | undefined
        if (!data) break
        const cancelSubId = data.id as string | undefined

        if (!cancelSubId) break

        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'canceled' })
          .eq('paddle_subscription_id', cancelSubId)

        if (error) {
          console.error('[paddle webhook] subscription.cancelled update failed:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        break
      }

      default:
        console.log('[paddle webhook] unhandled event type:', eventType)
        break
    }
  } catch (err) {
    console.error('[paddle webhook] handler crashed:', err)
    return NextResponse.json({ error: 'handler error' }, { status: 500 })
  }

  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard')

  return NextResponse.json({ received: true })
}
