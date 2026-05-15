// Types for Krost Income Verification System

export type Role = 'gig_worker' | 'lender' | 'admin'
export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled'
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
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  subscription_status: SubscriptionStatus
  stripe_current_period_end: string | null
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

/**
 * PRD-compliant Income Verification result.
 * NOT a credit score — this is an income consistency metric.
 */
export interface IncomeVerification {
  user_id: string

  /** Score 0–100 measuring income consistency */
  consistency_score: number

  /** Annualized income: mean(monthly_earnings) × 12 */
  annualized_income: number

  /** Monthly average income (trailing period) */
  monthly_avg_income: number

  /** Coefficient of variation of monthly earnings */
  income_volatility: number

  /** Months of gig work history */
  tenure_months: number

  /** Number of active platforms */
  platform_diversity: number

  /** diversity_score = min(100, platforms / 4 × 100) */
  diversity_score: number

  /** Trajectory label: growing / stable / declining */
  trajectory_label: TrajectoryLabel

  /** Linear regression slope as a fraction (e.g. 0.05 = +5%/month) */
  trajectory_slope: number

  /** Lender-ready status */
  lender_ready_status: LenderReadyStatus

  /** Detailed score factors */
  score_factors: ScoreFactor[]

  calculated_at: string
  expires_at?: string | null
  attestation_id?: string | null
}

/**
 * Legacy CreditScore type kept for backward compatibility with DB schema.
 * New code should use IncomeVerification.
 */
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
