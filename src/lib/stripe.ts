import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

// Price IDs — set these in Vercel env vars
export const PRO_MONTHLY_PRICE_ID = process.env.STRIPE_PRO_MONTHLY_PRICE_ID!
export const ONE_TIME_PRICE_ID = process.env.STRIPE_ONE_TIME_PRICE_ID!

// Legacy compat (remove after env migration)
export const GIG_WORKER_PRICE_ID = PRO_MONTHLY_PRICE_ID
export const LENDER_PRICE_ID = ''    // lender plan removed from MVP

export const PLANS = [
  {
    id: 'pro_monthly',
    name: 'Pro',
    description: 'Unlimited reports and shareable links for serious earners',
    price: 19,
    interval: 'month' as const,
    priceId: PRO_MONTHLY_PRICE_ID,
    mode: 'subscription' as const,
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
    popular: false,
    features: [
      '1 platform connection',
      '1 PDF report',
      '12 months income history',
      'Shareable link (7 days)',
      'No subscription needed',
    ],
  },
]
