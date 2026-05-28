import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PRO_MONTHLY_PRICE_ID, ONE_TIME_PRICE_ID } from '@/lib/paddle'
import { SubscribeButton } from './subscribe-button'
import { BillingAutoStart, BillingSuccessBanner } from './billing-client'

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
  const currentUser = await getCurrentUser()
  const user = currentUser?.user ?? null
  const supabase = createServerSupabaseClient()

  let subscription: { status: string; price_id: string | null } | null = null
  let role: string = 'gig_worker'

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, paddle_price_id, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      role = profile.role ?? 'gig_worker'
      if (profile.subscription_status && profile.subscription_status !== 'free') {
        subscription = {
          status: profile.subscription_status,
          price_id: profile.paddle_price_id,
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
  const autoStartPriceId = start === 'worker' ? PRO_MONTHLY_PRICE_ID : null

  const currentPlanName = (() => {
    if (!isSubscribed) return 'Free'
    const pid = subscription!.price_id
    if (pid === PRO_MONTHLY_PRICE_ID) return 'Pro'
    return 'Free'
  })()

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
    <div>
      {upgraded === 'true' && <BillingSuccessBanner />}
      {autoStartPriceId && !isSubscribed && (
        <BillingAutoStart priceId={autoStartPriceId} />
      )}

      <div className="page-header fade-up d0">
        <h1 className="page-title">Billing</h1>
        <p className="page-sub">Manage your subscription and payment methods.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card fade-up d1">
          <div className="card-head">
            <div>
              <p className="card-title">Current Plan</p>
              <p className="card-sub">{currentPlanName}</p>
            </div>
            {isSubscribed && (
              <span className="chip-coral-outline text-xs capitalize">{subscription!.status}</span>
            )}
          </div>
          <div className="card-body p-5">
            {subscription ? (
              <p className="text-sm text-slate">
                Status:{' '}
                <span className="font-medium text-ink-black capitalize">{subscription.status}</span>
              </p>
            ) : (
              <p className="text-sm text-slate">
                You are on the Free plan. Upgrade to unlock more features.
              </p>
            )}
          </div>
        </div>

        <div className="card fade-up d2">
          <div className="card-head">
            <div>
              <p className="card-title">Always Free</p>
              <p className="card-sub">{freeTierCopy.description}</p>
            </div>
            <span className="chip-coral text-xs">$0 forever</span>
          </div>
          <div className="card-body p-5">
            <ul className="space-y-2">
              {freeTierCopy.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate">
                  <span className="mt-[7px] h-1 w-1 rounded-full bg-coral shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {plans.map((plan, i) => {
          const isCurrentPlan = isSubscribed && subscription?.price_id === plan.priceId
          return (
            <div key={plan.id} className={`card fade-up d${3 + i}`}>
              <div className="card-head">
                <div>
                  <p className="card-title">{plan.name}</p>
                  <p className="card-sub">{plan.description}</p>
                </div>
                {plan.popular && !isSubscribed && (
                  <span className="chip-coral text-xs">Recommended</span>
                )}
                {isCurrentPlan && (
                  <span className="chip-coral-outline text-xs">Current</span>
                )}
              </div>
              <div className="card-body p-5">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-display text-4xl tracking-tight text-ink-black">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-muted-slate">{plan.priceSuffix}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate">
                      <span className="mt-[7px] h-1 w-1 rounded-full bg-coral shrink-0" />
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
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card fade-up d5">
          <div className="card-head">
            <div>
              <p className="card-title">Payment Method</p>
              <p className="card-sub">
                {isSubscribed
                  ? 'Managed via Paddle'
                  : 'No payment method on file'}
              </p>
            </div>
          </div>
          <div className="card-body p-5">
            <p className="text-sm text-slate">
              {isSubscribed
                ? 'Payment is managed securely via Paddle.'
                : 'Add a payment method when you upgrade.'}
            </p>
          </div>
        </div>

        <div className="card fade-up d6">
          <div className="card-head">
            <div>
              <p className="card-title">Billing History</p>
              <p className="card-sub">
                {isSubscribed
                  ? 'View in Paddle dashboard'
                  : 'No billing history yet'}
              </p>
            </div>
          </div>
          <div className="card-body p-5">
            {isSubscribed ? (
              <p className="text-sm text-slate">
                Billing history is available in your Paddle account.
              </p>
            ) : (
              <p className="text-sm text-slate">No billing history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
