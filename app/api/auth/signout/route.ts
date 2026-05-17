import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * POST /api/auth/signout
 * Sign out the current user: revoke all Supabase sessions + clear cookies.
 */
export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Signed out successfully' });
}
