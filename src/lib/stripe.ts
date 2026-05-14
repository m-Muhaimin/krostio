import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

export const GIG_WORKER_PRICE_ID = process.env.STRIPE_GIG_WORKER_PRICE_ID!
export const LENDER_PRICE_ID = process.env.STRIPE_LENDER_PRICE_ID!

export const PLANS = [
  {
    id: 'gig_worker_monthly',
    name: 'Gig Worker',
    description: 'Build your credit score and access better financing',
    price: 29,
    interval: 'month' as const,
    priceId: GIG_WORKER_PRICE_ID,
    role: 'gig_worker' as const,
    features: [
      'Connect up to 3 gig platforms',
      'Monthly credit score updates',
      'Score sharing with lenders',
      'On-chain score attestation',
      'Income history reports',
    ],
  },
  {
    id: 'lender_monthly',
    name: 'Lender',
    description: 'Verify gig worker income in seconds, not days',
    price: 99,
    interval: 'month' as const,
    priceId: LENDER_PRICE_ID,
    role: 'lender' as const,
    features: [
      'Up to 50 verifications per month',
      'On-chain score verification',
      'Bulk income report downloads',
      'Risk scoring API access',
      'Custom scoring parameters',
    ],
  },
]
