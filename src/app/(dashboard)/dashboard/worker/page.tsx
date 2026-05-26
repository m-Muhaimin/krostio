import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import Link from 'next/link'

type RecentReport = {
  id: string
  created_at: string
  expires_at: string
  viewer_count: number | null
}

function freshnessLabel(lastSyncAt: string | null): { label: string; tone: 'fresh' | 'stale' | 'old' | 'none' } {
  if (!lastSyncAt) return { label: 'Never synced', tone: 'none' }
  const last = new Date(lastSyncAt).getTime()
  const hours = (Date.now() - last) / (1000 * 60 * 60)
  if (hours < 24) return { label: 'Fresh', tone: 'fresh' }
  if (hours < 24 * 7) return { label: 'Recent', tone: 'fresh' }
  if (hours < 24 * 30) return { label: 'Stale', tone: 'stale' }
  return { label: 'Outdated', tone: 'old' }
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function WorkerDashboard() {
  await requireRole(['gig_worker'])
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real data — existing + Krost Score v2
  const [{ data: platformRows }, { data: verification }, { data: krostRecord }] = await Promise.all([
    supabase
      .from('platform_connections')
      .select('id, last_sync_at, is_active')
      .eq('user_id', user!.id)
      .eq('is_active', true),
    supabase.from('income_verifications').select('*').eq('user_id', user!.id).maybeSingle(),
    supabase.from('krost_scores').select('score, tier, breakdown, factors').eq('user_id', user!.id).maybeSingle(),
  ])

  const connections = platformRows?.length ?? 0
  const latestSync = (platformRows ?? [])
    .map((p) => p.last_sync_at)
    .filter(Boolean)
    .sort()
    .pop() as string | null

  const { count: reportCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  // Recent reports — use service client so we get the latest list bypassing RLS edge cases
  let recentReports: RecentReport[] = []
  try {
    const service = createServiceSupabaseClient()
    const { data } = await service
      .from('reports')
      .select('id, created_at, expires_at, viewer_count')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5)
    recentReports = data ?? []
  } catch {
    // Service client not configured in this environment — fall back silently.
    recentReports = []
  }

  const hasScore = !!verification
  const score = verification?.consistency_score ?? null
  const annualizedIncome = verification?.annualized_income ?? null
  const monthlyAvg = verification?.monthly_avg_income ?? null
  const platformCount = verification?.platform_diversity ?? 0
  const trajectory = verification?.trajectory_label ?? null
  const status = verification?.lender_ready_status ?? null

  // Krost Score (300–850) — Pillar 1
  const hasKrost = !!krostRecord
  const krostScore = krostRecord?.score ?? null
  const krostTier = krostRecord?.tier ?? null
  const krostBreakdown = krostRecord?.breakdown ?? null

  const krostTierColor =
    krostTier === 'elite'
      ? { bg: '#0A4D3B', text: '#fff' }    // deep green for elite
      : krostTier === 'strong'
        ? { bg: 'var(--color-deep-green)', text: '#fff' }
        : krostTier === 'building'
          ? { bg: '#B8860B', text: '#fff' }  // amber for building
          : { bg: 'var(--color-slate-gray)', text: '#fff' }

  const krostTierLabel =
    krostTier === 'elite' ? 'Elite' 
    : krostTier === 'strong' ? 'Strong'
    : krostTier === 'building' ? 'Building'
    : krostTier === 'emerging' ? 'Emerging'
    : null

  const krostTierMeaning =
    krostTier === 'elite' ? 'Prime borrower — auto-approve most alt-doc loans'
    : krostTier === 'strong' ? 'Non-QM eligible — suitable for personal, auto, business loans'
    : krostTier === 'building' ? 'Partial income history — secured / smaller loans'
    : krostTier === 'emerging' ? 'Early stage — microloans, credit-builder products'
    : null

  const connectedCount = Math.max(platformCount, connections)
  const freshness = freshnessLabel(latestSync)
  const dotColor =
    freshness.tone === 'fresh'
      ? 'bg-emerald-400'
      : freshness.tone === 'stale'
        ? 'bg-amber-400'
        : freshness.tone === 'old'
          ? 'bg-coral'
          : 'bg-white/30'

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
              <p className="mt-2 text-3xl font-normal text-white">{connectedCount}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden />
                <span className="text-xs text-white/65">{freshness.label}</span>
              </div>
              <p className="mt-1 text-xs text-white/40">
                Last sync: {latestSync ? formatRelative(latestSync) : '—'}
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

      {/* Krost Score (300–850) — Pillar 1 */}
      <section
        className="rounded-md p-10"
        style={{ backgroundColor: krostTierColor.bg, color: '#fff' }}
      >
        <div className="grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <p className="text-mono-label text-white/50">
              Krost Score
              <span className="ml-2 text-xs opacity-40">Income verification metric</span>
            </p>
            <div className="mt-6 flex items-end gap-6">
              <span className="font-display text-[96px] leading-none tracking-tight text-white">
                {hasKrost ? krostScore : '—'}
              </span>
              <div className="mb-3">
                {hasKrost ? (
                  <>
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold tracking-wide">
                      {krostTierLabel}
                    </span>
                    <p className="mt-2 text-sm text-white/65">{krostTierMeaning}</p>
                  </>
                ) : (
                  <p className="text-sm text-white/65">
                    Connect platforms to generate your Krost Score
                  </p>
                )}
              </div>
            </div>
            {hasKrost && krostBreakdown && (
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/55">
                {krostBreakdown.incomeScore > 0 && (
                  <span>Income: +{krostBreakdown.incomeScore}</span>
                )}
                {krostBreakdown.tenureScore > 0 && (
                  <span>Tenure: +{krostBreakdown.tenureScore}</span>
                )}
                {krostBreakdown.diversityScore > 0 && (
                  <span>Diversity: +{krostBreakdown.diversityScore}</span>
                )}
                {krostBreakdown.consistencyScore > 0 && (
                  <span>Consistency: +{krostBreakdown.consistencyScore}</span>
                )}
                {krostBreakdown.trajectoryScore > 0 && (
                  <span>Trajectory: +{krostBreakdown.trajectoryScore}</span>
                )}
              </div>
            )}
          </div>
          <div className="space-y-4 border-l border-white/10 pl-8">
            <div>
              <p className="text-mono-label text-white/40">Score range</p>
              <p className="mt-2 text-2xl font-normal text-white">0 – 100</p>
            </div>
            <div>
              <p className="text-mono-label text-white/40">Tiers</p>
              <div className="mt-2 space-y-1 text-xs text-white/55">
                <p>750–850 Elite · 680–749 Strong</p>
                <p>580–679 Building · 300–579 Emerging</p>
              </div>
            </div>
            <div>
              <Link
                href="/dashboard/worker/score"
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/25"
              >
                Factor breakdown →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Score improvement recommendations */}
      {hasKrost && krostBreakdown && (
        <section>
          <h2 className="mb-6 text-heading-feature text-ink-black">Improve your score</h2>
          <div className="space-y-3">
            {(() => {
              const tips: { icon: string; title: string; desc: string; action: string; href: string }[] = []

              const b = krostBreakdown as Record<string, any>
              const incomeScore = b.incomeScore ?? 0
              const diversityScore = b.diversityScore ?? 0
              const tenureScore = b.tenureScore ?? 0
              const volatilityScore = b.volatilityScore ?? 0
              const consistencyScore = b.consistencyScore ?? 0
              const trajectoryScore = b.trajectoryScore ?? 0

              if (diversityScore < 25) {
                tips.push({
                  icon: '⊕',
                  title: 'Add another platform',
                  desc: `Platform diversity contributes up to +50 pts. You have ${Math.round(diversityScore / 12.5) || 1} platform${Math.round(diversityScore / 12.5) || 1 !== 1 ? 's' : ''} contributing.`,
                  action: 'Connect platform →',
                  href: '/dashboard/worker/connections',
                })
              }
              if (incomeScore < 40) {
                tips.push({
                  icon: '↑',
                  title: 'Increase monthly earnings',
                  desc: 'Higher average monthly income relative to $5K/mo benchmark adds up to +80 pts. More trips or higher-value work improve this factor.',
                  action: 'View ledger →',
                  href: '/dashboard/worker/ledger',
                })
              }
              if (tenureScore < 40) {
                tips.push({
                  icon: '⏱',
                  title: 'Build career tenure',
                  desc: 'Score rewards months of consistent gig activity (up to +70 pts). Time on platform is the only factor that increases naturally.',
                  action: 'See score breakdown →',
                  href: '/dashboard/worker/score',
                })
              }
              if (volatilityScore < 30) {
                tips.push({
                  icon: '📊',
                  title: 'Reduce income volatility',
                  desc: 'Steady earnings improve your volatility score (up to +60 pts). Consider diversifying into more consistent platforms.',
                  action: 'View ledger →',
                  href: '/dashboard/worker/ledger',
                })
              }
              if (consistencyScore < 25) {
                tips.push({
                  icon: '◉',
                  title: 'Improve earning consistency',
                  desc: 'Positive earnings in more months boosts consistency (up to +50 pts). Aim for earnings every month across your connected platforms.',
                  action: 'View ledger →',
                  href: '/dashboard/worker/ledger',
                })
              }
              if (trajectoryScore < 15) {
                tips.push({
                  icon: '↗',
                  title: 'Grow your income trajectory',
                  desc: 'An upward trend adds up to +40 pts. Focus on increasing earnings month-over-month to demonstrate growth.',
                  action: 'View ledger →',
                  href: '/dashboard/worker/ledger',
                })
              }

              return tips.slice(0, 3).map((tip) => (
                <Link
                  key={tip.title}
                  href={tip.href}
                  className="card-bordered flex items-start gap-4 px-6 py-5 transition hover:border-ink-black"
                >
                  <span className="mt-0.5 text-xl">{tip.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-black">{tip.title}</p>
                    <p className="mt-1 text-xs text-slate leading-relaxed">{tip.desc}</p>
                  </div>
                  <span className="mt-1 shrink-0 text-sm text-slate">{tip.action}</span>
                </Link>
              ))
            })()}
          </div>
          <Link
            href="/dashboard/worker/score"
            className="mt-4 link-editorial text-sm inline-flex"
          >
            Full factor breakdown →
          </Link>
        </section>
      )}
      {/* Current score improvement tips when no krost score yet */}
      {!hasKrost && (
        <section>
          <h2 className="mb-6 text-heading-feature text-ink-black">Build your score</h2>
          <div className="space-y-3">
            {[
              {
                icon: '⊞',
                title: 'Connect your first platform',
                desc: 'Link a gig platform via Plaid to start building your income history. Earnings from every trip and delivery count toward your score.',
                action: 'Connect →',
                href: '/dashboard/worker/connections',
              },
              {
                icon: '📋',
                title: 'Generate a report',
                desc: 'Once connected, generate a Consistency Score and create a professional PDF report in minutes.',
                action: 'Learn more →',
                href: '/dashboard/worker/score',
              },
              {
                icon: '📎',
                title: 'Download your report',
                desc: 'Generate and download a professional income statement. Share via expiring link or send directly to a lender.',
                action: 'Generate →',
                href: '/dashboard/worker/reports',
              },
            ].map((tip) => (
              <Link
                key={tip.title}
                href={tip.href}
                className="card-bordered flex items-start gap-4 px-6 py-5 transition hover:border-ink-black"
              >
                <span className="mt-0.5 text-xl">{tip.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-black">{tip.title}</p>
                  <p className="mt-1 text-xs text-slate leading-relaxed">{tip.desc}</p>
                </div>
                <span className="mt-1 shrink-0 text-sm text-slate">{tip.action}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
          href="/dashboard/worker/ledger"
          className="card-stone flex items-center justify-between p-6 transition hover:border-ink-black"
        >
          <div>
            <p className="font-display text-xl text-ink-black">Earnings ledger</p>
            <p className="mt-1 text-sm text-slate">Unified timeline of all platform earnings</p>
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

      {/* Recent reports */}
      {recentReports.length > 0 && (
        <section>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-heading-feature text-ink-black">Recent reports</h2>
            <p className="text-mono-label text-slate">{recentReports.length} of {reportCount ?? recentReports.length}</p>
          </div>
          <div className="space-y-3">
            {recentReports.map((report) => {
              const expiresAt = new Date(report.expires_at).getTime()
              const now = new Date().getTime()
              const expired = expiresAt < now
              return (
                <div
                  key={report.id}
                  className="card-bordered flex items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-black">
                      Report · {formatDate(report.created_at)}
                    </p>
                    <p className="mt-1 text-xs text-slate">
                      {expired
                        ? 'Link expired'
                        : `Expires ${formatDate(report.expires_at)}`}
                      {' · '}
                      {report.viewer_count ?? 0} view{(report.viewer_count ?? 0) === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-mono-label ${
                        expired ? 'text-slate' : 'text-ink-black'
                      }`}
                    >
                      {expired ? 'Expired' : 'Active'}
                    </span>
                    {expired ? (
                      <span className="text-sm text-slate">—</span>
                    ) : (
                      <a
                        href={`/api/report/share/${report.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link-editorial text-sm"
                      >
                        Download →
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

// Client component for report generation with loading state
import { GenerateReportButton } from './generate-report-button'
