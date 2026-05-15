import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * POST /api/passport/mint
 *
 * Initiates the Passport minting flow.
 * 1. Checks that the user has a Krost Score ≥ 580 (Building tier minimum)
 * 2. Creates a passport record in DB (as a draft)
 * 3. Returns the mint payload for the client to execute the on-chain transaction
 *
 * The actual on-chain mint happens client-side via wagmi/ethers.
 * After successful mint, the client calls POST /api/passport/confirm with the tx hash.
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

  const { walletAddress } = await request.json()
  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 })
  }

  // Check if passport already exists
  const { data: existingPassport } = await supabase
    .from('passports')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingPassport) {
    return NextResponse.json(
      { error: 'Passport already exists. Use POST /api/passport/update to update.' },
      { status: 409 }
    )
  }

  // Check Krost Score — minimum 580 (Building tier)
  const { data: krost } = await supabase
    .from('krost_scores')
    .select('score, tier, breakdown')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!krost) {
    return NextResponse.json(
      { error: 'No Krost Score found. Connect platforms and generate a score first.' },
      { status: 400 }
    )
  }

  if (krost.score < 580) {
    return NextResponse.json(
      {
        error: `Krost Score ${krost.score} is below the minimum of 580 (Building tier). Continue building your income history to qualify.`,
        currentScore: krost.score,
        currentTier: krost.tier,
        minimumScore: 580,
      },
      { status: 400 }
    )
  }

  // Check if wallet address is already used
  const { data: walletUsed } = await supabase
    .from('passports')
    .select('id')
    .eq('wallet_address', walletAddress)
    .maybeSingle()

  if (walletUsed) {
    return NextResponse.json(
      { error: 'This wallet address is already linked to another passport.' },
      { status: 409 }
    )
  }

  const contractAddress = process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS

  // Create passport draft record
  const { data: passport, error } = await supabase
    .from('passports')
    .insert({
      user_id: user.id,
      wallet_address: walletAddress,
      chain: 'base',
      contract_address: contractAddress || null,
      current_score: krost.score,
      score_tier: krost.tier,
      is_public: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return mint payload for client-side transaction
  return NextResponse.json({
    passport: {
      id: passport.id,
      walletAddress: passport.wallet_address,
      tokenId: passport.token_id,
      chain: passport.chain,
      contractAddress: passport.contract_address,
      currentScore: passport.current_score,
      scoreTier: passport.score_tier,
    },
    mintPayload: contractAddress ? {
      contractAddress,
      abi: [
        'function mintPassport(address worker, tuple(uint256 krostScore, uint256 annualizedIncome, uint256 platformCount, uint256 tenureMonths, string scoreTier, uint256 lastUpdated, uint256 verificationCount, bytes32 dataHash) data) external',
      ],
      args: {
        worker: walletAddress,
        data: {
          krostScore: krost.score,
          annualizedIncome: Math.round((krost.breakdown as any)?.annualizedIncome || 0),
          platformCount: (krost.breakdown as any)?.platformDiversity || 0,
          tenureMonths: (krost.breakdown as any)?.tenureMonths || 0,
          scoreTier: krost.tier,
          lastUpdated: Math.floor(Date.now() / 1000),
          verificationCount: 1,
          dataHash: '0x' + Buffer.from(JSON.stringify({ score: krost.score, tier: krost.tier })).toString('hex').slice(0, 64),
        },
      },
    } : null,
    message: 'Passport record created. Execute the on-chain mint from the client, then call POST /api/passport/confirm to finalize.',
  })
}
