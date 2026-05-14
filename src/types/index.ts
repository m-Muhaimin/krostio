export type Role = 'gig_worker' | 'lender' | 'admin'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  avatar_url?: string
  created_at: string
  subscription_status: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled'
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

export type GigPlatform =
  | 'uber'
  | 'lyft'
  | 'doordash'
  | 'ubereats'
  | 'grubhub'
  | 'instacart'
  | 'fiverr'
  | 'upwork'
  | 'freelancer'
  | 'turo'
  | 'airbnb'
  | 'amazon_flex'
  | 'other'

export type PlatformConnection = {
  id: string
  user_id: string
  platform: GigPlatform
  platform_user_id: string
  connected_at: string
  last_sync_at: string
  is_active: boolean
}

export type IncomeRecord = {
  id: string
  user_id: string
  platform: GigPlatform
  period_start: string
  period_end: string
  gross_earnings: number
  net_earnings: number
  trips_completed: number
  hours_active: number
  rating: number
  currency: string
}

export type CreditScore = {
  id: string
  user_id: string
  overall_score: number // 300-850
  monthly_avg_income: number
  income_volatility: number // coefficient of variation
  tenure_months: number
  platform_diversity: number // number of active platforms
  reliability_score: number // 0-100 based on consistency
  debt_to_income_ratio: number
  score_factors: ScoreFactor[]
  calculated_at: string
  expires_at: string
  attestation_id?: string // on-chain reference
}

export type ScoreFactor = {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  weight: number
}

export type LenderRequest = {
  id: string
  lender_id: string
  worker_id: string
  status: 'pending' | 'approved' | 'denied'
  requested_at: string
  expires_at: string
  purpose?: string
}

export type SubscriptionTier = {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  role: Role
  price_id: string
}
