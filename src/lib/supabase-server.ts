import { createClient } from '@supabase/supabase-js'

/** Server-side Supabase client using the service-role key.
 *  Bypasses RLS — access control is handled by our JWT auth layer.
 *  This keeps the app agnostic to the Postgres provider. */
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
