-- Migration 005: Reports table + storage for shareable PDFs

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewer_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_expires ON public.reports(expires_at);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Owner can manage
CREATE POLICY "Owner manages reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

-- Anyone with valid ID can read (for share links)
CREATE POLICY "Anyone can read valid reports"
  ON public.reports FOR SELECT
  USING (expires_at > NOW());
