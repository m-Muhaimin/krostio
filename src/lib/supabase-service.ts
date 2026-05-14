import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for server-side operations that need to bypass RLS.
 * NEVER expose this to the client. Use sparingly inside API routes after auth has
 * been verified with the regular cookie-based createServerSupabaseClient().
 */
export function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
