import { createServerSupabaseClient } from '@/lib/supabase-server'
import { GIG_WORKER_PRICE_ID, LENDER_PRICE_ID } from '@/lib/stripe'
import { SubscribeButton } from './subscribe-button'
import { BillingAutoStart, BillingSuccessBanner } from './billing-client'

// Always re-fetch profile after Stripe redirects.
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ start?: string; upgraded?: string }>

export default async function BillingPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { start, upgraded } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'gig_worker'
  let subscription: { status: string; price_id: string | null } | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, subscription_status, stripe_price_id')
      .eq('id', user.id)
      .single()

    if (profile) {
      role = profile.role
      if (profile.subscription_status && profile.subscription_status !== 'free') {
        subscription = {
          status: profile.subscription_status,
          price_id: profile.stripe_price_id,
        }
      }
    }
  }

  const plans = [
    {
      id: 'gig_worker_monthly',
      name: 'Gig worker',
      description: 'Full credit profile for workers',
      price: 29,
      priceId: GIG_WORKER_PRICE_ID,
      role: 'gig_worker',
      popular: false,
      features: [
        'Unlimited platform connections',
        'Real-time score updates',
        'Detailed score breakdown',
        'On-chain attestation (Base L2)',
        'Share score with unlimited lenders',
        'Score history & trends',
      ],
    },
    {
      id: 'lender_monthly',
      name: 'Lender',
      description: 'Verify worker income at scale',
      price: 99,
      priceId: LENDER_PRICE_ID,
      role: 'lender',
      popular: true,
      features: [
        '50 verifications per month',
        'Search workers by email/wallet',
        'On-chain score verification',
        'Income history reports',
        'Bulk verification API',
        'Priority support',
      ],
    },
  ]

  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'

  // Resolve a `?start=worker|lender` hint into the matching Stripe price id.
  const autoStartPriceId =
    start === 'worker'
      ? GIG_WORKER_PRICE_ID
      : start === 'lender'
        ? LENDER_PRICE_ID
        : null

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
              {isSubscribed
                ? subscription!.price_id === LENDER_PRICE_ID
                  ? 'Lender'
                  : 'Gig worker'
                : 'Free'}
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

      {/* Plans */}
      <section>
        <h2 className="mb-6 text-heading-feature text-ink-black">
          {isSubscribed ? 'Switch plan' : 'Choose a plan'}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => {
            const isRelevant = plan.role === role
            const isCurrentPlan = isSubscribed && subscription?.price_id === plan.priceId

            return (
              <div
                key={plan.id}
                className={`card-stone ${
                  !isRelevant && !isSubscribed ? 'opacity-50' : ''
                }`}
              >
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
                  <span className="text-sm text-slate">/ month</span>
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
                {isRelevant && (
                  <SubscribeButton
                    priceId={plan.priceId}
                    label={
                      isCurrentPlan
                        ? 'Current plan'
                        : isSubscribed
                          ? 'Switch to this plan'
                          : 'Upgrade'
                    }
                    disabled={isCurrentPlan}
                  />
                )}
                {!isRelevant && !isSubscribed && (
                  <p className="mt-6 text-xs text-slate">
                    {role === 'lender'
                      ? 'Gig Worker plan available after account setup'
                      : 'Lender plan available after account setup'}
                  </p>
                )}
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
