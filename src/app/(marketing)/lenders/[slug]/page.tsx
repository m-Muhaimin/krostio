import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import ApplyButton from './ApplyButton'

const LOAN_TYPE_LABEL: Record<string, string> = {
  auto: 'Auto',
  personal: 'Personal',
  mortgage: 'Mortgage',
  business: 'Business',
  cash_advance: 'Cash advance',
}

type LenderDetail = {
  id: string
  company_name: string
  slug: string
  logo_url: string | null
  tagline: string | null
  description: string | null
  website_url: string | null
  loan_types: string[]
  min_consistency_score: number | null
  min_fico: number | null
  states_served: string[] | null
  min_loan_amount: number | null
  max_loan_amount: number | null
  typical_apr_min: number | null
  typical_apr_max: number | null
  featured: boolean
}

export async function generateStaticParams() {
  const supabase = createServiceSupabaseClient()
  const { data } = await supabase
    .from('lender_profiles')
    .select('slug')
    .eq('active', true)
  return (data ?? []).map((l: { slug: string }) => ({ slug: l.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceSupabaseClient()
  const { data } = await supabase
    .from('lender_profiles')
    .select('company_name, tagline')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()
  if (!data) return { title: 'Lender not found' }
  return {
    title: `${data.company_name} — Loans for gig workers`,
    description: data.tagline ?? `Apply for financing with ${data.company_name} using a Krostio income verification report.`,
  }
}

export default async function LenderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase
    .from('lender_profiles')
    .select(
      'id, company_name, slug, logo_url, tagline, description, website_url, loan_types, min_consistency_score, min_fico, states_served, min_loan_amount, max_loan_amount, typical_apr_min, typical_apr_max, featured',
    )
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (error || !data) notFound()
  const l = data as LenderDetail

  const fmtAmount = (n: number | null) =>
    n == null ? null : n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  const amountRange =
    l.min_loan_amount != null && l.max_loan_amount != null
      ? `${fmtAmount(l.min_loan_amount)} – ${fmtAmount(l.max_loan_amount)}`
      : null
  const aprRange =
    l.typical_apr_min != null && l.typical_apr_max != null
      ? `${l.typical_apr_min}% – ${l.typical_apr_max}%`
      : null
  const states =
    !l.states_served || l.states_served.length === 0
      ? 'All 50 states'
      : l.states_served.join(', ')

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <Link href="/lenders" className="link-editorial text-sm">
          ← Back to directory
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-soft-stone">
          {l.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={l.logo_url} alt={l.company_name} className="h-full w-full object-contain" />
          ) : (
            <span className="font-display text-3xl text-ink-black">{l.company_name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {l.featured && (
            <span className="chip-coral text-xs uppercase tracking-wider">Featured partner</span>
          )}
          <h1 className="mt-2 font-display text-[44px] leading-tight tracking-tight text-ink-black">
            {l.company_name}
          </h1>
          {l.tagline && <p className="mt-2 text-body-lg text-slate">{l.tagline}</p>}
        </div>
      </div>

      {/* Two-column */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Description */}
        <article className="prose prose-sm max-w-none text-ink">
          {l.description ? (
            <ReactMarkdown>{l.description}</ReactMarkdown>
          ) : (
            <p className="text-slate">No description provided.</p>
          )}

          {l.website_url && (
            <p className="mt-8 text-sm">
              <a
                href={l.website_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="link-editorial"
              >
                Visit {l.company_name} website →
              </a>
            </p>
          )}

          <p className="mt-10 text-xs text-slate">
            This is a paid placement. Krostio may earn a referral fee if you connect with this
            lender. Listings on the Krostio directory are not endorsements; review each lender&apos;s
            terms and licensing before applying.
          </p>
        </article>

        {/* Sticky pre-qualify card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-stone space-y-6">
            <div>
              <p className="text-mono-label text-slate">Loan types</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {l.loan_types.map((t) => (
                  <span key={t} className="chip-coral-outline text-xs">
                    {LOAN_TYPE_LABEL[t] ?? t}
                  </span>
                ))}
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              {l.min_consistency_score != null && (
                <div className="flex justify-between">
                  <dt className="text-slate">Min Krostio score</dt>
                  <dd className="text-ink-black">{l.min_consistency_score}+</dd>
                </div>
              )}
              {l.min_fico != null && (
                <div className="flex justify-between">
                  <dt className="text-slate">Min FICO</dt>
                  <dd className="text-ink-black">{l.min_fico}+</dd>
                </div>
              )}
              {aprRange && (
                <div className="flex justify-between">
                  <dt className="text-slate">Typical APR</dt>
                  <dd className="text-ink-black">{aprRange}</dd>
                </div>
              )}
              {amountRange && (
                <div className="flex justify-between">
                  <dt className="text-slate">Loan amount</dt>
                  <dd className="text-ink-black">{amountRange}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-slate">Available in</dt>
                <dd className="text-right text-ink-black">{states}</dd>
              </div>
            </dl>

            <ApplyButton lenderId={l.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
