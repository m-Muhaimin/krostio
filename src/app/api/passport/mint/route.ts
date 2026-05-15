import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * POST /api/passport/mint
 *
 * Initiates the Passport minting flow.
 * 1. Checks Krost Score ≥ 580 (Building tier minimum)
 * 2. Fetches income verification data for contract params
 * 3. Creates a passport record in DB (draft)
 * 4. Returns the data needed for client-side on-chain createAttestation()
 *
 * The actual on-chain tx happens client-side via wagmi/viem.
 * After successful mint, the client calls POST /api/passport/confirm.
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
    .select('score, tier')
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
        error: `Krost Score ${krost.score} is below the minimum of 580 (Building tier).`,
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

  // Fetch income verification data for contract params
  const { data: incomeVerification } = await supabase
    .from('income_verifications')
    .select('monthly_avg_income, income_volatility, tenure_months, platform_diversity, consistency_score')
    .eq('user_id', user.id)
    .maybeSingle()

  // Build contract params for createAttestation()
  const score = Math.min(850, Math.max(300, krost.score))
  const monthlyAvgIncome = incomeVerification?.monthly_avg_income
    ? Math.round(Number(incomeVerification.monthly_avg_income) * 100) // convert to cents
    : 0
  const incomeVolatility = incomeVerification?.income_volatility
    ? Math.min(10000, Math.max(0, Math.round(Number(incomeVerification.income_volatility) * 10000)))
    : 0
  const tenureMonths = incomeVerification?.tenure_months ?? 1
  const platformDiversity = incomeVerification?.platform_diversity ?? 1
  const reliabilityScore = incomeVerification?.consistency_score ?? 50

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

  return NextResponse.json({
    passport: {
      id: passport.id,
      walletAddress: passport.wallet_address,
      chain: passport.chain,
      contractAddress: passport.contract_address,
      currentScore: passport.current_score,
      scoreTier: passport.score_tier,
    },
    mintPayload: contractAddress ? {
      contractAddress,
      method: 'createAttestation',
      params: {
        score: score * 100,     // 300–850 → scaled to 30000–85000
        monthlyAvgIncome,        // USD cents
        incomeVolatility,        // 0–10000 (4 decimals)
        tenureMonths,
        platformDiversity,
        reliabilityScore,        // 0–100
      },
    } : null,
    message: 'Passport record created. Use wagmi/viem to call createAttestation() on-chain, then POST /api/passport/confirm.',
  })
}
