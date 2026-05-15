import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * POST /api/passport/update
 *
 * Pushes a new score attestation to an existing Passport.
 * Called either client-side (on-chain tx) or server-side (auto-sync).
 *
 * If txHash is provided, assumes client handled the on-chain tx.
 * If txHash is NOT provided, creates the attestation history entry
 * and marks for batch on-chain sync.
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

  const { txHash } = await request.json()

  // Get latest Krost Score
  const { data: krost } = await supabase
    .from('krost_scores')
    .select('score, tier, calculated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!krost) {
    return NextResponse.json({ error: 'No Krost Score found. Generate a score first.' }, { status: 400 })
  }

  // Get passport
  const { data: passport } = await supabase
    .from('passports')
    .select('id, current_score, attestation_count')
    .eq('user_id', user.id)
    .single()

  if (!passport) {
    return NextResponse.json({ error: 'No passport found. Mint a passport first.' }, { status: 404 })
  }

  // Update passport with new score
  const { error: updateError } = await supabase
    .from('passports')
    .update({
      current_score: krost.score,
      score_tier: krost.tier,
      last_attested_at: new Date().toISOString(),
      attestation_count: (passport.attestation_count || 0) + 1,
    })
    .eq('id', passport.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Create attestation history entry
  const { data: historyEntry, error: histError } = await supabase
    .from('attestation_history')
    .insert({
      passport_id: passport.id,
      score: krost.score,
      score_tier: krost.tier,
      tx_hash: txHash || null,
      attested_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (histError) {
    console.error('Failed to create attestation history:', histError.message)
  }

  return NextResponse.json({
    success: true,
    previousScore: passport.current_score,
    newScore: krost.score,
    scoreChange: krost.score - (passport.current_score || 0),
    txHash: txHash || null,
    attestationCount: (passport.attestation_count || 0) + 1,
    requiresOnChainTx: !txHash,
    message: txHash
      ? 'Passport updated and attested on-chain.'
      : 'Passport updated in database. Submit on-chain tx to complete attestation.',
  })
}
