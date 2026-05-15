import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import { syncOnChainAttestation } from '@/lib/score-sync'

/**
 * POST /api/passport/attest
 *
 * Pillar 4: Krost Passport
 * Triggers an on-chain attestation of the worker's Krost Score
 * via the deployer key. No user wallet required.
 *
 * Flow:
 *   Validate score ≥ 580
 *   Upsert passport record
 *   Call syncOnChainAttestation (deployer key → attestForWorker)
 *   Record attestation_history
 *   Return tx details
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

  // 1. Fetch latest krost score
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

  // 2. Use admin client to read/create passport
  const admin = createServiceSupabaseClient()

  const { data: existingPassport } = await admin
    .from('passports')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingPassport && !existingPassport.wallet_address) {
    return NextResponse.json({
      error: 'Connect a wallet first via the Passport page before attesting on-chain.',
    }, { status: 400 })
  }

  let walletAddress: `0x${string}` | null = existingPassport?.wallet_address as `0x${string}` | null

  // 3. Get income_verifications for sync params
  const { data: incomeVerif } = await supabase
    .from('income_verifications')
    .select('*')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Use defaults for any missing fields
  const monthlyAvgIncome = incomeVerif?.monthly_avg_income ?? 3000
  const incomeVolatility = incomeVerif?.income_volatility ?? 0.3
  const tenureMonths = incomeVerif?.tenure_months ?? 12
  const platformDiversity = incomeVerif?.platform_diversity ?? 1
  const reliabilityScore = (krostScore as any)?.reliability_score ?? 70

  // 4. Create/update passport record
  const passportPayload = {
    user_id: user.id,
    current_score: krostScore.score,
    score_tier: krostScore.tier,
    chain: 'base',
    contract_address: process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS || null,
  }

  let passportId = existingPassport?.id

  if (existingPassport) {
    await admin.from('passports').update(passportPayload).eq('id', existingPassport.id)
  } else {
    const { data: newPassport } = await admin
      .from('passports')
      .insert({ ...passportPayload, is_public: true })
      .select()
      .single()

    passportId = newPassport?.id
    walletAddress = newPassport?.wallet_address as `0x${string}` | null
  }

  if (!passportId) {
    return NextResponse.json({ error: 'Failed to create passport record' }, { status: 500 })
  }

  // 5. Execute on-chain attestation via deployer key
  if (walletAddress) {
    const syncResult = await syncOnChainAttestation({
      workerAddress: walletAddress,
      score: krostScore.score,
      monthlyAvgIncome,
      incomeVolatility,
      tenureMonths,
      platformDiversity,
      reliabilityScore,
    })

    if (syncResult.success) {
      // Record attestation history
      await admin.from('attestation_history').insert({
        passport_id: passportId,
        score: krostScore.score,
        score_tier: krostScore.tier,
        income_tier: monthlyAvgIncome >= 5000 ? 'premium' : monthlyAvgIncome >= 3000 ? 'strong' : 'moderate',
        tx_hash: syncResult.txHash,
      })

      // Update passport
      await admin.from('passports').update({
        last_attested_at: new Date().toISOString(),
        attestation_count: (existingPassport?.attestation_count ?? 0) + 1,
      }).eq('id', passportId)

      return NextResponse.json({
        success: true,
        txHash: syncResult.txHash,
        blockNumber: syncResult.blockNumber,
        passportId,
        message: 'Krost Passport attested on-chain.',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: syncResult.error,
        passportId,
        message: 'Passport record saved but on-chain attestation failed.',
      }, { status: 500 })
    }
  }

  // No wallet connected — just save the passport record without on-chain sync
  return NextResponse.json({
    success: true,
    passportId,
    message: 'Passport created. Connect a wallet to attest on-chain.',
  })
}
