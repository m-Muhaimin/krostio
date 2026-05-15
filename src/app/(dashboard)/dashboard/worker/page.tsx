import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function WorkerDashboard() {
  await requireRole(['gig_worker'])
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real data
  const [{ count: connections }, { data: verification }] = await Promise.all([
    supabase.from('platform_connections').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('income_verifications').select('*').eq('user_id', user!.id).single(),
  ])

  const { data: reportCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const hasScore = !!verification
  const score = verification?.consistency_score ?? null
  const annualizedIncome = verification?.annualized_income ?? null
  const monthlyAvg = verification?.monthly_avg_income ?? null
  const platformCount = verification?.platform_diversity ?? 0
  const trajectory = verification?.trajectory_label ?? null
  const status = verification?.lender_ready_status ?? null

  return (
    <div className="space-y-14">
      {/* Header */}
      <div>
        <p className="text-mono-label text-slate">Worker dashboard</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Income overview.
        </h1>
        <p className="mt-3 text-body text-slate">
          Connect your gig platforms to verify your income and generate lender-ready reports.
        </p>
      </div>

      {/* Score overview */}
      <section
        className="rounded-md p-10"
        style={{ backgroundColor: 'var(--color-deep-green)', color: '#fff' }}
      >
        <div className="grid gap-12 md:grid-cols-[2fr_1fr] md:items-end">
          <div>
            <p className="text-mono-label text-white/50">Income consistency score</p>
            <div className="mt-6 flex items-end gap-6">
              <span className="font-display text-[96px] leading-none tracking-tight text-white">
                {score !== null ? score : '—'}
              </span>
              <div className="mb-3">
                <p className="text-sm text-white/65">
                  {hasScore ? `Out of 100 — ${status === 'green' ? 'Lender-ready' : status === 'yellow' ? 'Needs improvement' : 'Insufficient data'}` : 'Connect platforms to calculate'}
                </p>
                <p className="text-xs text-white/40">
                  {hasScore
                    ? `Annualized: $${annualizedIncome?.toLocaleString() ?? '?'} · Avg/mo: $${monthlyAvg?.toLocaleString() ?? '?'}`
                    : 'Income consistency score (0–100) — not a credit score'}
                </p>
              </div>
            </div>
            <div className="mt-8 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-coral transition-all"
                style={{ width: score !== null ? `${Math.max(4, score)}%` : '4%' }}
              />
            </div>
          </div>

          <div className="space-y-4 border-l border-white/10 pl-8">
            <div>
              <p className="text-mono-label text-white/40">Connected platforms</p>
              <p className="mt-2 text-3xl font-normal text-white">
                {Math.max(platformCount, connections ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-mono-label text-white/40">Trajectory</p>
              <p className="mt-2 text-sm text-white/65">
                {trajectory
                  ? trajectory.charAt(0).toUpperCase() + trajectory.slice(1)
                  : 'Not yet calculated'}
              </p>
            </div>
            <div>
              <p className="text-mono-label text-white/40">Reports generated</p>
              <p className="mt-2 text-sm text-white/65">{reportCount ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/worker/connections"
          className="card-stone flex items-center justify-between p-6 transition hover:border-ink-black"
        >
          <div>
            <p className="font-display text-xl text-ink-black">Connect platforms</p>
            <p className="mt-1 text-sm text-slate">Link your gig accounts via Plaid</p>
          </div>
          <span className="text-2xl text-slate">→</span>
        </Link>
        <Link
          href="/dashboard/worker/score"
          className="card-stone flex items-center justify-between p-6 transition hover:border-ink-black"
        >
          <div>
            <p className="font-display text-xl text-ink-black">View score breakdown</p>
            <p className="mt-1 text-sm text-slate">See factors, trajectory, platform details</p>
          </div>
          <span className="text-2xl text-slate">→</span>
        </Link>
      </section>

      {/* Platform buttons — now links to connections page */}
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-heading-feature text-ink-black">Quick connect</h2>
          <Link href="/dashboard/worker/connections" className="link-editorial text-sm">
            View all connections →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {['Uber', 'Lyft', 'DoorDash', 'Fiverr', 'Upwork', 'Instacart'].map((name) => (
            <Link
              key={name}
              href="/dashboard/worker/connections"
              className="card-bordered flex items-center gap-4 p-5 text-left transition hover:border-ink-black"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-ink-black text-sm font-medium text-white">
                {name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-black">{name}</p>
                <p className="text-xs text-slate">Connect via Plaid →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Generate report CTA */}
      {hasScore && (
        <section>
          <div className="card-stone p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-display text-2xl text-ink-black">Generate income report</p>
                <p className="mt-2 text-sm text-slate">
                  Create a lender-ready PDF with your income summary, consistency score, and platform profile.
                  {!reportCount ? ' Your first report is free.' : ''}
                </p>
              </div>
              <GenerateReportButton hasReports={!!reportCount} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// Client component for report generation with loading state
import { GenerateReportButton } from './generate-report-button'
