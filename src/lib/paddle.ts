export const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!

export const PRO_MONTHLY_PRICE_ID = process.env.PADDLE_PRO_MONTHLY_PRICE_ID!
export const PRO_ANNUAL_PRICE_ID = process.env.PADDLE_PRO_ANNUAL_PRICE_ID!
export const ONE_TIME_PRICE_ID = process.env.PADDLE_ONE_TIME_PRICE_ID!

export const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID!

export const PLANS = [
  {
    id: 'one_time',
    name: 'Single Report',
    description: 'One PDF, one-time, no strings attached',
    price: 6.99,
    interval: null,
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
    id: 'pro_monthly',
    name: 'Pro Monthly',
    description: 'Unlimited reports and shareable links for serious earners',
    price: 29.99,
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
    id: 'pro_annual',
    name: 'Pro Annual',
    description: 'All Pro features, billed annually — save 64%',
    price: 129.99,
    interval: 'year' as const,
    priceId: PRO_ANNUAL_PRICE_ID,
    mode: 'subscription' as const,
    audience: 'gig_worker' as const,
    popular: false,
    features: [
      'Connect up to 5 platforms',
      'Unlimited PDF reports',
      'Expiring shareable links (7/30 day)',
      '24 months income history',
      'Downloadable as PDF',
      'Priority support',
      '2 months free vs monthly',
    ],
  },
]

export function getPaddleEnvironment(): 'sandbox' | 'production' {
  return process.env.PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
}

export function getPaddleApiBase(): string {
  return getPaddleEnvironment() === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com'
}
