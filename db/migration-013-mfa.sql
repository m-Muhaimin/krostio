-- Adds MFA columns to profiles table

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_secret TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

UPDATE public.profiles SET mfa_enabled = false WHERE mfa_enabled IS NULL;
