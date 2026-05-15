import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import LenderFilters from './LenderFilters'

export const metadata: Metadata = {
  title: 'Lender directory — find loans accepting gig income',
  description:
    'Browse lenders who accept Krost income verification. Personal loans, auto financing, mortgages, and business credit for gig workers, freelancers, and 1099 earners.',
}

export const dynamic = 'force-dynamic'

const LOAN_TYPE_LABEL: Record<string, string> = {
  auto: 'Auto',
  personal: 'Personal',
  mortgage: 'Mortgage',
  business: 'Business',
  cash_advance: 'Cash advance',
}

type LenderRow = {
  id: string
  company_name: string
  slug: string
  logo_url: string | null
  tagline: string | null
  loan_types: string[]
  min_consistency_score: number | null
  min_fico: number | null
  typical_apr_min: number | null
  typical_apr_max: number | null
  min_loan_amount: number | null
  max_loan_amount: number | null
  featured: boolean
}

function formatApr(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${min}–${max}% APR`
  return `${min ?? max}% APR`
}

function formatLoanRange(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null
  const f = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  if (min != null && max != null) return `${f(min)}–${f(max)}`
  return f((min ?? max)!)
}

export default async function LendersDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ types?: string; state?: string; min_amount?: string }>
}) {
  const sp = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('lender_profiles')
    .select(
      'id, company_name, slug, logo_url, tagline, loan_types, min_consistency_score, min_fico, typical_apr_min, typical_apr_max, min_loan_amount, max_loan_amount, featured',
    )
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  const typesFilter = (sp.types ?? '').split(',').filter(Boolean)
  if (typesFilter.length > 0) {
    query = query.overlaps('loan_types', typesFilter)
  }

  const stateFilter = sp.state?.trim().toUpperCase()
  // states_served = empty array means "all states" — match either empty or contains state
  // Supabase doesn't easily express OR(empty, contains) in one filter, so we fetch then filter.

  const minAmount = sp.min_amount ? parseInt(sp.min_amount, 10) : null

  const { data, error } = await query
  let lenders: LenderRow[] = (data as LenderRow[] | null) ?? []

  if (!error && stateFilter) {
    // Filter client-side: include lenders whose states_served is empty (all 50) OR contains the state
    const { data: stateData } = await supabase
      .from('lender_profiles')
      .select('id, states_served')
      .eq('active', true)
    const allowedIds = new Set(
      (stateData ?? [])
        .filter(
          (r: { id: string; states_served: string[] | null }) =>
            !r.states_served || r.states_served.length === 0 || r.states_served.includes(stateFilter),
        )
        .map((r: { id: string }) => r.id),
    )
    lenders = lenders.filter((l) => allowedIds.has(l.id))
  }

  if (minAmount && Number.isFinite(minAmount)) {
    lenders = lenders.filter((l) => (l.max_loan_amount ?? Infinity) >= minAmount)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Hero */}
      <div className="max-w-3xl">
        <p className="text-mono-label text-slate eyebrow-dot">Lender directory</p>
        <h1 className="mt-4 font-display text-[56px] leading-[1.05] tracking-tight text-ink-black">
          Lenders who accept Krost income verification.
        </h1>
        <p className="mt-5 text-body text-slate">
          Get matched in minutes — no waiting on pay stubs. Browse lenders by loan type, state,
          and credit requirements. Apply with a single Krost-verified income report.
        </p>
      </div>

      {/* Two-column: filters + cards */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[260px_1fr]">
        <LenderFilters />

        <div>
          {lenders.length === 0 ? (
            <div className="card-bordered px-8 py-16 text-center">
              <p className="text-mono-label text-slate">No matches</p>
              <p className="mt-3 text-sm text-ink">No lenders match your filters.</p>
              <Link href="/lenders" className="link-editorial mt-4 inline-block text-sm">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {lenders.map((l) => {
                const apr = formatApr(l.typical_apr_min, l.typical_apr_max)
                const range = formatLoanRange(l.min_loan_amount, l.max_loan_amount)
                return (
                  <Link
                    key={l.id}
                    href={`/lenders/${l.slug}`}
                    className={`card-bordered flex flex-col gap-4 p-6 transition-shadow hover:shadow-md ${
                      l.featured ? 'border-2 border-[var(--color-coral)]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-soft-stone">
                        {l.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.logo_url}
                            alt={l.company_name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="font-display text-xl text-ink-black">
                            {l.company_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {l.featured && (
                        <span className="chip-coral text-xs uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-xl tracking-tight text-ink-black">
                        {l.company_name}
                      </h3>
                      {l.tagline && (
                        <p className="mt-1 text-sm text-slate">{l.tagline}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {l.loan_types.map((t) => (
                        <span
                          key={t}
                          className="chip-coral-outline text-xs"
                        >
                          {LOAN_TYPE_LABEL[t] ?? t}
                        </span>
                      ))}
                    </div>

                    <dl className="space-y-1 text-xs text-slate">
                      {l.min_fico != null && (
                        <div className="flex justify-between">
                          <dt>Minimum FICO</dt>
                          <dd className="text-ink-black">{l.min_fico}+</dd>
                        </div>
                      )}
                      {l.min_consistency_score != null && (
                        <div className="flex justify-between">
                          <dt>Min Krost score</dt>
                          <dd className="text-ink-black">{l.min_consistency_score}+</dd>
                        </div>
                      )}
                      {apr && (
                        <div className="flex justify-between">
                          <dt>Typical APR</dt>
                          <dd className="text-ink-black">{apr}</dd>
                        </div>
                      )}
                      {range && (
                        <div className="flex justify-between">
                          <dt>Loan amount</dt>
                          <dd className="text-ink-black">{range}</dd>
                        </div>
                      )}
                    </dl>

                    <p className="link-editorial mt-auto pt-2 text-sm">View details →</p>
                  </Link>
                )
              })}
            </div>
          )}

          <p className="mt-12 max-w-2xl text-xs text-slate">
            Lender listings are paid placements. Krost may earn a referral fee when you connect
            with a lender through this directory. We do not share your personal information
            without your explicit consent at the time of application.
          </p>
        </div>
      </div>
    </div>
  )
}
