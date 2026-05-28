-- Krost Platform v10 — Email/Password Authentication
-- Run AFTER migration.sql + migration-v2.sql
-- Adds password_hash and auth_provider columns, removes FK dependency on auth.users

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'google';

UPDATE public.profiles SET auth_provider = 'google' WHERE auth_provider IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN auth_provider SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_auth_provider_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_auth_provider_check
  CHECK (auth_provider IN ('google', 'email'));

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
  ON public.profiles(email)
  WHERE email IS NOT NULL;
