import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  PRO_MONTHLY_PRICE_ID,
  ONE_TIME_PRICE_ID,
} from '@/lib/stripe'
import { SubscribeButton } from './subscribe-button'
import { BillingAutoStart, BillingSuccessBanner } from './billing-client'

// Always re-fetch profile after Stripe redirects.
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ start?: string; upgraded?: string }>

type Plan = {
  id: string
  name: string
  description: string
  price: number
  priceId: string
  popular: boolean
  priceSuffix: string
  features: string[]
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { start, upgraded } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let subscription: { status: string; price_id: string | null } | null = null
  let role: string = 'gig_worker'

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, stripe_price_id, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      role = profile.role ?? 'gig_worker'
      if (profile.subscription_status && profile.subscription_status !== 'free') {
        subscription = {
          status: profile.subscription_status,
          price_id: profile.stripe_price_id,
        }
      }
    }
  }

  const plans: Plan[] = [
    {
      id: 'pro_monthly',
      name: 'Pro',
      description: 'Unlimited reports and shareable links',
      price: 14.99,
      priceId: PRO_MONTHLY_PRICE_ID,
      popular: true,
      priceSuffix: '/ month',
      features: [
        'Connect up to 5 platforms',
        'Unlimited PDF reports',
        'Expiring shareable links',
        '24 months income history',
        'Weekly income summary email',
      ],
    },
    {
      id: 'one_time',
      name: 'Single Report',
      description: 'One PDF, no subscription',
      price: 6.99,
      priceId: ONE_TIME_PRICE_ID,
      popular: false,
      priceSuffix: 'one-time',
      features: [
        '1 platform connection',
        '1 PDF report',
        '12 months history',
        'Shareable link (7 days)',
      ],
    },
  ]

  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'

  // Resolve a `?start=...` hint into the matching Stripe price id.
  const autoStartPriceId =
    start === 'worker'
      ? PRO_MONTHLY_PRICE_ID
      : null

  // Current plan name resolver
  const currentPlanName = (() => {
    if (!isSubscribed) return 'Free'
    const pid = subscription!.price_id
    if (pid === PRO_MONTHLY_PRICE_ID) return 'Pro'
    return 'Free'
  })()

  // Free-tier copy
  const freeTierCopy = {
    eyebrow: 'Always free',
    description: 'Get started with a verified income snapshot. No card required.',
    features: [
      '1 platform connection',
      'Income snapshot (no PDF)',
      '90 days history',
    ],
  }

  return (
    <div className="space-y-14">
      {upgraded === 'true' && <BillingSuccessBanner />}

      {/* If the user landed here from a plan CTA and is not yet subscribed,
          auto-open the Stripe Checkout session client-side. Safe no-op otherwise. */}
      {autoStartPriceId && !isSubscribed && (
        <BillingAutoStart priceId={autoStartPriceId} />
      )}

      <div>
        <p className="text-mono-label text-slate">Billing</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Subscription &amp; payments.
        </h1>
        <p className="mt-3 text-body text-slate">
            Manage your subscription and payment methods.
        </p>
      </div>

      {/* Current plan */}
      <section className="card-stone">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-mono-label text-slate">Current plan</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-ink-black">
              {currentPlanName}
            </p>
            {subscription && (
              <p className="mt-2 text-xs text-slate">
                Status:{' '}
                <span
                  className="font-medium"
                  style={{
                    color:
                      subscription.status === 'active' ||
                      subscription.status === 'trialing'
                        ? 'var(--color-ink-black)'
                        : 'var(--color-error-red)',
                  }}
                >
                  {subscription.status}
                </span>
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-4 py-1 text-mono-label ${
              isSubscribed ? 'bg-ink-black text-white' : 'bg-white text-slate border border-hairline'
            }`}
          >
            {isSubscribed ? subscription!.status : 'Free'}
          </span>
        </div>
      </section>

      {/* Free tier callout */}
      <section className="card-stone">
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="chip-coral-outline mb-5">{freeTierCopy.eyebrow}</span>
            <p className="text-mono-label text-slate">Free</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl font-normal tracking-tight text-ink-black">
                $0
              </span>
              <span className="text-sm text-slate">/ forever</span>
            </div>
            <p className="mt-3 text-sm text-slate">{freeTierCopy.description}</p>
          </div>
          <ul className="mt-2 space-y-3 text-sm text-ink max-w-sm">
            {freeTierCopy.features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-[7px] h-1 w-1 rounded-full bg-coral" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Plans */}
      <section>
        <h2 className="mb-6 text-heading-feature text-ink-black">
          {isSubscribed ? 'Switch plan' : 'Choose a plan'}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => {
            const isCurrentPlan = isSubscribed && subscription?.price_id === plan.priceId

            return (
              <div key={plan.id} className="card-stone">
                {plan.popular && !isSubscribed && (
                  <span className="chip-coral mb-5">Recommended</span>
                )}
                {isCurrentPlan && (
                  <span className="chip-coral-outline mb-5">Current</span>
                )}
                <p className="text-mono-label text-slate">{plan.name}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-normal tracking-tight text-ink-black">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-slate">{plan.priceSuffix}</span>
                </div>
                <p className="mt-3 text-sm text-slate">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-ink">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="mt-[7px] h-1 w-1 rounded-full bg-coral" />
                      {f}
                    </li>
                  ))}
                </ul>
                <SubscribeButton
                  priceId={plan.priceId}
                  label={
                    isCurrentPlan
                      ? 'Current plan'
                      : isSubscribed
                        ? 'Switch to this plan'
                        : plan.id === 'one_time'
                          ? 'Buy single report'
                          : 'Upgrade'
                  }
                  disabled={isCurrentPlan}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* Payment method */}
      <section className="border-t border-hairline pt-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-mono-label text-slate">Payments</p>
            <h2 className="mt-3 text-heading-feature text-ink-black">Payment method</h2>
          </div>
          <div>
            <p className="text-sm text-slate">
              {isSubscribed ? 'Managed via Stripe Customer Portal' : 'No payment method on file'}
            </p>
            <SubscribeButton
              priceId="portal"
              label={isSubscribed ? 'Manage via Stripe portal' : 'Add payment method'}
            />
          </div>
        </div>
      </section>

      {/* History */}
      <section className="border-t border-hairline pt-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-mono-label text-slate">History</p>
            <h2 className="mt-3 text-heading-feature text-ink-black">Billing history</h2>
          </div>
          <div className="card-bordered px-8 py-12 text-center">
            <p className="text-sm text-slate">
              {isSubscribed
                ? 'View full history in Stripe Customer Portal'
                : 'No billing history yet'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
