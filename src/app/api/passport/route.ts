import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * GET /api/passport/[address]
 *
 * Public endpoint — returns public Passport data for a Base wallet address.
 * No auth required. Only returns data if passport.is_public = true.
 *
 * GET /api/passport
 *
 * Auth-only — returns the current user's Passport data + attestation history.
 *
 * POST /api/passport/mint
 *
 * Initiate an on-chain Passport mint for the current user.
 * Creates a passport record in DB (actual mint happens client-side via wagmi/ethers).
 */

/**
 * GET handler — two modes:
 *  - No address param: returns current user's passport (auth required)
 *  - address query param: returns public passport data (no auth)
 */
export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('address')

  // Public mode: query by wallet address
  if (walletAddress) {
    const { data: passport } = await supabase
      .from('passports')
      .select('id, wallet_address, token_id, chain, current_score, score_tier, minted_at, last_attested_at, attestation_count, is_public')
      .eq('wallet_address', walletAddress)
      .eq('is_public', true)
      .maybeSingle()

    if (!passport) {
      return NextResponse.json(
        { error: 'Passport not found or not public' },
        { status: 404 }
      )
    }

    // Fetch attestation history
    const { data: attestations } = await supabase
      .from('attestation_history')
      .select('score, score_tier, tx_hash, attested_at')
      .eq('passport_id', passport.id)
      .order('attested_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      passport: {
        walletAddress: passport.wallet_address,
        tokenId: passport.token_id,
        chain: passport.chain,
        currentScore: passport.current_score,
        scoreTier: passport.score_tier,
        mintedAt: passport.minted_at,
        lastAttestedAt: passport.last_attested_at,
        attestationCount: passport.attestation_count,
      },
      attestations: attestations?.map(a => ({
        score: a.score,
        scoreTier: a.score_tier,
        txHash: a.tx_hash,
        attestedAt: a.attested_at,
      })) || [],
    })
  }

  // Auth-only mode: return current user's passport
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: passport } = await supabase
    .from('passports')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!passport) {
    return NextResponse.json({
      passport: null,
      message: 'No passport found. Generate a Krost Score first, then mint your Passport.',
    })
  }

  // Fetch attestation history
  const { data: attestations } = await supabase
    .from('attestation_history')
    .select('*')
    .eq('passport_id', passport.id)
    .order('attested_at', { ascending: false })
    .limit(20)

  return NextResponse.json({
    passport: {
      id: passport.id,
      walletAddress: passport.wallet_address,
      tokenId: passport.token_id,
      chain: passport.chain,
      contractAddress: passport.contract_address,
      currentScore: passport.current_score,
      scoreTier: passport.score_tier,
      mintedAt: passport.minted_at,
      lastAttestedAt: passport.last_attested_at,
      attestationCount: passport.attestation_count,
      isPublic: passport.is_public,
    },
    attestations: attestations || [],
  })
}
