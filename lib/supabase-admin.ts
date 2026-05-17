import { createClient } from '@supabase/supabase-js';

// Service role client — only use in trusted server contexts (API routes, webhooks)
// WARNING: Do NOT expose to client side. This bypasses RLS.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
