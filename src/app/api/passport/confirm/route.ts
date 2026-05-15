import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * POST /api/passport/confirm
 *
 * Called by the client after a successful on-chain mint.
 * Updates the passport record with on-chain data (token_id, tx_hash, minted_at).
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

  const { tokenId, txHash } = await request.json()

  if (!tokenId || !txHash) {
    return NextResponse.json({ error: 'tokenId and txHash are required' }, { status: 400 })
  }

  const { data: passport } = await supabase
    .from('passports')
    .select('id, current_score, score_tier')
    .eq('user_id', user.id)
    .single()

  if (!passport) {
    return NextResponse.json({ error: 'No passport record found. Call POST /api/passport/mint first.' }, { status: 404 })
  }

  // Update passport with on-chain data
  const { error } = await supabase
    .from('passports')
    .update({
      token_id: tokenId,
      minted_at: new Date().toISOString(),
      last_attested_at: new Date().toISOString(),
      attestation_count: 1,
    })
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create initial attestation history entry
  const { error: attestError } = await supabase
    .from('attestation_history')
    .insert({
      passport_id: passport.id,
      score: passport.current_score,
      score_tier: passport.score_tier,
      tx_hash: txHash,
      attested_at: new Date().toISOString(),
    })

  if (attestError) {
    // Non-fatal — passport is minted, just log the error
    console.error('Failed to create attestation history entry:', attestError.message)
  }

  return NextResponse.json({
    success: true,
    tokenId,
    txHash,
    message: 'Passport minted and confirmed on-chain.',
  })
}
