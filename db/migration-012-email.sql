-- Adds email_verified column for email verification flow

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

UPDATE public.profiles SET email_verified = true WHERE email_verified IS NULL;
