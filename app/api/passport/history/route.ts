import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get user's passport
  const { data: passport, error: passportError } = await admin
    .from('passports')
    .select('id, wallet_address, token_id, chain, minted_at, attestation_count, current_score, score_tier, is_public')
    .eq('user_id', user.id)
    .single();

  if (passportError || !passport) {
    return NextResponse.json({
      passport: null,
      history: [],
      message: 'No passport minted yet.',
    });
  }

  // Fetch attestation history
  const { data: history, error: historyError } = await admin
    .from('attestation_history')
    .select('id, score, score_tier, data_hash, tx_hash, block_number, attested_at')
    .eq('passport_id', passport.id)
    .order('attested_at', { ascending: false })
    .limit(50);

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  return NextResponse.json({
    passport: {
      id: passport.id,
      wallet_address: passport.wallet_address,
      token_id: passport.token_id,
      chain: passport.chain,
      minted_at: passport.minted_at,
      attestation_count: passport.attestation_count,
      current_score: passport.current_score,
      score_tier: passport.score_tier,
      is_public: passport.is_public,
    },
    history: history || [],
  });
}
