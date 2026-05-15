import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PassportClient } from './passport-client'

export const dynamic = 'force-dynamic'

async function fetchPassport() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { passport: null, attestations: [], currentScore: null, currentTier: null, userEmail: null, userId: '' }

  // Fetch passport record
  const { data: passport } = await supabase
    .from('passports')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch attestation history
  let attestations: any[] = []
  if (passport) {
    const { data: attests } = await supabase
      .from('attestation_history')
      .select('*')
      .eq('passport_id', passport.id)
      .order('attested_at', { ascending: false })
      .limit(20)
    attestations = attests || []
  }

  // Check if they have a Krost score
  const { data: krost } = await supabase
    .from('krost_scores')
    .select('score, tier, breakdown')
    .eq('user_id', user.id)
    .maybeSingle()

  return {
    passport: passport ? {
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
    } : null,
    attestations,
    currentScore: krost?.score ?? null,
    currentTier: krost?.tier ?? null,
    userEmail: user.email ?? null,
    userId: user.id ?? '',
  }
}

export default async function PassportPage() {
  await requireRole(['gig_worker'])
  const data = await fetchPassport()

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Worker</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Krost Passport.
        </h1>
        <p className="mt-3 text-body text-slate max-w-2xl">
          Your permanent, on-chain financial identity. A soul-bound token (SBT) on Base L2 that
          carries your verified income history — owned by you, forever, independent of any platform.
        </p>
      </div>

      {/* Value prop cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Portable',
            description: 'Take your financial identity anywhere. Your Passport lives on-chain, not in a corporate silo.',
            icon: '↗',
          },
          {
            title: 'Verifiable',
            description: 'Lenders can verify your score directly on-chain. No PDFs, no middlemen, no delays.',
            icon: '✓',
          },
          {
            title: 'Immutable',
            description: 'Every attestation is permanent. Even if Krostio shuts down, your history survives on Base.',
            icon: '🔒',
          },
        ].map((card) => (
          <div key={card.title} className="card-bordered px-6 py-8">
            <span className="text-2xl">{card.icon}</span>
            <h3 className="mt-4 font-display text-xl tracking-tight text-ink-black">{card.title}</h3>
            <p className="mt-2 text-sm text-slate leading-relaxed">{card.description}</p>
          </div>
        ))}
      </section>

      <PassportClient
        passport={data.passport}
        attestations={data.attestations}
        currentScore={data.currentScore}
        currentTier={data.currentTier}
        userEmail={data.userEmail}
        userId={data.userId}
      />
    </div>
  )
}
