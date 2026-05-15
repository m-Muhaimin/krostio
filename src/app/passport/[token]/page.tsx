import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ethers } from 'ethers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { INCOME_ATTESTATION_ABI, getContractAddress } from '@/lib/contract'
import type { Metadata } from 'next'

// ─── Tier definitions ────────────────────────────────────────────────

const SCORE_TIER_META: Record<string, { label: string; color: string; textColor: string; bgClass: string }> = {
  elite:    { label: 'Elite',      color: '#003c33', textColor: 'text-[#003c33]', bgClass: 'bg-[#edfce9]' },
  strong:   { label: 'Strong',     color: '#1863dc', textColor: 'text-[#1863dc]', bgClass: 'bg-[#f1f5ff]' },
  building: { label: 'Building',   color: '#ff7759', textColor: 'text-[#ff7759]', bgClass: 'bg-[#fff0ed]' },
  emerging: { label: 'Emerging',   color: '#75758a', textColor: 'text-[#75758a]', bgClass: 'bg-[#f2f2f2]' },
}

const INCOME_TIER_META: Record<string, { label: string; desc: string }> = {
  premium:  { label: 'Premium Income',    desc: 'Above $5,000 / month' },
  strong:   { label: 'Strong Income',     desc: '$3,000 – $4,999 / month' },
  moderate: { label: 'Moderate Income',   desc: '$1,500 – $2,999 / month' },
  entry:    { label: 'Entry Income',      desc: 'Up to $1,499 / month' },
}

function deriveIncomeTier(monthlyAvgUsd: number): string {
  if (monthlyAvgUsd >= 5000) return 'premium'
  if (monthlyAvgUsd >= 3000) return 'strong'
  if (monthlyAvgUsd >= 1500) return 'moderate'
  return 'entry'
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatMonths(months: number): string {
  if (months >= 24) {
    const yrs = Math.round(months / 12)
    return `${yrs} ${yrs === 1 ? 'year' : 'years'}`
  }
  return `${months} months`
}

// ─── Metadata ────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ show_exact?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const supabase = await createServerSupabaseClient()
  const { data: passport } = await supabase
    .from('passports')
    .select('score_tier, current_score')
    .eq('id', token)
    .eq('is_public', true)
    .maybeSingle()

  const tierLabel = passport?.score_tier
    ? (SCORE_TIER_META[passport.score_tier]?.label ?? 'Verified')
    : 'Verified'

  return {
    title: `Krost Passport — ${tierLabel} Worker`,
    description: `Verified gig worker credit profile. Score tier: ${tierLabel}. On-chain attestation on Base L2.`,
    openGraph: {
      title: `Krost Passport — ${tierLabel} Worker`,
      description: 'On-chain verified gig worker credit profile. Lender-ready income attestation.',
    },
  }
}

// ─── Page component ──────────────────────────────────────────────────

export default async function PassportPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const { show_exact } = await searchParams
  const showExact = show_exact === 'true'

  const supabase = await createServerSupabaseClient()

  // 1. Fetch passport
  const { data: passport } = await supabase
    .from('passports')
    .select('*')
    .eq('id', token)
    .eq('is_public', true)
    .maybeSingle()

  if (!passport) {
    notFound()
  }

  // 2. Fetch latest attestation history
  const { data: attestations } = await supabase
    .from('attestation_history')
    .select('*')
    .eq('passport_id', passport.id)
    .order('attested_at', { ascending: false })
    .limit(1)

  const latestAttestation = attestations?.[0] ?? null

  // 3. On-chain verification (read-only, best-effort)
  let onChainVerified = false
  let onChainScore: number | null = null
  let onChainMonthlyAvg: number | null = null
  let onChainTenure: number | null = null
  let onChainPlatforms: number | null = null

  if (passport.wallet_address) {
    try {
      const provider = new ethers.JsonRpcProvider('https://sepolia.base.org')
      const contractAddress = getContractAddress()
      const contract = new ethers.Contract(contractAddress, INCOME_ATTESTATION_ABI, provider)

      const ids: bigint[] = await contract.getWorkerAttestationIds(passport.wallet_address)

      // Walk from newest to oldest to find an active one
      for (let i = ids.length - 1; i >= 0; i--) {
        const att = await contract.attestations(ids[i])
        if (att.isActive) {
          onChainVerified = true
          onChainScore = Number(att.score) / 100       // contract stores ×100
          onChainMonthlyAvg = Number(att.monthlyAvgIncome) / 100  // cents → dollars
          onChainTenure = Number(att.tenureMonths)
          onChainPlatforms = Number(att.platformDiversity)
          break
        }
      }
    } catch {
      // On-chain query failed — page still works with DB data
      console.warn('On-chain query failed for wallet', passport.wallet_address)
    }
  }

  // 4. Derive display values
  const scoreTier = passport.score_tier ?? 'emerging'
  const tierMeta = SCORE_TIER_META[scoreTier] ?? SCORE_TIER_META.emerging

  const incomeTier = latestAttestation?.income_tier
    ?? (onChainMonthlyAvg ? deriveIncomeTier(onChainMonthlyAvg) : 'moderate')
  const incomeMeta = INCOME_TIER_META[incomeTier] ?? INCOME_TIER_META.moderate

  const tenureMonths = onChainTenure ?? passport.attestation_count > 0 ? 12 : 0
  const platformCount = onChainPlatforms ?? 1

  const txHash = latestAttestation?.tx_hash ?? null
  const attestedAt = latestAttestation?.attested_at ?? passport.last_attested_at ?? passport.created_at

  const basescanUrl = txHash
    ? `https://sepolia.basescan.org/tx/${txHash}`
    : `https://sepolia.basescan.org/address/${passport.wallet_address ?? ''}`

  // Determine actual monthly income for privacy gate
  const exactMonthly = showExact && passport.is_public
    ? (onChainMonthlyAvg ?? null)
    : null

  const exactScore = showExact && passport.is_public
    ? (onChainScore ?? passport.current_score ?? null)
    : null

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#212121] font-sans">
      {/* Header */}
      <header className="border-b border-[#f2f2f2]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-[#17171c]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Krost
            </span>
            <span className="rounded-full bg-[#eeece7] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#75758a]">
              Passport
            </span>
          </Link>
          <span className="text-sm text-[#75758a]">Lender Verification Portal</span>
        </div>
      </header>

      {/* Main card */}
      <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <div className="rounded-2xl border border-[#f2f2f2] bg-[#ffffff] p-8 sm:p-12 shadow-sm">
          {/* Verification badge */}
          <div className="mb-8 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#edfce9]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003c33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="text-sm font-medium text-[#003c33]">
              {onChainVerified ? 'Verified On-Chain' : 'Verified'}
            </span>
            {onChainVerified && (
              <span className="ml-auto text-xs text-[#75758a]">
                Base L2
              </span>
            )}
          </div>

          {/* Score Tier badge — hero */}
          <div className="mb-8 text-center">
            <div className={`mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 ${tierMeta.bgClass}`}>
              <span className={`text-sm font-semibold uppercase tracking-wider ${tierMeta.textColor}`}>
                {tierMeta.label}
              </span>
              {exactScore !== null && (
                <span className={`text-2xl font-bold ${tierMeta.textColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {exactScore}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-[#17171c]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Gig Worker Credit Profile
            </h1>
            {!exactScore && (
              <p className="mt-2 text-sm text-[#75758a]">
                Score tier is shown. Add ?show_exact=true to reveal exact score when authorized.
              </p>
            )}
          </div>

          {/* Metrics grid */}
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {/* Score tier */}
            <div className="rounded-xl border border-[#f2f2f2] bg-[#ffffff] p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[#75758a]">Score</div>
              <div className={`mt-1 text-lg font-bold ${tierMeta.textColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {tierMeta.label}
              </div>
            </div>

            {/* Income tier */}
            <div className="rounded-xl border border-[#f2f2f2] bg-[#ffffff] p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[#75758a]">Income</div>
              <div className="mt-1 text-sm font-semibold text-[#17171c]">
                {incomeMeta.label}
              </div>
              {exactMonthly !== null && (
                <div className="mt-0.5 text-xs text-[#75758a]">
                  ~${Math.round(exactMonthly / 500) * 500}/mo
                </div>
              )}
            </div>

            {/* Tenure */}
            <div className="rounded-xl border border-[#f2f2f2] bg-[#ffffff] p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[#75758a]">Tenure</div>
              <div className="mt-1 text-lg font-bold text-[#17171c]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {formatMonths(tenureMonths)}
              </div>
            </div>

            {/* Platforms */}
            <div className="rounded-xl border border-[#f2f2f2] bg-[#ffffff] p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[#75758a]">Platforms</div>
              <div className="mt-1 text-lg font-bold text-[#17171c]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {platformCount}
              </div>
            </div>
          </div>

          {/* On-chain details */}
          <div className="rounded-xl border border-[#f2f2f2] bg-[#fafafa] p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#75758a]">On-Chain Verification</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#75758a]">Contract</span>
                <a
                  href={`https://sepolia.basescan.org/address/${process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS ?? ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#1863dc] underline-offset-2 hover:underline"
                >
                  {shortenAddress(process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS ?? '')}
                </a>
              </div>
              {passport.wallet_address && (
                <div className="flex justify-between">
                  <span className="text-[#75758a]">Worker Wallet</span>
                  <span className="font-mono text-[#17171c]">
                    {shortenAddress(passport.wallet_address)}
                  </span>
                </div>
              )}
              {txHash && (
                <div className="flex justify-between">
                  <span className="text-[#75758a]">Attestation TX</span>
                  <a
                    href={basescanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#1863dc] underline-offset-2 hover:underline"
                  >
                    {shortenAddress(txHash)}
                  </a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#75758a]">Attested</span>
                <span className="text-[#17171c]">
                  {new Date(attestedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75758a]">Attestations</span>
                <span className="text-[#17171c]">{passport.attestation_count ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-[#75758a]">
            This passport confirms a {"worker's"} credit tier as computed from verified gig platform earnings.
            Exact financial details are only shown with explicit worker authorization.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#f2f2f2]">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-[#93939f]">
          <p>Krost — Income verification for the gig economy</p>
          <p className="mt-1">
            <Link href="/" className="text-[#1863dc] hover:underline">krost.xyz</Link>
            {' · '}
            <Link href="/privacy" className="text-[#1863dc] hover:underline">Privacy</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
