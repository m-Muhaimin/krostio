import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { mintOnChainAttestation } from '@/lib/contract';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { walletAddress } = await request.json();

  if (!walletAddress || typeof walletAddress !== 'string') {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  // Normalize
  const normalizedWallet = walletAddress.toLowerCase();

  const admin = createAdminClient();

  // Check if passport already exists for this user
  const { data: existing } = await admin
    .from('passports')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Update wallet address and re-mint
    const { error: updateError } = await admin
      .from('passports')
      .update({
        wallet_address: normalizedWallet,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Passport wallet updated',
      wallet_address: normalizedWallet,
    });
  }

  // Get latest score to associate with passport
  const { data: latestScore } = await supabase
    .from('krost_scores')
    .select('score, score_tier, factors')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Scale score for on-chain (score * 100)
  const rawScore = latestScore?.score ?? 300;
  const scaledScore = Math.min(85000, Math.max(30000, rawScore * 100));

  // Insert passport record
  const { data: passport, error: insertError } = await admin
    .from('passports')
    .insert({
      user_id: user.id,
      wallet_address: normalizedWallet,
      chain: 'base',
      contract_address: process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS || null,
      current_score: latestScore?.score || null,
      score_tier: latestScore?.score_tier || null,
      is_public: true,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Attempt on-chain attestation (gracefully skips if PRIVATE_KEY is placeholder)
  let txHash: string | null = null;
  try {
    const onChain = await mintOnChainAttestation({
      score: rawScore,
      monthlyAvgIncome: 0,      // Placeholder — could fetch from ledger
      incomeVolatility: 0,
      tenureMonths: 1,
      platformDiversity: 1,
      reliabilityScore: Math.round(((rawScore - 300) / 550) * 100),
    });
    if (onChain) {
      txHash = onChain.txHash;
    }
  } catch (e) {
    console.warn('[mint] On-chain attestation skipped:', e);
  }

  // Log to attestation_history
  if (txHash) {
    await admin.from('attestation_history').insert({
      user_id: user.id,
      wallet_address: normalizedWallet,
      token_id: passport.id,
      tx_hash: txHash,
      score: rawScore,
      action: 'mint',
      chain: 'base-sepolia',
    });
  }

  return NextResponse.json({
    id: passport.id,
    wallet_address: passport.wallet_address,
    chain: passport.chain,
    contract_address: passport.contract_address,
    current_score: passport.current_score,
    score_tier: passport.score_tier,
    is_public: passport.is_public,
    tx_hash: txHash,
    on_chain: txHash !== null,
    created_at: passport.created_at,
  }, { status: 201 });
}
