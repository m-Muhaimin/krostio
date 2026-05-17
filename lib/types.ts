/**
 * Centralized type definitions for krostio-v2
 *
 * Shared across API routes, hooks, and components.
 * Import types from here instead of defining them inline.
 */

import type { ScoringFactors, ScoreResult } from './scoring-engine';

// ─── Ledger & Income Types ───────────────────────────────────────────────────

export interface LedgerEntry {
  id: string;
  platform: string;
  gross_amount: number;
  net_amount: number | null;
  period_start: string;
  period_end: string;
  category: string | null;
}

export interface LedgerSummary {
  total_platforms: number;
  avg_monthly_income: number;
  total_career_earnings: number;
  total_entries: number;
  monthly_breakdown: Array<{
    month: string;
    gross_total: number;
    net_total: number;
    payment_count: number;
  }>;
}

// ─── Score Types ─────────────────────────────────────────────────────────────

export interface ScoreData {
  score: number | null;
  tier: string | null;
  factors: Record<string, number> | null;
  income_snapshot: Record<string, number> | null;
  created_at: string | null;
}

export interface ScoreHistoryPoint {
  score: number | null;
  score_tier: string | null;
  created_at: string;
}

/** Alias for ScoringFactors used as input to calculateKrostScore */
export type KrostScoreInput = ScoringFactors;

/** Alias for ScoreResult returned by calculateKrostScore */
export type KrostScoreResult = ScoreResult;

// ─── Platform & Connection Types ─────────────────────────────────────────────

export interface PlatformConnection {
  id: string;
  user_id: string;
  platform: string;
  provider: string | null;
  access_token: string | null;
  item_id: string | null;
  institution_id: string | null;
  institution_name: string | null;
  argyle_account_id: string | null;
  connection_status: string;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Profile Types ───────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  stripe_customer_id: string | null;
  subscription_status: string;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}

// ─── Passport Types ──────────────────────────────────────────────────────────

export interface PassportData {
  id: string | null;
  token_id: string | null;
  contract_address: string | null;
  status: string;
  chain: string;
  minted_at: string | null;
  updated_at: string | null;
  metadata: Record<string, unknown> | null;
}

// ─── Report Types ────────────────────────────────────────────────────────────

export interface ReportItem {
  id: string;
  type: string;
  score: number | null;
  tier: string | null;
  shareToken: string | null;
  shareUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
}
