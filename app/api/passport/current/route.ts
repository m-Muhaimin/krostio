import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('passports')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Table might not exist yet — return base state
    return NextResponse.json({
      passport: null,
      message: 'No passport found.',
    });
  }

  if (!data) {
    return NextResponse.json({
      passport: null,
      message: 'No passport minted yet.',
    });
  }

  return NextResponse.json({
    passport: {
      id: data.id,
      token_id: data.token_id,
      contract_address: data.contract_address,
      status: data.status || 'verified',
      chain: data.chain || 'base-sepolia',
      minted_at: data.minted_at || data.created_at,
      updated_at: data.updated_at,
      metadata: data.metadata || null,
    },
  });
}
