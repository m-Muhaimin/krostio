import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { GenerateReportButton } from '../generate-report-button'

export const dynamic = 'force-dynamic'

function fmtCurrency(n: number) {
  return '$' + Math.round(n).toLocaleString()
}

function fmtDate(iso: string) {
  try { return format(parseISO(iso), 'MMM d, yyyy') } catch { return iso }
}

function platformLabel(p: string) {
  return p.charAt(0).toUpperCase() + p.slice(1).replace(/_/g, ' ')
}

function categoryLabel(c: string | null) {
  if (!c) return 'Gig income'
  return c.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export default async function ReportPage() {
  const { userId } = await requireRole(['gig_worker'])
  const supabase = createServerSupabaseClient()

  const [scoreRes, entriesRes, connsRes, reportsRes] = await Promise.all([
    supabase.from('income_verifications').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('ledger_entries').select('id, platform, gross_amount, net_amount, currency, period_start, payment_date, description, category, source').eq('user_id', userId).order('period_start', { ascending: false }).limit(10),
    supabase.from('platform_connections').select('platform, is_active, last_sync_at').eq('user_id', userId).eq('provider', 'plaid'),
    supabase.from('reports').select('id').eq('user_id', userId).limit(1),
  ])

  const score = scoreRes.data
  const entries = entriesRes.data || []
  const connections = connsRes.data || []
  const hasReports = (reportsRes.data?.length ?? 0) > 0

  const totalGross = entries.reduce((s, e) => s + Number(e.gross_amount), 0)
  const platformMap = new Map<string, { gross: number; count: number }>()
  for (const e of entries) {
    const p = platformMap.get(e.platform) || { gross: 0, count: 0 }
    p.gross += Number(e.gross_amount)
    p.count += 1
    platformMap.set(e.platform, p)
  }

  return (
    <div>
      {/* Score Hero */}
      <div className="report-hero fade-up d0">
        <div className="report-hero-left">
          <p className="report-hero-eyebrow">Krostio Income Verification Report</p>
          <div className="report-hero-score-wrap">
            <span className="report-hero-score-num">{score?.consistency_score ?? '—'}</span>
            <span className="report-hero-score-label">/ 100 consistency</span>
          </div>
          <div className={`report-hero-tier ${score?.lender_ready_status || 'red'}`}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
            {score?.lender_ready_status === 'green' ? 'Lender-Ready' : score?.lender_ready_status === 'yellow' ? 'Building Profile' : 'Getting Started'}
          </div>
        </div>
        <div className="report-hero-stats">
          <div className="report-hero-stat">
            <div className="report-hero-stat-val">{score ? fmtCurrency(score.annualized_income) : '—'}</div>
            <div className="report-hero-stat-label">Annualized Income</div>
          </div>
          <div className="report-hero-stat">
            <div className="report-hero-stat-val">{score?.platform_diversity ?? 0}</div>
            <div className="report-hero-stat-label">Platforms Connected</div>
          </div>
          <div className="report-hero-stat">
            <div className="report-hero-stat-val">{score?.tenure_months ?? 0}<span style={{ fontSize: 14 }}>m</span></div>
            <div className="report-hero-stat-label">Track Record</div>
          </div>
        </div>
      </div>

      {!entries.length && (
        <div className="card text-center fade-up d1" style={{ padding: 48 }}>
          <div className="hero-icon-wrap" style={{ margin: '0 auto 18px' }}>
            <div className="hero-icon hi-coral" style={{ width: 64, height: 64, borderRadius: 16 }}>
              <span className="text-2xl text-white">K</span>
            </div>
          </div>
          <h2 className="page-header-title" style={{ fontSize: 28 }}>No report data yet.</h2>
          <p className="page-header-desc" style={{ margin: '12px auto 0', maxWidth: 420 }}>
            Connect a gig platform via Plaid to generate your income verification report.
          </p>
          <Link href="/dashboard/worker/connections" className="btn-ink" style={{ marginTop: 24 }}>Connect a platform →</Link>
        </div>
      )}

      {entries.length > 0 && (
        <>
          {/* Financial Behavior */}
          <div className="fade-up d1" style={{ marginBottom: 32 }}>
            <div className="page-header-eyebrow" style={{ marginBottom: 8 }}>
              <span className="page-header-eyebrow-dot" />
              <span className="page-header-eyebrow-label">Financial Behavior</span>
            </div>
            <h2 className="text-heading-feature" style={{ marginBottom: 20 }}>Income Profile Analysis</h2>

            <div className="grid-dashboard" style={{ marginBottom: 24 }}>
              <div className="card fade-up d2">
                <div className="card-head">
                  <p className="card-title">Score Factors</p>
                  <p className="card-sub">What drives your consistency rating</p>
                </div>
                <div className="card-body">
                  <div className="report-factor-strip">
                    {score?.score_factors && Array.isArray(score.score_factors) ? (
                      (score.score_factors as any[]).map((f: any, i: number) => (
                        <div key={i} className="report-factor-chip">
                          <span className={`chip-dot ${f.impact}`} />
                          {f.name}
                          <span style={{ opacity: 0.5, marginLeft: 2 }}>
                            {f.weight > 0 ? `+${f.weight}` : f.weight}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-slate">Not enough data for factor analysis.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card fade-up d3">
                <div className="card-head">
                  <p className="card-title">Income Trajectory</p>
                  <p className="card-sub">12-month earnings trend</p>
                </div>
                <div className="card-body">
                  <div className="report-trajectory-bar">
                    <span className={`traj-arrow ${score?.trajectory_label || 'stable'}`}>
                      {score?.trajectory_label === 'growing' ? '↗' : score?.trajectory_label === 'declining' ? '↘' : '→'}
                    </span>
                    <div className="traj-info">
                      <p className="traj-label">
                        {score?.trajectory_label === 'growing' ? 'Growing' : score?.trajectory_label === 'declining' ? 'Declining' : 'Stable'}
                      </p>
                      <p className="traj-desc">
                        {score?.trajectory_slope
                          ? `${(Math.abs(Number(score.trajectory_slope)) * 100).toFixed(1)}%/month ${score.trajectory_label === 'declining' ? 'decline' : 'growth'}`
                          : 'Insufficient data to determine trajectory'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="fade-up d4" style={{ marginBottom: 32 }}>
            <div className="page-header-eyebrow" style={{ marginBottom: 8 }}>
              <span className="page-header-eyebrow-dot" />
              <span className="page-header-eyebrow-label">Platforms</span>
            </div>
            <h2 className="text-heading-feature" style={{ marginBottom: 20 }}>Platform Performance</h2>

            <div className="grid-dashboard">
              {connections.length > 0 && (
                <div className="card fade-up d5">
                  <div className="card-head">
                    <p className="card-title">Connected Platforms</p>
                    <p className="card-sub">Verified income sources</p>
                  </div>
                  <div className="card-body">
                    {connections.map((c) => {
                      const pData = platformMap.get(c.platform)
                      return (
                        <div key={c.platform} className="platform-row">
                          <div className="platform-logo">{platformLabel(c.platform).charAt(0)}</div>
                          <div className="platform-info">
                            <p className="platform-name">{platformLabel(c.platform)}</p>
                            <p className="platform-meta">
                              {pData ? `${pData.count} txns` : 'No recent data'}
                            </p>
                          </div>
                          <div className="platform-right">
                            <p className="platform-amount">{pData ? fmtCurrency(pData.gross) : '—'}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="card fade-up d6">
                <div className="card-head">
                  <p className="card-title">Recent Activity</p>
                  <p className="card-sub">Last {entries.length} transactions</p>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-soft-stone/50">
                        <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate">Date</th>
                        <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate">Platform</th>
                        <th className="px-4 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {entries.slice(0, 8).map((e) => (
                        <tr key={e.id} className="hover:bg-soft-stone/20 transition-colors">
                          <td className="px-4 py-3 text-ink-black whitespace-nowrap text-sm">
                            {fmtDate(e.payment_date || e.period_start)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-black text-[8px] font-medium text-white shrink-0">
                                {platformLabel(e.platform).charAt(0)}
                              </div>
                              <span className="text-sm text-ink-black">{platformLabel(e.platform)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-ink-black">
                            {fmtCurrency(e.gross_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="report-actions-bar fade-up d7">
            <GenerateReportButton hasReports={hasReports} />
            <Link href="/dashboard/worker/statements" className="btn-outline text-sm">View Full Statement →</Link>
          </div>
        </>
      )}
    </div>
  )
}
