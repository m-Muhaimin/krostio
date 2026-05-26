import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

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

function formatMonths(months: number): string {
  if (months >= 24) {
    const yrs = Math.round(months / 12)
    return `${yrs} ${yrs === 1 ? 'year' : 'years'}`
  }
  return `${months} months`
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ show_exact?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const { data: report } = await admin
    .from('krost_scores')
    .select('tier, score')
    .eq('id', token)
    .maybeSingle()

  const tierLabel = report?.tier
    ? (SCORE_TIER_META[report.tier]?.label ?? 'Verified')
    : 'Verified'

  return {
    title: `Krostio — ${tierLabel} Worker Income Report`,
    description: `Verified gig worker income profile. Score tier: ${tierLabel}. Income data sourced from connected financial accounts via Plaid.`,
    openGraph: {
      title: `Krostio — ${tierLabel} Worker Income Report`,
      description: 'Verified gig worker income profile with professional reports.',
    },
  }
}

export default async function IncomeReportPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const { show_exact } = await searchParams
  const showExact = show_exact === 'true'

  const { data: report } = await admin
    .from('krost_scores')
    .select('*')
    .eq('id', token)
    .maybeSingle()

  if (!report) {
    notFound()
  }

  const score = report.score ?? 0
  const scoreTier = report.tier ?? 'emerging'
  const tierMeta = SCORE_TIER_META[scoreTier] ?? SCORE_TIER_META.emerging

  const breakdown = report.breakdown as Record<string, number> | null
  const monthlyAvg = breakdown?.monthly_avg_income ?? 0
  const tenureMonths = breakdown?.tenure_months ?? 12
  const platformCount = breakdown?.platform_diversity ?? 1

  const incomeTier = deriveIncomeTier(monthlyAvg)
  const incomeMeta = INCOME_TIER_META[incomeTier] ?? INCOME_TIER_META.moderate

  const displayScore = showExact ? score : null
  const displayMonthly = showExact ? monthlyAvg : null

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#212121] font-sans">
      <header className="border-b border-[#f2f2f2]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-[#17171c]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Krostio
            </span>
          </Link>
          <span className="text-sm text-[#75758a]">Income Verification Report</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <div className="rounded-2xl border border-[#f2f2f2] bg-[#ffffff] p-8 sm:p-12 shadow-sm">
          <div className="mb-8 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#edfce9]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003c33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="text-sm font-medium text-[#003c33]">
              Verified Income Data
            </span>
            <span className="ml-auto text-xs text-[#75758a]">Plaid</span>
          </div>

          <div className="mb-8 text-center">
            <div className={`mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 ${tierMeta.bgClass}`}>
              <span className={`text-sm font-semibold uppercase tracking-wider ${tierMeta.textColor}`}>
                {tierMeta.label}
              </span>
              {displayScore !== null && (
                <span className={`text-2xl font-bold ${tierMeta.textColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {displayScore}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-[#17171c]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Gig Worker Income Profile
            </h1>
            {!displayScore && (
              <p className="mt-2 text-sm text-[#75758a]">
                Score tier is shown. Add ?show_exact=true to reveal exact score when authorized.
              </p>
            )}
          </div>

          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#f2f2f2] bg-[#ffffff] p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[#75758a]">Score</div>
              <div className={`mt-1 text-lg font-bold ${tierMeta.textColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {tierMeta.label}
              </div>
            </div>
            <div className="rounded-xl border border-[#f2f2f2] bg-[#ffffff] p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[#75758a]">Income</div>
              <div className="mt-1 text-sm font-semibold text-[#17171c]">{incomeMeta.label}</div>
              {displayMonthly !== null && (
                <div className="mt-0.5 text-xs text-[#75758a]">~${Math.round(displayMonthly / 500) * 500}/mo</div>
              )}
            </div>
            <div className="rounded-xl border border-[#f2f2f2] bg-[#ffffff] p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[#75758a]">Tenure</div>
              <div className="mt-1 text-lg font-bold text-[#17171c]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {formatMonths(tenureMonths)}
              </div>
            </div>
            <div className="rounded-xl border border-[#f2f2f2] bg-[#ffffff] p-4 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[#75758a]">Platforms</div>
              <div className="mt-1 text-lg font-bold text-[#17171c]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {platformCount}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#f2f2f2] bg-[#fafafa] p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#75758a]">Verification Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#75758a]">Verification Source</span>
                <span className="text-[#17171c]">Plaid — financial accounts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75758a]">Income Tier</span>
                <span className="text-[#17171c]">{incomeMeta.label} — {incomeMeta.desc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75758a]">Calculated</span>
                <span className="text-[#17171c]">
                  {new Date(report.calculated_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#75758a]">
            This report confirms a worker&apos;s income consistency tier as computed from verified gig platform earnings.
            Exact financial details are only shown with explicit worker authorization.
          </p>
        </div>
      </main>

      <footer className="border-t border-[#f2f2f2]">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-[#93939f]">
          <p>Krostio — Income verification for the gig economy</p>
          <p className="mt-1">
            <Link href="/" className="text-[#1863dc] hover:underline">krostio.com</Link>
            {' · '}
            <Link href="/privacy" className="text-[#1863dc] hover:underline">Privacy</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
