import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient> | null = null

/**
 * Creates (or returns) a Supabase admin client using the SERVICE_ROLE key.
 * Bypasses RLS — use ONLY in server-to-server contexts where there is no
 * authenticated user session (webhooks, background jobs, migrations).
 *
 * Never expose this client to the browser or pass it to client components.
 */
export function getSupabaseAdmin() {
  if (adminClient) return adminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL env vars'
    )
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
