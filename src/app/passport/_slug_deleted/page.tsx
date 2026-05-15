import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ─── Simple relative time helpers ───

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(months / 12)
  return `${years}y ago`
}

function formatTenure(months: number): string {
  if (months >= 12) {
    const y = Math.floor(months / 12)
    const m = months % 12
    return m > 0 ? `${y}y ${m}m` : `${y}y`
  }
  return `${months}m`
}

// ─── Income tiers (categories are always shown, exact amounts only when is_public) ───

type IncomeTier = 'elite' | 'strong' | 'stable' | 'building' | 'entry'

function deriveIncomeTier(monthlyUsd: number): { tier: IncomeTier; label: string } {
  if (monthlyUsd >= 5000) return { tier: 'elite', label: 'High' }
  if (monthlyUsd >= 2500) return { tier: 'strong', label: 'Upper-Middle' }
  if (monthlyUsd >= 1000) return { tier: 'stable', label: 'Middle' }
  if (monthlyUsd >= 500)  return { tier: 'building', label: 'Lower-Middle' }
  return { tier: 'entry', label: 'Entry Level' }
}

// ─── Fetch helpers ───

interface PublicPageData {
  passport: {
    id: string
    user_id: string
    walletAddress: string | null
    tokenId: string | null
    chain: string
    contractAddress: string | null
    currentScore: number
    scoreTier: string
    mintedAt: string | null
    lastAttestedAt: string | null
    attestationCount: number
    isPublic: boolean
  }
  incomeVerification: {
    monthlyAvgIncome: number
    tenureMonths: number
    estimatedIncomeTier: IncomeTier
    estimatedIncomeLabel: string
  } | null
  attestations: Array<{
    score: number
    scoreTier: string
    txHash: string | null
    attestedAt: string
  }>
}

async function fetchPublicData(slug: string, supabase: ReturnType<typeof createServerClient>): Promise<PublicPageData | null> {
  // Fetch passport row
  const { data: passport } = await supabase
    .from('passports')
    .select('*')
    .eq('id', slug)
    .maybeSingle()

  if (!passport) return null

  // Fetch income verifications for tenure and income tier
  let incomeVer = null
  if (passport.user_id) {
    const { data: iv } = await supabase
      .from('income_verifications')
      .select('monthly_avg_income, tenure_months')
      .eq('user_id', passport.user_id)
      .maybeSingle()
    incomeVer = iv
  }

  let incomeTierInfo = null
  if (incomeVer) {
    incomeTierInfo = {
      monthlyAvgIncome: Number(incomeVer.monthly_avg_income),
      tenureMonths: incomeVer.tenure_months,
      ...deriveIncomeTier(Number(incomeVer.monthly_avg_income)),
    }
  }

  // Fetch attestation history
  const { data: attestations } = await supabase
    .from('attestation_history')
    .select('score, score_tier, tx_hash, attested_at')
    .eq('passport_id', slug)
    .order('attested_at', { ascending: false })
    .limit(10)

  return {
    passport: {
      id: passport.id,
      user_id: passport.user_id,
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
    incomeVerification: incomeTierInfo,
    attestations: attestations?.map(a => ({
      score: a.score,
      scoreTier: a.score_tier,
      txHash: a.tx_hash,
      attestedAt: a.attested_at,
    })) || [],
  }
}

// ─── Tier styling ───

const TIER_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  elite:     { bg: 'bg-emerald-100', text: 'text-emerald-800', bar: 'bg-emerald-500' },
  strong:    { bg: 'bg-blue-100',    text: 'text-blue-800',    bar: 'bg-blue-500' },
  building:  { bg: 'bg-amber-100',   text: 'text-amber-800',   bar: 'bg-amber-500' },
  emerging:  { bg: 'bg-gray-100',    text: 'text-gray-600',    bar: 'bg-gray-400' },
}

// Income tier uses a separate color map since the labels differ (but reuse the keys)
const INCOME_COLORS: Record<string, { bg: string; text: string }> = {
  elite:    { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  strong:   { bg: 'bg-blue-100',    text: 'text-blue-800' },
  stable:   { bg: 'bg-violet-100',  text: 'text-violet-800' },
  building: { bg: 'bg-amber-100',   text: 'text-amber-800' },
  entry:    { bg: 'bg-gray-100',    text: 'text-gray-600' },
}

function scoreTierStyle(tier: string) {
  return TIER_COLORS[tier.toLowerCase()] || TIER_COLORS.emerging
}

function incomeTierStyle(tier: string) {
  return INCOME_COLORS[tier] || INCOME_COLORS.entry
}

// ─── Page ───

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const data = await fetchPublicData(slug, supabase)
  if (!data) notFound()

  const { passport, incomeVerification, attestations } = data
  const sTier = scoreTierStyle(passport.scoreTier)
  const iTier = incomeVerification ? incomeTierStyle(incomeVerification.estimatedIncomeTier) : null

  return (
    <main className="min-h-screen bg-canvas-cream">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-ink-black">
            Krost
          </Link>
          <span className="text-sm text-gray-500">
            Income Passport
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-ink-black">Income Passport</h1>
          <p className="mt-2 text-gray-500">
            Verified on {passport.chain === 'base' ? 'Base L2' : passport.chain}
            {passport.mintedAt && (
              <span> · Minted {timeAgo(new Date(passport.mintedAt))}</span>
            )}
          </p>
        </div>

        {/* Privacy notice */}
        {!passport.isPublic && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700">
            This passport is set to private. Only overview categories are shown.
          </div>
        )}

        {/* Metric Cards */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-px bg-gray-200 sm:grid-cols-3">

            {/* Score Tier */}
            <div className="bg-white p-6 text-center">
              <p className="text-sm font-medium text-gray-500">Score Tier</p>
              <div className="mt-2">
                <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold uppercase ${sTier.bg} ${sTier.text}`}>
                  {passport.scoreTier}
                </span>
              </div>
              {passport.isPublic && (
                <p className="mt-2 text-xs text-gray-400">
                  Score: {passport.currentScore} / 850
                </p>
              )}
            </div>

            {/* Income Tier */}
            <div className="bg-white p-6 text-center">
              <p className="text-sm font-medium text-gray-500">Income Tier</p>
              {incomeVerification ? (
                <>
                  <div className="mt-2">
                    <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${iTier!.bg} ${iTier!.text}`}>
                      {incomeVerification.estimatedIncomeLabel}
                    </span>
                  </div>
                  {passport.isPublic && (
                    <p className="mt-2 text-xs text-gray-400">
                      Est. ${Number(incomeVerification.monthlyAvgIncome).toLocaleString()}/mo
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-gray-400">N/A</p>
              )}
            </div>

            {/* Career Tenure */}
            <div className="bg-white p-6 text-center">
              <p className="text-sm font-medium text-gray-500">Career Tenure</p>
              {incomeVerification ? (
                <>
                  <p className="mt-2 text-2xl font-bold text-ink-black">
                    {formatTenure(incomeVerification.tenureMonths)}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">Gig work history</p>
                </>
              ) : (
                <p className="mt-4 text-sm text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Wallet</p>
              <p className="mt-1 font-mono text-sm text-ink-black">
                {passport.walletAddress
                  ? `${passport.walletAddress.slice(0, 6)}...${passport.walletAddress.slice(-4)}`
                  : 'Not connected'}
              </p>
            </div>
            {passport.tokenId && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                Token #{passport.tokenId}
              </span>
            )}
          </div>
        </div>

        {/* Attestation History */}
        {attestations.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-ink-black">
                Attestation History
                <span className="ml-2 text-gray-400">({passport.attestationCount} total)</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {attestations.map((att, i) => {
                const dotStyle = scoreTierStyle(att.scoreTier)
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block h-2 w-2 rounded-full ${dotStyle.bar}`} />
                      <div>
                        <p className="text-sm font-medium text-ink-black">
                          {passport.isPublic ? `Score ${att.score}` : `Tier ${att.scoreTier}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {timeAgo(new Date(att.attestedAt))}
                        </p>
                      </div>
                    </div>
                    {att.txHash && (
                      <a
                        href={`https://sepolia.basescan.org/tx/${att.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View tx →
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Passport verified by Krost · Income attestations on {passport.chain === 'base' ? 'Base L2' : passport.chain}
        </p>
      </div>
    </main>
  )
}
