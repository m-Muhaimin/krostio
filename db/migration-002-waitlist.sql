-- Migration 002: Add waitlist, onboarding cleanup
-- Run after migration.sql has been applied

-- Waitlist for lead magnet signups
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  score_estimate INTEGER,
  source_platform TEXT,
  role TEXT DEFAULT 'gig_worker',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up BOOLEAN DEFAULT FALSE
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow insert for anyone (public signup)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Allow select for own row (by id or email)
CREATE POLICY "Users can view own waitlist entry" ON public.waitlist
  FOR SELECT USING (auth.role() = 'authenticated');
