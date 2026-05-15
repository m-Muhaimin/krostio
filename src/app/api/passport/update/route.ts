import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { syncOnChainAttestation } from '@/lib/score-sync'

/**
 * POST /api/passport/update
 *
 * Pushes a new score attestation to an existing Passport.
 *
 * If txHash is provided → assumes client handled the on-chain tx,
 * just stores the DB record.
 *
 * If txHash is NOT provided → syncs on-chain via the deployer key
 * (backend ethers write) AND stores the resulting txHash.
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

  const { txHash: clientTxHash } = await request.json()
  const hasClientTx = !!clientTxHash

  // Get latest Krost Score
  const { data: krost } = await supabase
    .from('krost_scores')
    .select('score, tier, breakdown, calculated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!krost) {
    return NextResponse.json({ error: 'No Krost Score found. Generate a score first.' }, { status: 400 })
  }

  // Get passport + wallet info
  const { data: passport } = await supabase
    .from('passports')
    .select('id, wallet_address, current_score, attestation_count')
    .eq('user_id', user.id)
    .single()

  if (!passport) {
    return NextResponse.json({ error: 'No passport found. Mint a passport first.' }, { status: 404 })
  }

  // Get income verification data for on-chain params
  const { data: incomeVer } = await supabase
    .from('income_verifications')
    .select('monthly_avg_income, income_volatility, tenure_months, platform_diversity, consistency_score')
    .eq('user_id', user.id)
    .maybeSingle()

  // ─── On-chain sync (automatic via deployer key when no client txHash) ───
  let syncResult = { txHash: clientTxHash || null, blockNumber: null as number | null }
  let syncError = null as string | null

  if (!hasClientTx && passport.wallet_address && incomeVer) {
    const result = await syncOnChainAttestation({
      workerAddress: passport.wallet_address,
      score: krost.score,
      monthlyAvgIncome: Number(incomeVer.monthly_avg_income),
      incomeVolatility: Number(incomeVer.income_volatility),
      tenureMonths: incomeVer.tenure_months,
      platformDiversity: incomeVer.platform_diversity,
      reliabilityScore: incomeVer.consistency_score,
    })

    if (result.success) {
      syncResult = { txHash: result.txHash!, blockNumber: result.blockNumber! }
    } else {
      syncError = result.error || 'On-chain sync failed'
      console.warn('[passport/update] On-chain sync warning (non-fatal):', syncError)
    }
  }

  // ─── Update passport with new score ───
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

  // ─── Create attestation history entry ───
  const historyPayload: Record<string, any> = {
    passport_id: passport.id,
    score: krost.score,
    score_tier: krost.tier,
    tx_hash: syncResult.txHash,
    attested_at: new Date().toISOString(),
  }
  if (syncResult.blockNumber) {
    historyPayload.block_number = syncResult.blockNumber
  }

  const { error: histError } = await supabase
    .from('attestation_history')
    .insert(historyPayload)

  if (histError) {
    console.error('Failed to create attestation history:', histError.message)
  }

  return NextResponse.json({
    success: true,
    previousScore: passport.current_score,
    newScore: krost.score,
    scoreChange: krost.score - (passport.current_score || 0),
    txHash: syncResult.txHash,
    blockNumber: syncResult.blockNumber,
    syncError,
    attestationCount: (passport.attestation_count || 0) + 1,
    message: syncResult.txHash
      ? 'Passport updated and attested on-chain.'
      : 'Passport updated in database.' + (syncError ? ` On-chain sync deferred: ${syncError}` : ''),
  })
}
