-- Migration 007: Lender Directory + referral tracking (PRD F-12)
-- Public directory of lenders accepting Krost income verification + click/conversion tracking.

-- =========================================================================
-- TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS lender_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  tagline text,
  description text,
  website_url text,
  application_url text NOT NULL,
  loan_types text[] NOT NULL DEFAULT '{}',
  min_consistency_score int,
  min_fico int,
  states_served text[] DEFAULT '{}',
  min_loan_amount int,
  max_loan_amount int,
  typical_apr_min numeric(5,2),
  typical_apr_max numeric(5,2),
  featured boolean NOT NULL DEFAULT false,
  featured_until timestamptz,
  active boolean NOT NULL DEFAULT true,
  referral_fee_cents int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lender_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  lender_id uuid NOT NULL REFERENCES lender_profiles(id) ON DELETE CASCADE,
  ref_code text NOT NULL UNIQUE,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  applied_at timestamptz,
  funded_at timestamptz,
  estimated_payout_cents int,
  actual_payout_cents int,
  user_agent text,
  ip_address inet,
  consistency_score_at_click int
);

-- =========================================================================
-- INDEXES
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_lender_profiles_featured_active
  ON lender_profiles (featured DESC, active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lender_profiles_loan_types
  ON lender_profiles USING GIN (loan_types);
CREATE INDEX IF NOT EXISTS idx_lender_profiles_states_served
  ON lender_profiles USING GIN (states_served);

CREATE INDEX IF NOT EXISTS idx_lender_referrals_worker
  ON lender_referrals (worker_id);
CREATE INDEX IF NOT EXISTS idx_lender_referrals_lender_clicked
  ON lender_referrals (lender_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_lender_referrals_ref_code
  ON lender_referrals (ref_code);

-- =========================================================================
-- updated_at trigger
-- =========================================================================

CREATE OR REPLACE FUNCTION lender_profiles_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lender_profiles_updated_at ON lender_profiles;
CREATE TRIGGER trg_lender_profiles_updated_at
  BEFORE UPDATE ON lender_profiles
  FOR EACH ROW EXECUTE FUNCTION lender_profiles_set_updated_at();

-- =========================================================================
-- RLS
-- =========================================================================

ALTER TABLE lender_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_referrals ENABLE ROW LEVEL SECURITY;

-- Public anonymous read of active rows (directory page)
DROP POLICY IF EXISTS "lender_profiles_public_read" ON lender_profiles;
CREATE POLICY "lender_profiles_public_read" ON lender_profiles
  FOR SELECT
  USING (active = true);

-- Lenders update their own row
DROP POLICY IF EXISTS "lender_profiles_self_update" ON lender_profiles;
CREATE POLICY "lender_profiles_self_update" ON lender_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- INSERT/DELETE: no policy → service role only (bypasses RLS)

-- Referrals: worker sees own, lender sees own
DROP POLICY IF EXISTS "lender_referrals_read" ON lender_referrals;
CREATE POLICY "lender_referrals_read" ON lender_referrals
  FOR SELECT
  USING (
    worker_id = auth.uid()
    OR lender_id IN (SELECT id FROM lender_profiles WHERE id = auth.uid())
  );

-- INSERT/UPDATE: no policy → service role only

-- =========================================================================
-- SEED DATA (6 example listings — NOT real partners)
-- =========================================================================
-- We insert auth.users + profile stubs first (role='lender') then lender_profiles
-- using the same uuids. Stubs use a placeholder email pattern so they don't
-- collide with real auth users. The on-create trigger that auto-inserts into
-- profiles is bypassed by inserting profiles directly with ON CONFLICT DO NOTHING.

INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
VALUES
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed+kashable@krost.example',    '', NOW(), '{"provider":"seed"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed+oportun@krost.example',     '', NOW(), '{"provider":"seed"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed+lendingclub@krost.example', '', NOW(), '{"provider":"seed"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed+carvana@krost.example',     '', NOW(), '{"provider":"seed"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed+rocket@krost.example',      '', NOW(), '{"provider":"seed"}'::jsonb, '{}'::jsonb, NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111106', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed+fundera@krost.example',      '', NOW(), '{"provider":"seed"}'::jsonb, '{}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- The on-create trigger on auth.users may insert into profiles with role='gig_worker' default.
-- Upsert profile rows with role='lender' to override.
INSERT INTO profiles (id, role, name, email)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'lender', 'Kashable', 'seed+kashable@krost.example'),
  ('11111111-1111-1111-1111-111111111102', 'lender', 'Oportun', 'seed+oportun@krost.example'),
  ('11111111-1111-1111-1111-111111111103', 'lender', 'LendingClub', 'seed+lendingclub@krost.example'),
  ('11111111-1111-1111-1111-111111111104', 'lender', 'Carvana', 'seed+carvana@krost.example'),
  ('11111111-1111-1111-1111-111111111105', 'lender', 'Rocket Mortgage', 'seed+rocket@krost.example'),
  ('11111111-1111-1111-1111-111111111106', 'lender', 'Fundera', 'seed+fundera@krost.example')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;

INSERT INTO lender_profiles (
  id, company_name, slug, logo_url, tagline, description,
  website_url, application_url, loan_types,
  min_consistency_score, min_fico, states_served,
  min_loan_amount, max_loan_amount, typical_apr_min, typical_apr_max,
  featured, active, referral_fee_cents
) VALUES
(
  '11111111-1111-1111-1111-111111111101',
  'Kashable', 'kashable-payroll',
  'https://logo.clearbit.com/kashable.com',
  'Payroll-linked cash advances — no credit pull required.',
  E'**Example listing — not yet a Krost partner.**\n\nKashable offers cash advances and low-interest loans repaid directly via payroll deduction. They serve workers at participating employers, with no traditional credit pull. Approval is based on employment verification and recurring income — a natural fit for the consistency profile Krost measures.\n\nGood for: short-term cash needs, debt consolidation, emergency expenses. Not a fit if you need a large loan amount or don''t have payroll setup with a participating employer.',
  'https://kashable.com', 'https://kashable.com',
  ARRAY['cash_advance', 'personal'],
  50, NULL, ARRAY[]::text[],
  500, 20000, 6.00, 35.99,
  false, true, 5000
),
(
  '11111111-1111-1111-1111-111111111102',
  'Oportun', 'oportun-personal-loans',
  'https://logo.clearbit.com/oportun.com',
  'Personal loans for people building credit.',
  E'**Example listing — not yet a Krost partner.**\n\nOportun specializes in personal loans for borrowers with thin or no credit history. They use alternative data — including bank-deposit history and recurring income — to make underwriting decisions, which is exactly the signal Krost surfaces.\n\nGood for: gig workers without an established FICO, immigrants, first-time borrowers. Available in roughly 30 states.',
  'https://oportun.com', 'https://oportun.com/personal-loans',
  ARRAY['personal'],
  55, NULL,
  ARRAY['AZ','CA','FL','ID','IL','IN','KS','MD','MO','NV','NJ','NM','OH','OR','TX','UT','WA','WI']::text[],
  300, 10000, 19.90, 35.99,
  false, true, 7500
),
(
  '11111111-1111-1111-1111-111111111103',
  'LendingClub', 'lendingclub-gig',
  'https://logo.clearbit.com/lendingclub.com',
  'Fixed-rate personal loans up to $40,000.',
  E'**Example listing — not yet a Krost partner.**\n\nLendingClub offers unsecured personal loans with fixed rates and 24- to 60-month terms. For self-employed and gig-income borrowers, they typically request bank statements and tax returns; Krost''s verification report can short-circuit that diligence step.\n\nGood for: debt consolidation, home improvement, major purchases. Standard FICO underwriting still applies — Krost score is supplemental documentation, not a replacement for credit history.',
  'https://lendingclub.com', 'https://lendingclub.com/loans/personal-loans',
  ARRAY['personal'],
  60, 600, ARRAY[]::text[],
  1000, 40000, 8.91, 35.99,
  true, true, 10000
),
(
  '11111111-1111-1111-1111-111111111104',
  'Carvana', 'carvana-auto',
  'https://logo.clearbit.com/carvana.com',
  'Buy a car online. Get financing in minutes.',
  E'**Example listing — not yet a Krost partner.**\n\nCarvana finances vehicle purchases for borrowers across the credit spectrum, including FICO scores starting around 500. Their underwriting weights monthly income and debt-to-income ratio heavily — both of which Krost''s consistency score and annualized income help substantiate.\n\nGood for: used-car purchases, gig workers who need a reliable vehicle for rideshare or delivery. The application is fully online.',
  'https://carvana.com', 'https://carvana.com/finance',
  ARRAY['auto'],
  45, 500, ARRAY[]::text[],
  5000, 85000, 7.90, 27.90,
  false, true, 15000
),
(
  '11111111-1111-1111-1111-111111111105',
  'Rocket Mortgage', 'rocket-mortgage-self-employed',
  'https://logo.clearbit.com/rocketmortgage.com',
  'Mortgages for self-employed and 1099 income.',
  E'**Example listing — not yet a Krost partner.**\n\nRocket Mortgage underwrites conventional, FHA, VA, and jumbo loans, with dedicated workflows for self-employed borrowers. Self-employed applicants typically need 2 years of tax returns and bank statements; a Krost income verification report can supplement that documentation and clarify month-to-month consistency.\n\nGood for: home purchases and refinances. Minimum FICO around 620 for conventional, 580 for FHA. Krost score is not a substitute for traditional mortgage documentation but helps tell the income story.',
  'https://rocketmortgage.com', 'https://rocketmortgage.com/self-employed',
  ARRAY['mortgage'],
  70, 620, ARRAY[]::text[],
  50000, 1000000, 6.50, 8.50,
  false, true, 50000
),
(
  '11111111-1111-1111-1111-111111111106',
  'Fundera', 'fundera-business',
  'https://logo.clearbit.com/fundera.com',
  'Business loans for solopreneurs and small businesses.',
  E'**Example listing — not yet a Krost partner.**\n\nFundera (a NerdWallet company) is a marketplace that matches small businesses and sole proprietors with business loan products: lines of credit, term loans, SBA loans, equipment financing. Many gig workers operating as sole proprietors qualify for product lines unavailable through consumer-facing lenders.\n\nGood for: solopreneurs, LLC-organized gig workers, Shopify/Etsy sellers needing inventory financing. Typical minimum: 6 months in business and $50K+ annual revenue — Krost''s annualized income figure can document the revenue floor.',
  'https://fundera.com', 'https://fundera.com',
  ARRAY['business'],
  60, 600, ARRAY[]::text[],
  5000, 500000, 7.00, 30.00,
  true, true, 25000
)
ON CONFLICT (id) DO NOTHING;
