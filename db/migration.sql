-- Krost Database Schema
-- Run this in Supabase SQL Editor to set up the database.

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'gig_worker' CHECK (role IN ('gig_worker', 'lender', 'admin')),
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trialing', 'active', 'past_due', 'canceled')),
  stripe_current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Platform connections
CREATE TABLE IF NOT EXISTS public.platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_user_id TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, platform)
);

-- 3. Income records
CREATE TABLE IF NOT EXISTS public.income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  trips_completed INTEGER DEFAULT 0,
  hours_active NUMERIC(8,2) DEFAULT 0,
  rating NUMERIC(3,2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Credit scores
CREATE TABLE IF NOT EXISTS public.credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 300 AND overall_score <= 850),
  monthly_avg_income NUMERIC(12,2) NOT NULL,
  income_volatility NUMERIC(6,4) NOT NULL,
  tenure_months INTEGER NOT NULL,
  platform_diversity INTEGER NOT NULL,
  reliability_score INTEGER NOT NULL CHECK (reliability_score >= 0 AND reliability_score <= 100),
  debt_to_income_ratio NUMERIC(6,4) DEFAULT 0,
  score_factors JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  attestation_id TEXT,
  UNIQUE(user_id)
);

-- 5. Lender access requests
CREATE TABLE IF NOT EXISTS public.lender_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  purpose TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(lender_id, worker_id)
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_income_records_user ON public.income_records(user_id);
CREATE INDEX IF NOT EXISTS idx_income_records_user_platform ON public.income_records(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_credit_scores_user ON public.credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_lender_requests_lender ON public.lender_requests(lender_id);
CREATE INDEX IF NOT EXISTS idx_lender_requests_worker ON public.lender_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_user ON public.platform_connections(user_id);

-- 7. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'gig_worker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lender_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read own, lenders can read worker names for requests
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Income records: only the owner can read/write
CREATE POLICY "Workers manage own income"
  ON public.income_records FOR ALL
  USING (auth.uid() = user_id);

-- Credit scores: worker can read own, lender can read with approved request
CREATE POLICY "Workers read own score"
  ON public.credit_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Lenders read approved scores"
  ON public.credit_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lender_requests
      WHERE lender_requests.lender_id = auth.uid()
        AND lender_requests.worker_id = credit_scores.user_id
        AND lender_requests.status = 'approved'
    )
  );

-- Lender requests: lenders create/read own, workers read/view requests to them
CREATE POLICY "Lenders manage own requests"
  ON public.lender_requests FOR ALL
  USING (auth.uid() = lender_id);

CREATE POLICY "Workers see requests to them"
  ON public.lender_requests FOR SELECT
  USING (auth.uid() = worker_id);

-- Platform connections: workers manage own
CREATE POLICY "Workers manage own connections"
  ON public.platform_connections FOR ALL
  USING (auth.uid() = user_id);
