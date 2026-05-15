-- Migration 008: Krostio v2 Platform — Four-Pillar Schema
-- Adds: ledger_entries, reports (v2 enhanced), report_views, lender_orgs, passports, attestation_history
-- Run AFTER migrations 001–007 have been applied.

-- =========================================================================
-- 1. LEDGER ENTRIES — Pillar 2: Krost Ledger (unified earnings record)
--    Replaces income_records as the canonical source for score computation.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL,
  gross_amount      DECIMAL(12,2) NOT NULL,
  net_amount        DECIMAL(12,2),
  currency          TEXT DEFAULT 'USD',
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  payment_date      DATE,
  category          TEXT,
  platform_ref_id   TEXT,
  verified_at       TIMESTAMPTZ DEFAULT NOW(),
  source            TEXT DEFAULT 'api' CHECK (source IN ('api', 'manual', 'csv_upload', 'argyle')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_period
  ON public.ledger_entries(user_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_platform
  ON public.ledger_entries(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_verified_at
  ON public.ledger_entries(verified_at);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers manage own ledger entries"
  ON public.ledger_entries FOR ALL
  USING (auth.uid() = user_id);

-- Monthly rollup materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.ledger_monthly AS
SELECT
  user_id,
  platform,
  DATE_TRUNC('month', period_start) AS month,
  SUM(gross_amount) AS gross_total,
  SUM(net_amount) AS net_total,
  COUNT(*) AS payment_count
FROM public.ledger_entries
GROUP BY user_id, platform, DATE_TRUNC('month', period_start);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ledger_monthly_unique
  ON public.ledger_monthly(user_id, platform, month);

-- =========================================================================
-- 2. REPORTS (v2 enhanced) — Pillar 3: Krost Verifier
--    Extends migration-005 reports table with full access control + share tokens.
-- =========================================================================

-- Drop existing if recreating (safe migration: column adds + new table)
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'standard_pdf'
  CHECK (report_type IN ('standard_pdf', 'quick_link', 'api_response'));
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS score_snapshot JSONB DEFAULT '{}';
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS ledger_snapshot JSONB DEFAULT '{}';
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS report_metadata JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_reports_share_token ON public.reports(share_token) WHERE share_token IS NOT NULL;

-- Revoke support: update policy to exclude revoked reports
DROP POLICY IF EXISTS "Anyone can read valid reports" ON public.reports;
CREATE POLICY "Anyone can read valid shareable reports"
  ON public.reports FOR SELECT
  USING (expires_at > NOW() AND is_revoked = FALSE);

-- =========================================================================
-- 3. REPORT VIEWS — Access log for shared reports
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.report_views (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id     UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  viewer_email  TEXT,
  viewer_ip     TEXT,
  user_agent    TEXT,
  viewed_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_views_report ON public.report_views(report_id);

ALTER TABLE public.report_views ENABLE ROW LEVEL SECURITY;

-- Report owner can see who viewed their report
CREATE POLICY "Report owner sees views"
  ON public.report_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_views.report_id
        AND reports.user_id = auth.uid()
    )
  );

-- Anyone can insert (to log a view)
CREATE POLICY "Anyone can log a report view"
  ON public.report_views FOR INSERT
  WITH CHECK (true);

-- =========================================================================
-- 4. LENDER ORGS — B2B lender accounts (Phase 2, but schema now)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.lender_orgs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  domain              TEXT,
  verified            BOOLEAN DEFAULT FALSE,
  plan                TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  monthly_quota       INTEGER DEFAULT 50,
  verifications_used  INTEGER DEFAULT 0,
  stripe_customer_id  TEXT,
  api_key             TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lender_orgs_api_key ON public.lender_orgs(api_key);
CREATE INDEX IF NOT EXISTS idx_lender_orgs_domain ON public.lender_orgs(domain);

ALTER TABLE public.lender_orgs ENABLE ROW LEVEL SECURITY;

-- Org admins can read their own org (auth'd via api_key or profile link; simplified policy)
CREATE POLICY "Org reads own"
  ON public.lender_orgs FOR SELECT
  USING (true); -- API-key auth happens at the application layer

-- =========================================================================
-- 5. PASSPORTS — Pillar 4: Krost Passport (on-chain attestation records)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.passports (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
  wallet_address     TEXT UNIQUE,
  token_id           TEXT,
  chain              TEXT DEFAULT 'base',
  contract_address   TEXT,
  minted_at          TIMESTAMPTZ,
  last_attested_at   TIMESTAMPTZ,
  attestation_count  INTEGER DEFAULT 0,
  current_score      INTEGER CHECK (current_score IS NULL OR (current_score >= 300 AND current_score <= 850)),
  score_tier         TEXT CHECK (score_tier IN ('elite', 'strong', 'building', 'emerging')),
  is_public          BOOLEAN DEFAULT TRUE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_passports_user ON public.passports(user_id);
CREATE INDEX IF NOT EXISTS idx_passports_wallet ON public.passports(wallet_address);

ALTER TABLE public.passports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers manage own passport"
  ON public.passports FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public passports"
  ON public.passports FOR SELECT
  USING (is_public = TRUE);

-- =========================================================================
-- 6. ATTESTATION HISTORY — On-chain event mirror
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.attestation_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id    UUID REFERENCES public.passports(id) ON DELETE CASCADE,
  score          INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
  score_tier     TEXT CHECK (score_tier IN ('elite', 'strong', 'building', 'emerging')),
  income_tier    TEXT,
  data_hash      TEXT,
  tx_hash        TEXT,
  block_number   BIGINT,
  attested_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attestation_history_passport
  ON public.attestation_history(passport_id, attested_at DESC);

ALTER TABLE public.attestation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads attestations"
  ON public.attestation_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.passports
      WHERE passports.id = attestation_history.passport_id
        AND passports.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read public attestations"
  ON public.attestation_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.passports
      WHERE passports.id = attestation_history.passport_id
        AND passports.is_public = TRUE
    )
  );

-- =========================================================================
-- 7. KROST SCORES — Pillar 1 cache (computed 300–850 score, tier, factor breakdown)
--    Separate from passports which require on-chain attestation.
--    Recalculated every time income data is synced.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.krost_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
  score           INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
  tier            TEXT NOT NULL CHECK (tier IN ('elite', 'strong', 'building', 'emerging')),
  breakdown       JSONB NOT NULL DEFAULT '{}',
  factors         JSONB NOT NULL DEFAULT '[]',
  input_snapshot  JSONB DEFAULT '{}',
  calculated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_krost_scores_user ON public.krost_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_krost_scores_score ON public.krost_scores(score DESC);

ALTER TABLE public.krost_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers manage own krost score"
  ON public.krost_scores FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Lenders can read scores with approved request"
  ON public.krost_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lender_requests
      WHERE lender_requests.worker_id = krost_scores.user_id
        AND lender_requests.lender_id = auth.uid()
        AND lender_requests.status = 'approved'
    )
  );

-- =========================================================================
-- 8. MIGRATION TRACKING
-- =========================================================================

INSERT INTO public._migrations (name, applied_at)
VALUES ('008-v2-platform', NOW())
ON CONFLICT (name) DO NOTHING;
