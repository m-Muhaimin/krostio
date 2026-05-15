-- Krost Platform v2 — Email Gate for Shareable Report Links
-- Adds viewer_token column for access control on public report links.
-- Run AFTER migration-v2.sql

-- Add viewer_token to report_views for access-gated PDF serving
ALTER TABLE public.report_views
ADD COLUMN IF NOT EXISTS viewer_token TEXT;

-- Index for token lookups (fast path on public GET)
CREATE INDEX IF NOT EXISTS idx_report_views_viewer_token
  ON public.report_views(viewer_token)
  WHERE viewer_token IS NOT NULL;

-- Add last_viewed_at to reports for freshness display
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

-- Enable RLS policies for public read on reports where share_token matches
-- (Existing RLS covers worker ownership; public access is via service client)
