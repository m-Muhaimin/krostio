-- Migration 003: Plaid integration fields on platform_connections
-- Adds access_token (encrypted at rest by Postgres), item_id, institution metadata.

ALTER TABLE public.platform_connections
  ADD COLUMN IF NOT EXISTS access_token TEXT,
  ADD COLUMN IF NOT EXISTS item_id TEXT,
  ADD COLUMN IF NOT EXISTS institution_id TEXT,
  ADD COLUMN IF NOT EXISTS institution_name TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'manual' CHECK (provider IN ('plaid', 'manual', 'oauth'));

-- Index for Plaid item lookups (webhook handler will use this)
CREATE INDEX IF NOT EXISTS idx_platform_connections_item ON public.platform_connections(item_id) WHERE item_id IS NOT NULL;
