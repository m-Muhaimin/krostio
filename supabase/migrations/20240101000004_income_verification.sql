-- Migration 004: Income Verification (PRD-compliant) replaces credit_scores
-- The old credit_scores table stored a 300-850 credit score.
-- The new income_verifications table stores PRD-compliant metrics:
--   consistency_score (0-100), annualized_income, trajectory, etc.

-- Step 1: Migrate existing data if any
DO $$
BEGIN
  -- Rename old table to preserve data (will drop after confirming migration)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'credit_scores') THEN
    ALTER TABLE public.credit_scores RENAME TO credit_scores_legacy;
  END IF;
END $$;

-- Step 2: Create new income_verifications table
CREATE TABLE IF NOT EXISTS public.income_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Core metrics
  consistency_score INTEGER NOT NULL CHECK (consistency_score >= 0 AND consistency_score <= 100),
  annualized_income NUMERIC(12,2) NOT NULL,
  monthly_avg_income NUMERIC(12,2) NOT NULL,
  income_volatility NUMERIC(6,4) NOT NULL,
  tenure_months INTEGER NOT NULL,
  platform_diversity INTEGER NOT NULL,
  diversity_score INTEGER NOT NULL CHECK (diversity_score >= 0 AND diversity_score <= 100),

  -- Trajectory
  trajectory_label TEXT NOT NULL CHECK (trajectory_label IN ('growing', 'stable', 'declining')),
  trajectory_slope NUMERIC(8,4) NOT NULL,

  -- Lender readiness
  lender_ready_status TEXT NOT NULL CHECK (lender_ready_status IN ('green', 'yellow', 'red')),

  -- Factor breakdown
  score_factors JSONB DEFAULT '[]',

  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  attestation_id TEXT,

  UNIQUE(user_id)
);

-- Step 3: Indexes
CREATE INDEX IF NOT EXISTS idx_income_verifications_user ON public.income_verifications(user_id);

-- Step 4: RLS
ALTER TABLE public.income_verifications ENABLE ROW LEVEL SECURITY;

-- Worker can read own
CREATE POLICY "Workers read own verification"
  ON public.income_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Lender can read with approved request
CREATE POLICY "Lenders read approved verifications"
  ON public.income_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lender_requests
      WHERE lender_requests.lender_id = auth.uid()
        AND lender_requests.worker_id = income_verifications.user_id
        AND lender_requests.status = 'approved'
    )
  );

-- System-level insert/upsert
CREATE POLICY "System can manage verifications"
  ON public.income_verifications FOR ALL
  USING (auth.role() = 'service_role');

-- Update lender_requests RLS to reference new table (no change needed — still references user_id)
