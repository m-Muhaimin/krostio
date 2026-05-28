import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GenerateReportButton } from './generate-report-button'

type DashboardData = {
  displayName: string
  annualizedIncome: number | null
  monthlyAverage: number | null
  consistencyScore: number | null
  trajectoryLabel: string | null
  platformCount: number
  connections: { platform: string; last_sync_at: string | null }[]
  reports: { id: string; created_at: string }[]
  hasScore: boolean
  hasReports: boolean
}

const PLATFORM_NAMES: Record<string, string> = {
  uber: 'Uber',
  ubereats: 'Uber Eats',
  lyft: 'Lyft',
  doordash: 'DoorDash',
  grubhub: 'Grubhub',
  instacart: 'Instacart',
  fiverr: 'Fiverr',
  upwork: 'Upwork',
  freelancer: 'Freelancer',
  turo: 'Turo',
  airbnb: 'Airbnb',
  amazon_flex: 'Amazon Flex',
  other: 'Other deposits',
}

function fmt(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return '$' + Math.round(n).toLocaleString()
}

export default async function WorkerDashboard() {
  const { userId } = await requireRole(['gig_worker'])
  const supabase = createServerSupabaseClient()

  const [connResult, reportResult, profileResult, verifyResult] = await Promise.all([
    supabase.from('platform_connections').select('platform, last_sync_at, is_active').eq('user_id', userId).eq('is_active', true),
    supabase.from('reports').select('id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('full_name').eq('id', userId).single(),
    supabase.from('income_verifications').select('consistency_score, annualized_income, monthly_avg_income, trajectory_label').eq('user_id', userId).maybeSingle(),
  ])

  const connections = (connResult.data || []) as { platform: string; last_sync_at: string | null }[]
  const hasConnections = connections.length > 0
  const reports = (reportResult.data || []) as { id: string; created_at: string }[]
  const hasReports = reports.length > 0
  const fullName = profileResult.data?.full_name || ''
  const displayName = fullName || 'Worker'

  const verification = verifyResult.data

  const dashboardData: DashboardData = {
    displayName,
    annualizedIncome: verification?.annualized_income ? Number(verification.annualized_income) : null,
    monthlyAverage: verification?.monthly_avg_income ? Number(verification.monthly_avg_income) : null,
    consistencyScore: verification?.consistency_score ?? null,
    trajectoryLabel: verification?.trajectory_label ?? null,
    platformCount: connections.length,
    connections,
    reports,
    hasScore: verification !== null,
    hasReports,
  }

  if (!hasConnections) {
    return <OnboardingDashboard displayName={displayName} />
  }

  return <ConnectedDashboard data={dashboardData} />
}

function OnboardingDashboard({ displayName }: { displayName: string }) {
  return (
    <div>
      <div className="pg-header fade-in d0">
        <div>
          <div className="pg-title">Good morning, {displayName} 👋</div>
          <div className="pg-sub">Connect your first platform to start tracking your income</div>
        </div>
      </div>

      <div className="fade-in d1">
        <div className="card empty-state" style={{ border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-md)' }}>
          <div className="hero-icon-wrap">
            <div className="hero-icon hi-coral">
              <svg viewBox="0 0 64 64" fill="none" style={{ color: 'var(--color-coral)', width: 56, height: 56 }}>
                <circle cx="16" cy="32" r="10" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="48" cy="32" r="10" stroke="currentColor" strokeWidth="2.5" />
                <path d="M26 32h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M32 22v-8M32 50v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3,3" />
              </svg>
            </div>
          </div>
          <div className="empty-title">Connect your gig platforms to get started</div>
          <div className="empty-sub">
            Link your DoorDash, Uber, Upwork, and more via Plaid. We turn your earnings into professional income statements — ready for landlords, lenders, and loans.
          </div>
          <Link
            href="/dashboard/worker/connections"
            className="btn-primary"
            style={{ fontSize: 14, padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Connect your first platform
          </Link>

          <div style={{ display: 'flex', gap: 24, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-muted-slate)' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="var(--color-coral)" strokeWidth="1.3" /><path d="M5 7.5l2 2 3-3" stroke="var(--color-coral)" strokeWidth="1.3" strokeLinecap="round" /></svg>
              Bank-grade security via Plaid
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-muted-slate)' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="var(--color-coral)" strokeWidth="1.3" /><path d="M5 7.5l2 2 3-3" stroke="var(--color-coral)" strokeWidth="1.3" strokeLinecap="round" /></svg>
              12,000+ supported platforms
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-muted-slate)' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="var(--color-coral)" strokeWidth="1.3" /><path d="M5 7.5l2 2 3-3" stroke="var(--color-coral)" strokeWidth="1.3" strokeLinecap="round" /></svg>
              Professional PDF statements
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConnectedDashboard({ data }: { data: DashboardData }) {
  const hasMetrics = data.hasScore && data.annualizedIncome !== null

  const trajectoryLabel = data.trajectoryLabel || 'stable'
  const trajColor = trajectoryLabel === 'growing' ? 'var(--color-success)' : trajectoryLabel === 'declining' ? 'var(--color-error-red)' : 'var(--color-muted-slate)'
  const trajArrow = trajectoryLabel === 'growing' ? '↑' : trajectoryLabel === 'declining' ? '↓' : '→'
  const trajText = trajectoryLabel === 'growing' ? 'Growing' : trajectoryLabel === 'declining' ? 'Declining' : 'Stable'

  const latestReport = data.reports[0]
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthShort = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="pg-header fade-in d0">
        <div>
          <div className="pg-title">Good morning, {data.displayName} 👋</div>
          <div className="pg-sub">
            {hasMetrics
              ? `Trailing 12-month income summary · ${monthShort}`
              : `${data.platformCount} platform${data.platformCount === 1 ? '' : 's'} connected — syncing your earnings`
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'var(--color-muted-slate)', background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-pill)', padding: '6px 14px' }}>{monthShort}</div>
          <GenerateReportButton hasReports={data.hasReports} />
        </div>
      </div>

      {/* Statement ready banner — only if there's a report */}
      {latestReport && (
        <div className="stmt-banner fade-in d1">
          <div className="sb-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="16" height="18" rx="2.5" stroke="white" strokeWidth="1.6" /><path d="M7 8h8M7 12h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </div>
          <div className="stmt-banner-body">
            <div className="stmt-banner-title">Your {currentMonth} statement is ready</div>
            <div className="stmt-banner-sub">Professional PDF · Download or share</div>
          </div>
          <div className="stmt-banner-actions">
            <button className="btn-white-pill"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 6l3 3 3-3" stroke="#17171c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 10h10" stroke="#17171c" strokeWidth="1.5" strokeLinecap="round" /></svg>Download PDF</button>
            <button className="btn-ghost-pill"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 6v1a4 4 0 004 4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>Share Link</button>
          </div>
        </div>
      )}

      {/* No data yet banner */}
      {!hasMetrics && (
        <div className="fade-in d1" style={{ padding: '24px 0' }}>
          <div style={{ background: 'var(--color-pale-blue)', border: '1px solid rgba(24,99,220,0.15)', borderRadius: 'var(--radius-md)', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--color-action-blue)" strokeWidth="1.5" /><path d="M12 8v4M12 16v.5" stroke="var(--color-action-blue)" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-action-blue)' }}>Syncing your income data</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted-slate)', marginTop: 2 }}>
                Your connected {data.platformCount} platform{data.platformCount === 1 ? '' : 's'} are being analyzed. Income metrics will appear once Plaid finishes syncing your transactions.
              </div>
            </div>
            <Link href="/dashboard/worker/connections" className="btn-sm-outline" style={{ flexShrink: 0 }}>Manage connections</Link>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="metrics-4 fade-in d2" style={!hasMetrics ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
        <div className="mc">
          <div className="mc-label">Annualized Income<div className="mc-icon" style={{ background: 'var(--color-coral-pale)' }}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M3 4l3.5-3L10 4M3 10l3.5 2.5L10 10" stroke="var(--color-coral)" strokeWidth="1.4" strokeLinecap="round" /></svg></div></div>
          <div className="mc-val">{fmt(data.annualizedIncome)}</div>
          {hasMetrics && <div className="mc-delta up">{trajArrow} {trajText}</div>}
        </div>
        <div className="mc">
          <div className="mc-label">Monthly Average<div className="mc-icon" style={{ background: 'var(--color-success-bg)' }}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 10l4-5 3 3 5-7" stroke="var(--color-success)" strokeWidth="1.4" strokeLinecap="round" /></svg></div></div>
          <div className="mc-val">{fmt(data.monthlyAverage)}</div>
        </div>
        <div className="mc">
          <div className="mc-label">Consistency Score<div className="mc-icon" style={{ background: 'var(--color-pale-blue)' }}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="var(--color-action-blue)" strokeWidth="1.4" /><path d="M4 6.5l2 2 3-3" stroke="var(--color-action-blue)" strokeWidth="1.4" strokeLinecap="round" /></svg></div></div>
          <div className="mc-val">
            {data.consistencyScore !== null ? data.consistencyScore : '—'}
            {data.consistencyScore !== null && <span style={{ fontSize: 13, color: 'var(--color-muted-slate)', fontWeight: 400 }}>/100</span>}
          </div>
        </div>
        <div className="mc">
          <div className="mc-label">Active Platforms<div className="mc-icon" style={{ background: 'var(--color-warning-bg)' }}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="3.5" cy="3.5" r="2" stroke="var(--color-warning)" strokeWidth="1.4" /><circle cx="9.5" cy="3.5" r="2" stroke="var(--color-warning)" strokeWidth="1.4" /><circle cx="3.5" cy="9.5" r="2" stroke="var(--color-warning)" strokeWidth="1.4" /><circle cx="9.5" cy="9.5" r="2" stroke="var(--color-warning)" strokeWidth="1.4" /></svg></div></div>
          <div className="mc-val">{data.platformCount}</div>
          {data.platformCount > 1 && <div className="mc-delta flat">Well diversified</div>}
        </div>
      </div>

      {/* Connected platforms + Recent reports — only show when metrics exist */}
      {hasMetrics && (
        <div className="grid-3-r fade-in d3">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Connected Platforms</div>
                <div className="card-sub">{data.platformCount} active</div>
              </div>
            </div>
            {data.connections.map((c, i) => (
              <div key={c.platform} className="plat-row">
                <div className="plat-logo" style={{ background: i % 2 === 0 ? '#fff0ee' : '#f0fdf4' }}>
                  <span style={{ fontSize: 14 }}>{PLATFORM_NAMES[c.platform]?.[0] || c.platform[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="plat-name">{PLATFORM_NAMES[c.platform] || c.platform}</div>
                  <div className="plat-meta">{c.last_sync_at ? `Synced ${formatRelative(c.last_sync_at)}` : 'Not synced'}</div>
                </div>
                <div className="status-pip on"></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Statement History</div>
                <div className="card-sub">Download or share</div>
              </div>
            </div>
            {data.reports.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: 'var(--color-muted-slate)' }}>
                No statements yet. Hit Generate Report to create your first PDF.
              </div>
            ) : (
              data.reports.slice(0, 3).map((r) => (
                <div key={r.id} className="stmt-row">
                  <div className="stmt-ico"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="var(--color-coral)" strokeWidth="1.4" /><path d="M5 6h6M5 9h4" stroke="var(--color-coral)" strokeWidth="1.4" strokeLinecap="round" /></svg></div>
                  <div>
                    <div className="stmt-name">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    <div className="stmt-date">{formatRelative(r.created_at)}</div>
                  </div>
                  <div className="stmt-btns">
                    <button className="act-btn pri">↓ PDF</button>
                    <button className="act-btn">Share</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Income Overview</div>
                <div className="card-sub">At a glance</div>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--color-ink-black)' }}>
                {fmt(data.annualizedIncome)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted-slate)', marginTop: 4 }}>Annualized income (trailing 12 months)</div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-soft-stone)', borderRadius: 9999, padding: '4px 12px', fontSize: 11, color: 'var(--color-muted-slate)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: trajColor }}>{trajArrow}</span> {trajText}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-soft-stone)', borderRadius: 9999, padding: '4px 12px', fontSize: 11, color: 'var(--color-muted-slate)', fontFamily: 'var(--font-mono)' }}>
                  {data.consistencyScore}/100 consistency
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatRelative(iso: string | null): string {
  if (!iso) return 'Never'
  const d = new Date(iso)
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`
  if (mins < 60 * 24 * 7) return `${Math.floor(mins / (60 * 24))}d ago`
  return d.toLocaleDateString()
}
