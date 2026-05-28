-- migration-011-paddle.sql
-- Replace Stripe with Paddle subscription management

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS paddle_price_id TEXT,
  ADD COLUMN IF NOT EXISTS paddle_current_period_end TIMESTAMPTZ;

-- Update subscription_status check to include paused status
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('free', 'active', 'past_due', 'paused', 'canceled'));
