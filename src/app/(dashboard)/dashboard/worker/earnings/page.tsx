import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

type MonthlyRow = {
  month: string
  dd: number
  up: number
  ue: number
  fv: number
  total: number
  badge: string
  badgeText: string
}

export default async function EarningsPage() {
  const { userId } = await requireRole(['gig_worker'])
  const supabase = createServerSupabaseClient()

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('platform, gross_amount, period_start')
    .eq('user_id', userId)
    .gte('period_start', subMonths(new Date(), 12).toISOString().split('T')[0])
    .order('period_start', { ascending: false })

  const { data: connections } = await supabase
    .from('platform_connections')
    .select('platform, is_active, last_sync_at')
    .eq('user_id', userId)
    .eq('is_active', true)

  const monthBuckets: Record<string, MonthlyRow> = {}
  let totalAll = 0
  const platformTotals: Record<string, number> = {}
  let monthCount = 0

  if (Array.isArray(entries)) {
    for (const e of entries) {
      const key = format(new Date(e.period_start), 'MMM yyyy')
      const amt = Number(e.gross_amount) || 0
      totalAll += amt
      platformTotals[e.platform] = (platformTotals[e.platform] || 0) + amt

      if (!monthBuckets[key]) {
        monthBuckets[key] = { month: key, dd: 0, up: 0, ue: 0, fv: 0, total: 0, badge: 'badge-slate', badgeText: '' }
      }
      monthBuckets[key].total += amt
    }
    const monthKeys = Object.keys(monthBuckets).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    monthCount = monthKeys.length
    for (let i = 0; i < monthKeys.length; i++) {
      const m = monthBuckets[monthKeys[i]]
      if (i > 0) {
        const prev = monthBuckets[monthKeys[i - 1]]
        const pct = prev.total ? ((m.total - prev.total) / prev.total) * 100 : 0
        if (pct > 2) { m.badge = 'badge-green'; m.badgeText = `↑ ${Math.round(pct)}%` }
        else if (pct < -2) { m.badge = 'badge-amber'; m.badgeText = `↓ ${Math.abs(Math.round(pct))}%` }
        else { m.badge = 'badge-slate'; m.badgeText = 'Stable' }
      } else {
        m.badge = 'badge-slate'
        m.badgeText = 'Baseline'
      }
    }
  }

  const months = Object.values(monthBuckets).reverse()
  const maxTotal = months.reduce((m, r) => Math.max(m, r.total), 0) || 1

  const annualized = monthCount > 0 ? Math.round((totalAll / monthCount) * 12) : 0
  const monthlyAvg = monthCount > 0 ? Math.round(totalAll / monthCount) : 0

  const bestMonth = months.reduce((best, m) => (m.total > (best?.total || 0) ? m : best), months[0])

  const platformNames: Record<string, string> = {
    doordash: 'DoorDash', upwork: 'Upwork', ubereats: 'Uber Eats', fiverr: 'Fiverr',
    instacart: 'Instacart', lyft: 'Lyft', uber: 'Uber', grubhub: 'Grubhub',
    amazon_flex: 'Amazon Flex', turo: 'Turo',
  }
  const platformLogos: Record<string, string> = {
    doordash: '🍔', upwork: '💻', ubereats: '🚗', fiverr: '🎨',
    instacart: '🛒', lyft: '🚕', uber: '🚙', grubhub: '🍕',
    amazon_flex: '📦', turo: '🔑',
  }
  const platformColors: Record<string, string> = {
    doordash: '#ff3008', upwork: '#14a800', ubereats: '#00b4d8', fiverr: '#1dbf73',
    instacart: '#4caf50', lyft: '#ff00bf', uber: '#000000', grubhub: '#f15d22',
    amazon_flex: '#ff9900', turo: '#0070f3',
  }
  const platformBgColors: Record<string, string> = {
    doordash: '#fff0ee', upwork: '#f0fdf4', ubereats: '#eff6ff', fiverr: '#f0fdf4',
    instacart: '#f0fdf4', lyft: '#fff0fc', uber: '#f5f5f5', grubhub: '#fff4f0',
    amazon_flex: '#fff8f0', turo: '#f0f5ff',
  }

  const platformEntries = Object.entries(platformTotals)
    .sort(([, a], [, b]) => b - a)

  return (
    <div>
      <div className="pg-header fade-in d0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hero-icon-wrap" style={{ margin: 0 }}>
            <div className="hero-icon hi-coral" style={{ width: 52, height: 52, borderRadius: 14 }}>
              <svg viewBox="0 0 64 64" fill="none" style={{ width: 28, height: 28, color: 'var(--color-coral)' }}>
                <rect x="8" y="8" width="48" height="48" rx="12" stroke="currentColor" strokeWidth="2.5" />
                <path d="M16 40l10-14 10 10 6-8 6 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="40" r="3" fill="currentColor" />
                <circle cx="48" cy="40" r="3" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div>
            <div className="pg-title">Earnings</div>
            <div className="pg-sub">Full income history across all connected platforms</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-sm-outline">Export CSV</button>
          <button className="btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>
            ↓ Download PDF
          </button>
        </div>
      </div>

      <div className="earnings-grid fade-in d1">
        <div className="earn-stat-card">
          <div className="esc-icon" style={{ background: 'var(--color-coral-pale)' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 2v22M7 7l6-5 6 5M7 20l6 4 6-4" stroke="var(--color-coral)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="esc-label">Annualized Income</div>
          <div className="esc-value"><sup>$</sup>{annualized.toLocaleString()}</div>
          <div className="badge badge-green">Based on {monthCount} months</div>
        </div>
        <div className="earn-stat-card">
          <div className="esc-icon" style={{ background: 'var(--color-success-bg)' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="3" y="5" width="20" height="18" rx="3" stroke="var(--color-success)" strokeWidth="2" />
              <path d="M3 11h20M9 5V3M17 5V3" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="esc-label">Monthly Average</div>
          <div className="esc-value"><sup>$</sup>{monthlyAvg.toLocaleString()}</div>
          {months.length > 1 && <div className="badge badge-green">Across {monthCount} months</div>}
        </div>
        <div className="earn-stat-card">
          <div className="esc-icon" style={{ background: 'var(--color-pale-blue)' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M3 20l7-10 6 7 4-5 3 8" stroke="var(--color-action-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="esc-label">Best Single Month</div>
          <div className="esc-value"><sup>$</sup>{bestMonth ? bestMonth.total.toLocaleString() : 0}</div>
          <div className="badge badge-blue">{bestMonth?.month || 'N/A'}</div>
        </div>
      </div>

      {platformEntries.length > 0 && (
        <div className="plat-breakdown-grid fade-in d2">
          {platformEntries.map(([platform, total]) => (
            <div key={platform} className="pbd-card">
              <div className="pbd-logo" style={{ background: platformBgColors[platform] || '#f5f5f5' }}>
                {platformLogos[platform] || '📊'}
              </div>
              <div className="pbd-name">{platformNames[platform] || platform}</div>
              <div className="pbd-meta">{(connections || []).find(c => c.platform === platform) ? 'Connected' : 'Previously connected'}</div>
              <div className="pbd-amount"><sup>$</sup>{total.toLocaleString()}</div>
              <div className="pbd-pct">{Math.round((total / (totalAll || 1)) * 100)}% of total · {monthCount} months</div>
              <div className="pbd-bar-bg">
                <div className="pbd-bar" style={{ width: `${Math.round((total / (totalAll || 1)) * 100)}%`, background: platformColors[platform] || '#888' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {months.length > 0 && (
        <div className="card fade-in d3">
          <div className="card-head">
            <div>
              <div className="card-title">Earnings Over Time</div>
              <div className="card-sub">Last {months.length} months across all platforms</div>
            </div>
            <button className="btn-sm-outline">Export</button>
          </div>
          <div className="monthly-chart-wrap">
            {months.map((row) => (
              <div key={row.month} className="monthly-chart-row">
                <div className="monthly-chart-month">{row.month}</div>
                <div className="monthly-chart-track">
                  <div className="monthly-chart-fill" style={{ width: `${(row.total / maxTotal) * 100}%`, background: 'var(--color-coral, #ff7759)' }} />
                </div>
                <div className="monthly-chart-total">${row.total.toLocaleString()}</div>
                <span className={`badge ${row.badge}`} style={{ fontSize: 9, width: 52, textAlign: 'center', flexShrink: 0 }}>{row.badgeText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries && entries.length === 0 && (
        <div className="card fade-in d1" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 14, color: 'var(--color-muted-slate)' }}>
            No earnings data yet. Connect your platforms to start tracking income.
          </div>
        </div>
      )}
    </div>
  )
}
