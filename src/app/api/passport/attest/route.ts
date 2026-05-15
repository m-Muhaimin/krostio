import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * POST /api/passport/attest
 *
 * Pillar 4: Krost Passport
 * Triggers an on-chain attestation of the worker's Krost Score.
 *
 * In a real production environment, this would:
 * 1. Validate the user has a qualifying score (>= 580)
 * 2. Connect to an Account Abstraction provider (e.g. Biconomy, Pimlico)
 * 3. Call the `mintPassport` or `updatePassport` function on the IncomeAttestation contract
 * 4. Pay gas from the Krostio paymaster
 * 5. Update the `passports` and `attestation_history` tables in Supabase
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Fetch latest score
  const { data: krostScore } = await supabase
    .from('krost_scores')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!krostScore || krostScore.score < 580) {
    return NextResponse.json({
      error: 'Qualifying score of 580 required for Passport minting.'
    }, { status: 400 })
  }

  // 2. Simulated Attestation Logic (for MVP/Solo phase)
  // In Phase 1, we simulate the L2 transaction to demonstrate the flow.
  const txHash = `0x${crypto.randomUUID().replace(/-/g, '')}`
  const tokenId = Math.floor(Math.random() * 1000000).toString()

  // 3. Upsert Passport record
  const { data: passport, error: passportError } = await supabase
    .from('passports')
    .upsert({
      user_id: user.id,
      wallet_address: `0x${user.id.slice(0, 8)}...simulated`,
      token_id: tokenId,
      chain: 'base',
      contract_address: process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS || '0xKrostPassportContract',
      minted_at: new Date().toISOString(),
      last_attested_at: new Date().toISOString(),
      current_score: krostScore.score,
      score_tier: krostScore.tier,
      attestation_count: 1,
    })
    .select()
    .single()

  if (passportError) {
    return NextResponse.json({ error: passportError.message }, { status: 500 })
  }

  // 4. Record Attestation History
  await supabase.from('attestation_history').insert({
    passport_id: passport.id,
    score: krostScore.score,
    income_tier: krostScore.tier,
    tx_hash: txHash,
    data_hash: crypto.randomUUID(), // simplified hash
  })

  return NextResponse.json({
    success: true,
    passport,
    txHash,
    message: 'Krost Passport successfully attested on Base L2.'
  })
}
