-- Migration 006: Lender verification usage tracking (F-09)
--
-- A "verification" is a billable event a lender consumes against their plan
-- quota. It is recorded whenever the lender views a worker's full credit
-- score — either via an approved lender_request or a full-score search hit
-- or a report view.

CREATE TABLE IF NOT EXISTS public.verification_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL CHECK (source IN ('search', 'request', 'report_view'))
);

CREATE INDEX IF NOT EXISTS idx_verification_usage_lender_used
  ON public.verification_usage(lender_id, used_at DESC);

CREATE INDEX IF NOT EXISTS idx_verification_usage_worker
  ON public.verification_usage(worker_id);

ALTER TABLE public.verification_usage ENABLE ROW LEVEL SECURITY;

-- Lenders can read their own usage rows
DROP POLICY IF EXISTS "Lender reads own verification usage" ON public.verification_usage;
CREATE POLICY "Lender reads own verification usage"
  ON public.verification_usage FOR SELECT
  USING (auth.uid() = lender_id);

-- Service role bypasses RLS by default; no insert/update/delete policies are
-- exposed to authenticated users — writes happen only via the service-role
-- client from API routes after auth + quota checks.

-- Helper function: count verifications for a lender since a timestamp
CREATE OR REPLACE FUNCTION public.get_lender_verification_count(
  p_lender_id UUID,
  p_since TIMESTAMPTZ
)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.verification_usage
  WHERE lender_id = p_lender_id
    AND used_at >= p_since;
$$;

INSERT INTO public._migrations (name, applied_at)
VALUES ('006-lender-verifications', NOW())
ON CONFLICT (name) DO NOTHING;
