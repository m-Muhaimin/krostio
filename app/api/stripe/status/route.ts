import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ plan: 'free', status: 'unauthenticated' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_plan')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    plan: profile?.subscription_plan || 'free',
    status: profile?.subscription_status || 'free',
  });
}
