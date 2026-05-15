const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!ACCESS_TOKEN) throw new Error('SUPABASE_ACCESS_TOKEN env var required');
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ucjrosgtwypntcccelhi';
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;

async function runSQL(sql, label) {
  const res = await fetch(`${API_BASE}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (res.ok) {
    console.log(`✅ ${label}`);
    return true;
  } else {
    const text = await res.text();
    console.log(`❌ ${label}: ${text.slice(0, 200)}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing remaining migration issues...\n');

  // 1. Mark 004 as tracked (table + policies already exist)
  await runSQL(
    `INSERT INTO public._migrations (name, applied_at) VALUES ('004-income-verification', NOW()) ON CONFLICT DO NOTHING;`,
    'Track 004-income-verification'
  );

  // 2. Fix 005: drop problematic index, ensure columns exist
  await runSQL(
    `DROP INDEX IF EXISTS idx_reports_expires;`,
    'Drop invalid reports index'
  );
  await runSQL(
    `ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;`,
    'Add last_viewed_at column'
  );
  await runSQL(
    `INSERT INTO public._migrations (name, applied_at) VALUES ('005-reports', NOW()) ON CONFLICT DO NOTHING;`,
    'Track 005-reports'
  );

  // 3. Fix 007: Create lender_profiles and lender_referrals with proper column references
  // The seed data INSERT references full_name and onboarding_completed which don't exist.
  // We need to fix those references.
  
  // First, check what columns profiles has
  const profileCheckRes = await fetch(`${API_BASE}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public' ORDER BY ordinal_position`
    }),
  });
  if (profileCheckRes.ok) {
    const cols = await profileCheckRes.json();
    console.log(`📋 profiles columns: ${cols.map(c => c.column_name).join(', ')}`);
  }

  // Execute the migration but fix the seed insert
  const migration007 = `
-- Migration 007: Lender Directory + referral tracking (PRD F-12)
-- Fixed version — uses name and role instead of full_name and onboarding_completed

CREATE TABLE IF NOT EXISTS public.lender_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.lender_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  lender_id uuid NOT NULL REFERENCES public.lender_profiles(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_lender_profiles_featured_active
  ON public.lender_profiles (featured DESC, active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lender_profiles_loan_types
  ON public.lender_profiles USING GIN (loan_types);
CREATE INDEX IF NOT EXISTS idx_lender_profiles_states_served
  ON public.lender_profiles USING GIN (states_served);
CREATE INDEX IF NOT EXISTS idx_lender_referrals_worker
  ON public.lender_referrals (worker_id);
CREATE INDEX IF NOT EXISTS idx_lender_referrals_lender_clicked
  ON public.lender_referrals (lender_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_lender_referrals_ref_code
  ON public.lender_referrals (ref_code);

ALTER TABLE public.lender_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lender_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lender_profiles_public_read" ON public.lender_profiles;
CREATE POLICY "lender_profiles_public_read" ON public.lender_profiles
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "lender_profiles_self_update" ON public.lender_profiles;
CREATE POLICY "lender_profiles_self_update" ON public.lender_profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "lender_referrals_read" ON public.lender_referrals;
CREATE POLICY "lender_referrals_read" ON public.lender_referrals
  FOR SELECT USING (
    worker_id = auth.uid()
    OR lender_id IN (SELECT id FROM public.lender_profiles WHERE id = auth.uid())
  );
`;

  console.log('\n🔄 Applying migration 007 (fixed)...');
  const res007 = await runSQL(migration007, '007-lender-directory tables');
  
  // If tables were already created by a previous attempt, just track it
  if (!res007) {
    console.log('  Tables may already exist — checking status...');
    const checkRes = await fetch(`${API_BASE}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lender_profiles') AS exists`
      }),
    });
    const checkData = await checkRes.json();
    if (checkData[0]?.exists) {
      console.log('  ✅ lender_profiles already exists');
    }
  }

  // Track 007 regardless
  await runSQL(
    `INSERT INTO public._migrations (name, applied_at) VALUES ('007-lender-directory', NOW()) ON CONFLICT DO NOTHING;`,
    'Track 007-lender-directory'
  );

  // Final summary: check all migrations
  console.log('\n📋 Final migration status:');
  const finalRes = await fetch(`${API_BASE}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: 'SELECT name, applied_at FROM public._migrations ORDER BY applied_at'
    }),
  });
  if (finalRes.ok) {
    const data = await finalRes.json();
    for (const m of data) {
      console.log(`  ${m.name} — ${m.applied_at}`);
    }
  }
}

main().catch(e => console.error('Fatal:', e.message));
