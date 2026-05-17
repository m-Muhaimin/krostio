-- ============================================================================
-- Krostio Database Migration
-- Tables discovered from API route analysis:
--   profiles, platform_connections, income_records, income_verifications,
--   krost_scores, passports, attestation_history, reports, report_views
-- ============================================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. Profiles
-- Stores user profile info, linked to Supabase Auth users by id
-- ============================================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  avatar_url      text,
  email           text,
  stripe_customer_id text,
  subscription_status text default 'free',
  subscription_plan  text default 'free',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. Platform Connections
-- Linked gig / bank accounts (via Argyle, Plaid, or manual)
-- ============================================================================
create table if not exists public.platform_connections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  platform        text not null,              -- e.g. 'uber', 'doordash', 'lyft'
  provider        text,                        -- 'plaid', 'argyle', 'manual'
  access_token    text,                        -- encrypted token for provider API
  item_id         text,                        -- Plaid item_id
  institution_id  text,
  institution_name text,
  argyle_account_id text,                      -- Argyle account identifier
  connection_status text not null default 'pending',  -- 'pending', 'active', 'disconnected', 'error'
  is_active       boolean default false,
  last_sync_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, platform)
);

-- ============================================================================
-- 3. Income Records
-- Individual earnings entries synced from connected platforms
-- Used by: ledger/entries, ledger/summary, ledger/export, plaid/exchange
-- ============================================================================
create table if not exists public.income_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  platform        text not null,
  gross_earnings  numeric(12,2) not null default 0,
  net_earnings    numeric(12,2),
  fee_amount      numeric(12,2),
  currency        text default 'USD',
  period_start    date,                        -- start of the pay period
  period_end      date,                        -- end of the pay period
  category        text,                        -- e.g. 'delivery', 'rideshare', 'freelance'
  created_at      timestamptz not null default now()
);

create index if not exists idx_income_records_user_period
  on public.income_records(user_id, period_start desc);

-- ============================================================================
-- 4. Income Verifications (separate table from income_records)
-- Used by: reports/generate route to build report data
-- Stored with gross_amount / net_amount naming convention
-- ============================================================================
create table if not exists public.income_verifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  platform        text not null,
  gross_amount    numeric(12,2) not null default 0,
  net_amount      numeric(12,2),
  period_start    date,
  period_end      date,
  currency        text default 'USD',
  verified_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_income_verifications_user_period
  on public.income_verifications(user_id, period_start desc);

-- ============================================================================
-- 5. Krost Scores
-- Computed credit/earnings scores for each user
-- ============================================================================
create table if not exists public.krost_scores (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  score           numeric(5,1),                -- 0–850 Krost Score
  score_tier      text,                        -- 'Emerging', 'Building', 'Strong', 'Elite'
  breakdown       jsonb,                       -- per-factor contribution breakdown
  factors         jsonb,                       -- raw factor values used in calculation
  income_snapshot jsonb,                       -- snapshot of income data at calculation time
  calculated_at   timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index if not exists idx_krost_scores_user_calculated
  on public.krost_scores(user_id, calculated_at desc);

-- ============================================================================
-- 6. Passports
-- On-chain identity passports linking wallet address to Krost Score
-- ============================================================================
create table if not exists public.passports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade unique,
  wallet_address  text,
  token_id        text,                        -- NFT token ID on-chain
  contract_address text,
  chain           text default 'base-sepolia',
  current_score   numeric(5,1),
  score_tier      text,
  attestation_count integer default 0,
  status          text default 'verified',
  is_public       boolean default true,
  metadata        jsonb,
  minted_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- 7. Attestation History
-- Historical record of on-chain attestations/snapshots per passport
-- ============================================================================
create table if not exists public.attestation_history (
  id              uuid primary key default gen_random_uuid(),
  passport_id     uuid not null references public.passports(id) on delete cascade,
  score           numeric(5,1),
  score_tier      text,
  data_hash       text,                        -- hash of the attested data
  tx_hash         text,                        -- on-chain transaction hash
  block_number    numeric,
  attested_at     timestamptz not null default now()
);

create index if not exists idx_attestation_history_passport
  on public.attestation_history(passport_id, attested_at desc);

-- ============================================================================
-- 8. Reports
-- Generated income verification reports (PDF) for sharing with lenders
-- ============================================================================
create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  report_type     text default 'standard_pdf',
  score_snapshot  jsonb,                       -- score data at generation time
  ledger_snapshot jsonb,                       -- ledger data at generation time
  file_path       text,                        -- Supabase Storage path
  file_size       integer,
  share_token     text unique,                 -- unique token for shared access
  is_revoked      boolean default false,
  viewer_count    integer default 0,
  last_viewed_at  timestamptz,
  expires_at      timestamptz,                 -- link expiry (null = never)
  created_at      timestamptz not null default now()
);

create index if not exists idx_reports_user_id
  on public.reports(user_id, created_at desc);

create index if not exists idx_reports_share_token
  on public.reports(share_token)
  where share_token is not null;

-- ============================================================================
-- 9. Report Views
-- Tracks who viewed a shared report (for compliance & analytics)
-- ============================================================================
create table if not exists public.report_views (
  id              uuid primary key default gen_random_uuid(),
  report_id       uuid not null references public.reports(id) on delete cascade,
  viewer_email    text,
  viewer_ip       text,
  user_agent      text,
  viewed_at       timestamptz not null default now()
);

create index if not exists idx_report_views_report_id
  on public.report_views(report_id, viewed_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Profiles: users can read/update their own
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Platform Connections: users manage their own
alter table public.platform_connections enable row level security;
drop policy if exists "Users can view own connections" on public.platform_connections;
create policy "Users can view own connections"
  on public.platform_connections for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own connections" on public.platform_connections;
create policy "Users can insert own connections"
  on public.platform_connections for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own connections" on public.platform_connections;
create policy "Users can update own connections"
  on public.platform_connections for update using (auth.uid() = user_id);

-- Income Records: users manage their own
alter table public.income_records enable row level security;
drop policy if exists "Users can view own records" on public.income_records;
create policy "Users can view own records"
  on public.income_records for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own records" on public.income_records;
create policy "Users can insert own records"
  on public.income_records for insert with check (auth.uid() = user_id);

-- Income Verifications: users manage their own
alter table public.income_verifications enable row level security;
drop policy if exists "Users can view own verifications" on public.income_verifications;
create policy "Users can view own verifications"
  on public.income_verifications for select using (auth.uid() = user_id);

-- Krost Scores: users view own
alter table public.krost_scores enable row level security;
drop policy if exists "Users can view own scores" on public.krost_scores;
create policy "Users can view own scores"
  on public.krost_scores for select using (auth.uid() = user_id);

-- Passports: users view own, public passports viewable by anyone
alter table public.passports enable row level security;
drop policy if exists "Users can view own passport" on public.passports;
create policy "Users can view own passport"
  on public.passports for select using (auth.uid() = user_id or is_public = true);
drop policy if exists "Users can insert own passport" on public.passports;
create policy "Users can insert own passport"
  on public.passports for insert with check (auth.uid() = user_id);

-- Reports: users manage their own, shared via share_token (handled by admin client)
alter table public.reports enable row level security;
drop policy if exists "Users can view own reports" on public.reports;
create policy "Users can view own reports"
  on public.reports for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own reports" on public.reports;
create policy "Users can insert own reports"
  on public.reports for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own reports" on public.reports;
create policy "Users can update own reports"
  on public.reports for update using (auth.uid() = user_id);

-- Report Views: only insert via API (admin client bypasses RLS)
alter table public.report_views enable row level security;
drop policy if exists "Users can view own report views" on public.report_views;
create policy "Users can view own report views"
  on public.report_views for select using (
    exists (select 1 from public.reports where reports.id = report_views.report_id and reports.user_id = auth.uid())
  );
