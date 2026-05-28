import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { format, subMonths, startOfMonth } from 'date-fns'

export default async function AnalyticsPage() {
  const { userId } = await requireRole(['gig_worker'])
  const supabase = createServerSupabaseClient()

  const { data: score } = await supabase
    .from('income_verifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const twelveMonthsAgo = subMonths(new Date(), 11)
  const firstDay = startOfMonth(twelveMonthsAgo).toISOString().split('T')[0]

  const { data: monthly } = await supabase
    .from('ledger_monthly')
    .select('month, gross_total, platform')
    .eq('user_id', userId)
    .gte('month', firstDay)
    .order('month', { ascending: true })

  const { data: connections } = await supabase
    .from('platform_connections')
    .select('platform')
    .eq('user_id', userId)
    .eq('is_active', true)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  const monthMap: Record<string, number> = {}
  const platformMonthly: Record<string, Record<string, number>> = {}
  let ytdTotal = 0

  if (Array.isArray(monthly)) {
    for (const m of monthly) {
      const monthLabel = format(new Date(m.month + '-01'), 'MMM')
      const amt = Number(m.gross_total) || 0
      monthMap[monthLabel] = (monthMap[monthLabel] || 0) + amt
      if (m.month.startsWith(new Date().getFullYear().toString())) ytdTotal += amt
      if (!platformMonthly[m.platform]) platformMonthly[m.platform] = {}
      platformMonthly[m.platform][monthLabel] = (platformMonthly[m.platform][monthLabel] || 0) + amt
    }
  }

  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), 11 - i)
    return format(d, 'MMM')
  })

  // Compute YoY growth from monthly data
  const computeYoY = () => {
    const labels = allMonths
    const vals = labels.map(l => monthMap[l] || 0)
    const half = Math.floor(vals.length / 2)
    const firstHalf = vals.slice(0, half).reduce((a, b) => a + b, 0)
    const secondHalf = vals.slice(half).reduce((a, b) => a + b, 0)
    if (firstHalf === 0) return null
    return ((secondHalf - firstHalf) / firstHalf) * 100
  }
  const yoyGrowth = computeYoY()

  const barData = allMonths.map(label => ({
    label,
    val: monthMap[label] || 0,
  }))
  const barMax = Math.max(...barData.map(b => b.val), 1)

  const totalPlatforms = (connections || []).length
  const platformNames = (connections || []).map(c => {
    const names: Record<string, string> = { doordash: 'DD', upwork: 'UW', ubereats: 'UE', fiverr: 'FV', instacart: 'IC', lyft: 'LY', uber: 'UB' }
    return names[c.platform] || c.platform.slice(0, 2).toUpperCase()
  }).join(', ')

  const consistencyScore = score?.consistency_score ?? 0
  const annualizedIncome = score?.annualized_income ? Number(score.annualized_income) : 0
  const monthlyAvg = score?.monthly_avg_income ? Number(score.monthly_avg_income) : 0
  const platformDiversity = score?.platform_diversity ?? totalPlatforms
  const trajectoryLabel = score?.trajectory_label ?? 'stable'

  const totalThisYear = ytdTotal || annualizedIncome

  const bestMonth = allMonths.reduce((best, m) => (monthMap[m] || 0) > (best.val || 0) ? { label: m, val: monthMap[m] || 0 } : best, { label: '', val: 0 })

  const platformTotals: Record<string, number> = {}
  for (const [plat, months] of Object.entries(platformMonthly)) {
    platformTotals[plat] = Object.values(months).reduce((a, b) => a + b, 0)
  }
  const platformEntries = Object.entries(platformTotals).sort(([, a], [, b]) => b - a)

  const insights = [
    {
      iconBg: 'var(--color-success-bg)',
      svg: <path d="M2 15l5-7 5 6 3-4 4 5" stroke="var(--color-success)" strokeWidth="1.8" strokeLinecap="round" />,
      label: 'YoY Growth',
      val: yoyGrowth !== null ? `${yoyGrowth >= 0 ? '+' : ''}${Math.round(yoyGrowth)}%` : '—',
      sub: yoyGrowth !== null ? 'vs. previous 6 months' : 'Insufficient data',
    },
    {
      iconBg: 'var(--color-warning-bg)',
      svg: <><path d="M12 3v6l4 2" stroke="var(--color-warning)" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="8" stroke="var(--color-warning)" strokeWidth="1.8" /></>,
      label: 'Avg. Weekly',
      val: monthlyAvg > 0 ? `$${Math.round(monthlyAvg / 4).toLocaleString()}` : '$0',
      sub: 'across all platforms',
    },
    {
      iconBg: 'var(--color-pale-blue)',
      svg: <><path d="M5 18l5-7 5 6 3-4 4 3" stroke="var(--color-action-blue)" strokeWidth="1.8" strokeLinecap="round" /><circle cx="4" cy="18" r="3" fill="var(--color-action-blue)" /><circle cx="15" cy="18" r="3" fill="var(--color-action-blue)" /><circle cx="22" cy="18" r="3" fill="var(--color-action-blue)" /></>,
      label: 'YTD Total',
      val: `$${totalThisYear.toLocaleString()}`,
      sub: `${new Date().toLocaleString('default', { month: 'long' })} projection`,
    },
    {
      iconBg: 'var(--color-coral-pale)',
      svg: <><path d="M6 16l5-7 5 6 3-4 4 4" stroke="var(--color-coral)" strokeWidth="1.8" strokeLinecap="round" /><path d="M17 12l4-5" stroke="var(--color-coral)" strokeWidth="1.8" strokeLinecap="round" /></>,
      label: 'Best Month',
      val: bestMonth.label || 'N/A',
      sub: bestMonth.val ? `$${bestMonth.val.toLocaleString()} (${bestMonth.label})` : 'No data',
    },
    {
      iconBg: '#f0ebe3',
      svg: <path d="M12 2l2 7h6l-5 4 2 7-5-4-5 4 2-7-5-4h6z" stroke="var(--color-muted-slate)" strokeWidth="1.8" strokeLinecap="round" />,
      label: 'Consistency',
      val: `${consistencyScore}/100`,
      sub: consistencyScore >= 80 ? 'top 20% of gig workers' : consistencyScore >= 60 ? 'above average' : 'needs improvement',
    },
    {
      iconBg: 'var(--color-warning-bg)',
      svg: <><path d="M7 17l5-5 5 5-5 5-5-5z" stroke="var(--color-warning)" strokeWidth="1.8" strokeLinejoin="round" /><path d="M7 8l5-5 5 5" stroke="var(--color-warning)" strokeWidth="1.8" strokeLinejoin="round" /></>,
      label: 'Platforms Active',
      val: String(totalPlatforms),
      sub: platformNames || 'none',
    },
    {
      iconBg: '#f0ebe3',
      svg: <><circle cx="12" cy="12" r="8" stroke="var(--color-muted-slate)" strokeWidth="1.8" /><path d="M12 6v6l4 2" stroke="var(--color-muted-slate)" strokeWidth="1.8" strokeLinecap="round" /></>,
      label: 'Data Span',
      val: `${score?.tenure_months || '—'} months`,
      sub: 'tracked in Krostio',
    },
    {
      iconBg: 'var(--color-coral-pale)',
      svg: <><path d="M4 16l4-6 5 5 3-4 5 5" stroke="var(--color-coral)" strokeWidth="1.8" strokeLinecap="round" /><path d="M20 20H4" stroke="var(--color-coral)" strokeWidth="1.8" strokeLinecap="round" /></>,
      label: 'Top Platform',
      val: platformEntries.length > 0 ? platformEntries[0][0] : '—',
      sub: platformEntries.length > 0 ? `${Math.round((platformEntries[0][1] / Object.values(monthMap).reduce((a, b) => a + b, 0)) * 100)}% of total` : 'No data',
    },
  ]

  const hmLevel = (v: number) => {
    if (v >= 18) return 'hm-4'
    if (v >= 14) return 'hm-3'
    if (v >= 10) return 'hm-2'
    if (v >= 7) return 'hm-1'
    return 'hm-0'
  }

  return (
    <div>
      <div className="pg-header fade-in d0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hero-icon-wrap" style={{ margin: 0 }}>
            <div className="hero-icon hi-blue" style={{ width: 52, height: 52, borderRadius: 14 }}>
              <svg viewBox="0 0 64 64" fill="none" style={{ width: 28, height: 28, color: 'var(--color-action-blue)' }}>
                <rect x="4" y="30" width="10" height="28" rx="2" stroke="currentColor" strokeWidth="2.5" />
                <rect x="18" y="20" width="10" height="38" rx="2" stroke="currentColor" strokeWidth="2.5" />
                <rect x="32" y="14" width="10" height="44" rx="2" stroke="currentColor" strokeWidth="2.5" />
                <rect x="46" y="24" width="10" height="34" rx="2" stroke="currentColor" strokeWidth="2.5" />
                <path d="M4 8v22M18 8v12M32 8v6M46 8v16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="4" cy="8" r="3" fill="currentColor" />
                <circle cx="18" cy="8" r="3" fill="currentColor" />
                <circle cx="32" cy="8" r="3" fill="currentColor" />
                <circle cx="46" cy="8" r="3" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div>
            <div className="pg-title">Income Analytics</div>
            <div className="pg-sub">Deep breakdown of your earnings — trends, patterns, and year-over-year comparisons.</div>
          </div>
        </div>
      </div>

      <div className="insights-grid fade-in d1">
        {insights.slice(0, 4).map((ins, i) => (
          <div key={i} className="insight-card">
            <div className="ic-icon" style={{ background: ins.iconBg }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">{ins.svg}</svg>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-muted-slate)', fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase' }}>{ins.label}</div>
            <div className="ic-val">{ins.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted-slate)' }}>{ins.sub}</div>
          </div>
        ))}
      </div>

      <div className="card fade-in d2">
        <div className="card-head">
          <div>
            <div className="card-title">Monthly Income — {new Date().getFullYear()}</div>
            <div className="card-sub">Total verified earnings across all connected platforms</div>
          </div>
        </div>
        <div className="bar-chart-wrap">
          {barData.map((b, i) => (
            <div key={i} className="bar-row">
              <span className="bar-label">{b.label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(b.val / barMax) * 100}%` }}>
                  <span className="bar-val">${b.val.toLocaleString()}</span>
                </div>
              </div>
              <span className="bar-amt">${b.val.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="insights-grid fade-in d3">
        {insights.slice(4).map((ins, i) => (
          <div key={i} className="insight-card">
            <div className="ic-icon" style={{ background: ins.iconBg }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">{ins.svg}</svg>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-muted-slate)', fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase' }}>{ins.label}</div>
            <div className="ic-val">{ins.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted-slate)' }}>{ins.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
