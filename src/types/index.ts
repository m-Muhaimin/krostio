export type Role = 'gig_worker' | 'admin'
export type SubscriptionStatus = 'free' | 'active' | 'past_due' | 'paused' | 'canceled'
export type RequestStatus = 'pending' | 'approved' | 'denied'
export type ConnectionProvider = 'plaid' | 'manual' | 'oauth'
export type GigPlatform =
  | 'uber' | 'lyft' | 'doordash' | 'ubereats' | 'grubhub'
  | 'fiverr' | 'upwork' | 'freelancer' | 'instacart'
  | 'turo' | 'airbnb' | 'amazon_flex'
  | 'shopify' | 'etsy' | 'mercari' | 'poshmark' | 'ebay'
  | 'depop' | 'stockx' | 'whatnot'
  | 'other'

export type TrajectoryLabel = 'growing' | 'stable' | 'declining'
export type LenderReadyStatus = 'green' | 'yellow' | 'red'

export interface Profile {
  id: string
  email: string | null
  name: string | null
  role: Role
  avatar_url: string | null
  paddle_customer_id: string | null
  paddle_subscription_id: string | null
  paddle_price_id: string | null
  subscription_status: SubscriptionStatus
  paddle_current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface PlatformConnection {
  id: string
  user_id: string
  platform: GigPlatform
  platform_user_id: string | null
  access_token: string | null
  item_id: string | null
  institution_id: string | null
  institution_name: string | null
  provider: ConnectionProvider | null
  is_active: boolean
  connected_at: string
  last_sync_at: string | null
}

export interface IncomeRecord {
  id?: string
  user_id: string
  platform: GigPlatform
  period_start: string
  period_end: string
  gross_earnings: number
  net_earnings: number
  trips_completed: number
  hours_active: number
  rating: number | null
  currency: string
  created_at?: string
}

export interface ScoreFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  weight: number
}

export interface IncomeVerification {
  user_id: string
  consistency_score: number
  annualized_income: number
  monthly_avg_income: number
  income_volatility: number
  tenure_months: number
  platform_diversity: number
  diversity_score: number
  trajectory_label: TrajectoryLabel
  trajectory_slope: number
  lender_ready_status: LenderReadyStatus
  score_factors: ScoreFactor[]
  calculated_at: string
  expires_at?: string | null
  attestation_id?: string | null
}

export type CreditScore = IncomeVerification & {
  id?: string
  overall_score?: number
  reliability_score?: number
  debt_to_income_ratio?: number
}

export interface LenderRequest {
  id: string
  lender_id: string
  worker_id: string
  status: RequestStatus
  purpose: string | null
  requested_at: string
  expires_at: string | null
}

export interface WaitlistEntry {
  id: string
  email: string
  role: Role
  created_at: string
}

export type KrostScoreTier = 'elite' | 'strong' | 'building' | 'emerging'

export interface KrostScoreInput {
  avgMonthlyIncome: number
  platformTenureMonths: number
  incomeVolatility: number
  platformDiversity: number
  earningConsistency: number
  incomeTrajectory: number
  taxCompliance: boolean
  crossPlatformGrowth: number
  ledgerDepth: number
}

export interface KrostScoreFactorDetail {
  name: string
  label: string
  points: number
  maxPoints: number
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

export interface KrostScoreResult {
  score: number
  tier: KrostScoreTier
  factors: KrostScoreFactorDetail[]
  breakdown: {
    base: number
    incomeScore: number
    tenureScore: number
    volatilityScore: number
    diversityScore: number
    consistencyScore: number
    trajectoryScore: number
    taxComplianceScore: number
    crossPlatformGrowthScore: number
    ledgerDepthScore: number
  }
  calculatedAt: string
}
