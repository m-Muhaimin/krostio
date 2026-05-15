-- Krost Platform v2 — Database Extension
-- PRD v2.0 Four-Pillar Architecture
-- Run AFTER db/migration.sql (v1)
-- Uses DROP POLICY IF EXISTS for idempotency

-- ============================================================
-- TABLES THE EXISTING DASHBOARD + API QUERIES
-- ============================================================

-- 1. Krost Scores (300–850) — Pillar 1
CREATE TABLE IF NOT EXISTS public.krost_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
  tier TEXT NOT NULL CHECK (tier IN ('elite', 'strong', 'building', 'emerging')),
  breakdown JSONB DEFAULT '{}',
  factors JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Income Verifications (v1 score output, used by dashboard + sandbox-seed)
CREATE TABLE IF NOT EXISTS public.income_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consistency_score INTEGER NOT NULL DEFAULT 0,
  annualized_income NUMERIC(12,2) NOT NULL DEFAULT 0,
  monthly_avg_income NUMERIC(12,2) NOT NULL DEFAULT 0,
  income_volatility NUMERIC(6,4) NOT NULL DEFAULT 0,
  tenure_months INTEGER NOT NULL DEFAULT 0,
  platform_diversity INTEGER NOT NULL DEFAULT 0,
  diversity_score INTEGER NOT NULL DEFAULT 0,
  trajectory_label TEXT DEFAULT 'stable',
  trajectory_slope NUMERIC(8,4) DEFAULT 0,
  lender_ready_status TEXT DEFAULT 'red',
  score_factors JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- ============================================================
-- PILLAR 2: KROST LEDGER
-- ============================================================

-- 3. Ledger entries — unified earnings record across all platforms
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,
  gross_amount    NUMERIC(12,2) NOT NULL,
  net_amount      NUMERIC(12,2),
  currency        TEXT DEFAULT 'USD',
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  payment_date    DATE,
  category        TEXT,
  platform_ref_id TEXT,
  verified_at     TIMESTAMPTZ DEFAULT NOW(),
  source          TEXT DEFAULT 'api',
  UNIQUE(user_id, platform, platform_ref_id)
);

-- ============================================================
-- PILLAR 3: KROST VERIFIER
-- ============================================================

-- 4. Reports — generated PDFs + shareable links
CREATE TABLE IF NOT EXISTS public.reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type     TEXT DEFAULT 'standard_pdf',
  file_path       TEXT,
  file_size       INTEGER,
  share_token     TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  score_snapshot  JSONB DEFAULT '{}',
  ledger_snapshot JSONB DEFAULT '{}',
  pdf_path        TEXT,
  viewer_count    INTEGER DEFAULT 0,
  is_revoked      BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Report access log
CREATE TABLE IF NOT EXISTS public.report_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   UUID NOT NULL REFERENCES public.reports(id),
  viewer_email TEXT,
  viewer_ip   TEXT,
  viewed_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- B2B: LENDER ORGANIZATIONS
-- ============================================================

-- 6. Lender org accounts
CREATE TABLE IF NOT EXISTS public.lender_orgs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  domain          TEXT,
  verified        BOOLEAN DEFAULT FALSE,
  plan            TEXT DEFAULT 'starter',
  monthly_quota   INTEGER DEFAULT 50,
  verifications_used INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  api_key         TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PILLAR 4: KROST PASSPORT
-- ============================================================

-- 7. Passport records (mirrors on-chain state)
CREATE TABLE IF NOT EXISTS public.passports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) UNIQUE,
  wallet_address    TEXT UNIQUE,
  token_id          TEXT,
  chain             TEXT DEFAULT 'base',
  contract_address  TEXT,
  minted_at         TIMESTAMPTZ,
  last_attested_at  TIMESTAMPTZ,
  attestation_count INTEGER DEFAULT 0,
  current_score     INTEGER,
  score_tier        TEXT,
  is_public         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Attestation history log
CREATE TABLE IF NOT EXISTS public.attestation_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id   UUID NOT NULL REFERENCES public.passports(id),
  score         INTEGER NOT NULL,
  income_tier   TEXT,
  data_hash     TEXT,
  tx_hash       TEXT,
  block_number  BIGINT,
  attested_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_krost_scores_user ON public.krost_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_income_verifications_user ON public.income_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user ON public.ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_platform ON public.ledger_entries(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_period ON public.ledger_entries(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_share_token ON public.reports(share_token);
CREATE INDEX IF NOT EXISTS idx_report_views_report ON public.report_views(report_id);
CREATE INDEX IF NOT EXISTS idx_passports_user ON public.passports(user_id);
CREATE INDEX IF NOT EXISTS idx_attestation_history_passport ON public.attestation_history(passport_id);

-- ============================================================
-- ROW LEVEL SECURITY (idempotent: drop first)
-- ============================================================
ALTER TABLE public.krost_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lender_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attestation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers manage own krost score" ON public.krost_scores;
CREATE POLICY "Workers manage own krost score"
  ON public.krost_scores FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Workers manage own income verification" ON public.income_verifications;
CREATE POLICY "Workers manage own income verification"
  ON public.income_verifications FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Workers manage own ledger" ON public.ledger_entries;
CREATE POLICY "Workers manage own ledger"
  ON public.ledger_entries FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Workers manage own reports" ON public.reports;
CREATE POLICY "Workers manage own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Workers see own report views" ON public.report_views;
CREATE POLICY "Workers see own report views"
  ON public.report_views FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.reports
    WHERE reports.id = report_views.report_id
      AND reports.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Workers read own attestations" ON public.attestation_history;
CREATE POLICY "Workers read own attestations"
  ON public.attestation_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.passports
    WHERE passports.id = attestation_history.passport_id
      AND passports.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Public passport read" ON public.passports;
CREATE POLICY "Public passport read"
  ON public.passports FOR SELECT
  USING (is_public = TRUE);

DROP POLICY IF EXISTS "Workers manage own passport" ON public.passports;
CREATE POLICY "Workers manage own passport"
  ON public.passports FOR ALL
  USING (auth.uid() = user_id);
