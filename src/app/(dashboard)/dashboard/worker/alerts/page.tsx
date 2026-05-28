import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function AlertsPage() {
  const { userId } = await requireRole(['gig_worker'])
  const supabase = createServerSupabaseClient()

  const { data: connections } = await supabase
    .from('platform_connections')
    .select('platform')
    .eq('user_id', userId)
    .eq('is_active', true)

  const { data: score } = await supabase
    .from('income_verifications')
    .select('consistency_score')
    .eq('user_id', userId)
    .maybeSingle()

  const hasData = (connections?.length || 0) > 0 && !!score

  const preferences = [
    {
      iconBg: 'var(--color-success-bg)',
      svg: <path d="M2 15l5-7 5 6 3-4 4 5" stroke="var(--color-success)" strokeWidth="1.8" strokeLinecap="round" />,
      title: 'Weekly income digest',
      desc: "Every Monday — last week's total, top platform, and trend",
    },
    {
      iconBg: 'var(--color-warning-bg)',
      svg: <><path d="M11 3l9 16H2L11 3z" stroke="var(--color-warning)" strokeWidth="1.8" strokeLinejoin="round" /><path d="M11 9v4M11 16v.5" stroke="var(--color-warning)" strokeWidth="1.8" strokeLinecap="round" /></>,
      title: 'Income drop alert',
      desc: 'Notify when income drops more than 20% month-over-month',
    },
    {
      iconBg: 'var(--color-pale-blue)',
      svg: <><circle cx="11" cy="11" r="8" stroke="var(--color-action-blue)" strokeWidth="1.8" /><path d="M11 7v5l3 2" stroke="var(--color-action-blue)" strokeWidth="1.8" strokeLinecap="round" /></>,
      title: 'Best day/week insights',
      desc: 'Highlight your peak earning periods and seasonal patterns',
    },
    {
      iconBg: 'var(--color-coral-pale)',
      svg: <><rect x="4" y="3" width="14" height="16" rx="2" stroke="var(--color-coral)" strokeWidth="1.8" /><path d="M7 8h8M7 12h5" stroke="var(--color-coral)" strokeWidth="1.8" strokeLinecap="round" /></>,
      title: 'Statement ready',
      desc: 'Notify when your monthly PDF statement is generated',
    },
  ]

  return (
    <div>
      <div className="pg-header fade-in d0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hero-icon-wrap" style={{ margin: 0 }}>
            <div className="hero-icon hi-amber" style={{ width: 52, height: 52, borderRadius: 14 }}>
              <svg viewBox="0 0 64 64" fill="none" style={{ width: 28, height: 28, color: 'var(--color-warning)' }}>
                <path d="M32 8v6M32 50v6M8 32H2M62 32h-6M14.1 14.1l-4.2-4.2M54.1 54.1l-4.2-4.2M14.1 49.9l-4.2 4.2M54.1 9.9l-4.2 4.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="2.5" />
                <path d="M32 26v7M32 37v1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div>
            <div className="pg-title">Income Alerts</div>
            <div className="pg-sub">Real-time insights on your earnings — trend changes, platform drops, record weeks, and actionable recommendations.</div>
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="alert-full-list fade-in d1">
          {score && (
            <div className="alert-full-item">
              <div className="afi-icon" style={{ background: 'var(--color-success-bg)' }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M3 18l6-9 6 7 4-5 4 7" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div className="afi-title">Consistency score available</div>
                <div className="afi-desc">Your income consistency score of {score.consistency_score}/100 is ready. View the full breakdown on the Score page.</div>
              </div>
              <div className="afi-meta">
                <span className="badge badge-green">Score ready</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card fade-in d1" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 14, color: 'var(--color-muted-slate)', marginBottom: 8 }}>No alerts yet</div>
          <div style={{ fontSize: 13, color: 'var(--color-muted-slate)', maxWidth: 400, margin: '0 auto' }}>
            Connect your platforms and start earning. Alerts about income trends, platform concentration, and earning records will appear here once we have enough data to analyze.
          </div>
        </div>
      )}

      <div className="card fade-in d3">
        <div className="card-head">
          <div>
            <div className="card-title">Alert Preferences</div>
            <div className="card-sub">Choose what Krostio notifies you about</div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {preferences.map((p, i) => (
            <div key={i} className="pref-card">
              <div className="pref-icon" style={{ background: p.iconBg }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">{p.svg}</svg>
              </div>
              <div style={{ flex: 1 }}>
                <div className="pref-title">{p.title}</div>
                <div className="pref-desc">{p.desc}</div>
              </div>
              <div className="toggle on" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
