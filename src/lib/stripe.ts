import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

// Price IDs — set these in Vercel env vars
export const PRO_MONTHLY_PRICE_ID = process.env.STRIPE_PRO_MONTHLY_PRICE_ID!
export const ONE_TIME_PRICE_ID = process.env.STRIPE_ONE_TIME_PRICE_ID!
export const LENDER_PRO_PRICE_ID = process.env.STRIPE_LENDER_PRO_PRICE_ID!
export const LENDER_SCALE_PRICE_ID = process.env.STRIPE_LENDER_SCALE_PRICE_ID!

// Legacy compat (remove after env migration)
export const GIG_WORKER_PRICE_ID = PRO_MONTHLY_PRICE_ID
export const LENDER_PRICE_ID = LENDER_PRO_PRICE_ID

export const PLANS = [
  {
    id: 'pro_monthly',
    name: 'Pro',
    description: 'Unlimited reports and shareable links for serious earners',
    price: 19,
    interval: 'month' as const,
    priceId: PRO_MONTHLY_PRICE_ID,
    mode: 'subscription' as const,
    audience: 'gig_worker' as const,
    popular: true,
    features: [
      'Connect up to 5 platforms',
      'Unlimited PDF reports',
      'Expiring shareable links (7/30 day)',
      '24 months income history',
      'Downloadable as PDF',
      'Priority support',
    ],
  },
  {
    id: 'one_time',
    name: 'Single Report',
    description: 'One PDF, one-time, no strings attached',
    price: 9,
    interval: null as string | null,
    priceId: ONE_TIME_PRICE_ID,
    mode: 'payment' as const,
    audience: 'gig_worker' as const,
    popular: false,
    features: [
      '1 platform connection',
      '1 PDF report',
      '12 months income history',
      'Shareable link (7 days)',
      'No subscription needed',
    ],
  },
  {
    id: 'lender_pro',
    name: 'Lender Pro',
    description: 'For lending teams ramping up — up to 50 verifications/month',
    price: 99,
    interval: 'month' as const,
    priceId: LENDER_PRO_PRICE_ID,
    mode: 'subscription' as const,
    audience: 'lender' as const,
    popular: true,
    features: [
      'Up to 50 verifications / month',
      'Approved-request and full-score views',
      'Worker search across the network',
      'Usage dashboard',
      'Email support',
    ],
  },
  {
    id: 'lender_scale',
    name: 'Lender Scale',
    description: 'For teams running serious volume — 150 verifications/month',
    price: 199,
    interval: 'month' as const,
    priceId: LENDER_SCALE_PRICE_ID,
    mode: 'subscription' as const,
    audience: 'lender' as const,
    popular: false,
    features: [
      'Up to 150 verifications / month',
      'Approved-request and full-score views',
      'Worker search across the network',
      'Usage dashboard',
      'Priority support',
    ],
  },
]
