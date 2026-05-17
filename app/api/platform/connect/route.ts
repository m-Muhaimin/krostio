import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { platform, argyle_account_id } = body;

  if (!platform) {
    return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('platform_connections')
    .upsert(
      {
        user_id: user.id,
        platform,
        argyle_account_id: argyle_account_id || null,
        connection_status: argyle_account_id ? 'active' : 'pending',
        last_sync_at: argyle_account_id ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id, platform' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connection: data }, { status: 201 });
}
