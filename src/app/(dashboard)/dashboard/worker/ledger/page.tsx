import { requireRole } from '@/lib/auth-guard'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { LedgerTimeline } from './ledger-timeline'

export const dynamic = 'force-dynamic'

type MonthlyRow = {
  month: string
  platform: string
  gross_total: number
  net_total: number
  payment_count: number
}

type PlatformSummary = {
  name: string
  gross_total: number
  net_total: number
  months_active: number
}

function formatCurrency(amount: number): string {
  return '$' + Math.round(amount).toLocaleString()
}

function formatMonth(iso: string): string {
  const [y, m] = iso.split('-')
  const date = new Date(parseInt(y), parseInt(m) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

type LedgerData = {
  monthly: MonthlyRow[]
  totals: { gross_total: number; net_total: number; total_payments: number; total_months: number }
  platforms: PlatformSummary[]
  entryCount: number
}

/** SE tax estimate on YTD net earnings */
function calcSETax(ytdNet: number): { annualSE: number; quarterlySE: number } {
  const SE_TAX_RATE = 0.153
  const SE_DEDUCTION = 0.9235
  const annualSE = ytdNet * SE_DEDUCTION * SE_TAX_RATE
  const quarterlySE = annualSE / 4
  return { annualSE, quarterlySE }
}

type AnomalyFlag = { month: string; pctDrop: number }

/** Find months where income dropped >40% vs trailing 3-month average */
function detectAnomalies(
  months: { month: string; gross: number }[]
): AnomalyFlag[] {
  const sorted = [...months].sort((a, b) => a.month.localeCompare(b.month))
  const flags: AnomalyFlag[] = []
  for (let i = 3; i < sorted.length; i++) {
    const trailing = sorted.slice(i - 3, i)
    const avg = trailing.reduce((s, m) => s + m.gross, 0) / 3
    if (avg <= 0) continue
    const current = sorted[i].gross
    const pctDrop = ((avg - current) / avg) * 100
    if (pctDrop > 40) {
      flags.push({ month: sorted[i].month, pctDrop: Math.round(pctDrop) })
    }
  }
  return flags
}

async function loadLedgerData(userId: string): Promise<LedgerData | null> {
  const supabase = createServerSupabaseClient()

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('platform, gross_amount, net_amount, period_start, period_end, payment_date, source, category, verified_at')
    .eq('user_id', userId)
    .order('period_start', { ascending: false })

  if (!entries || entries.length === 0) {
    return null
  }

  const monthlyMap = new Map<string, { gross: number; net: number; payments: number }>()
  const platformTotals = new Map<string, { gross: number; net: number; months: Set<string> }>()

  for (const e of entries) {
    const monthKey = e.period_start.slice(0, 7)
    const existing = monthlyMap.get(`${monthKey}:${e.platform}`) || { gross: 0, net: 0, payments: 0 }
    existing.gross += Number(e.gross_amount) || 0
    existing.net += Number(e.net_amount) || 0
    existing.payments += 1
    monthlyMap.set(`${monthKey}:${e.platform}`, existing)

    const p = platformTotals.get(e.platform) || { gross: 0, net: 0, months: new Set<string>() }
    p.gross += Number(e.gross_amount) || 0
    p.net += Number(e.net_amount) || 0
    p.months.add(monthKey)
    platformTotals.set(e.platform, p)
  }

  const monthly: MonthlyRow[] = Array.from(monthlyMap.entries()).map(([key, val]) => {
    const [month, platform] = key.split(':')
    return { month, platform, gross_total: val.gross, net_total: val.net, payment_count: val.payments }
  })

  const platforms: PlatformSummary[] = Array.from(platformTotals.entries()).map(([name, val]) => ({
    name,
    gross_total: val.gross,
    net_total: val.net,
    months_active: val.months.size,
  }))

  const totals = {
    gross_total: entries.reduce((s, e) => s + Number(e.gross_amount), 0),
    net_total: entries.reduce((s, e) => s + Number(e.net_amount || e.gross_amount), 0),
    total_payments: entries.length,
    total_months: new Set(entries.map((e) => e.period_start.slice(0, 7))).size,
  }

  return { monthly, totals, platforms, entryCount: entries.length }
}

export default async function LedgerPage() {
  await requireRole(['gig_worker'])
  const currentUser = await getCurrentUser()
  const user = currentUser!.user
  const supabase = createServerSupabaseClient()

  if (!user) {
    return <div className="card text-center p-12 fade-in d0">Authentication error.</div>
  }

  const ledgerData = await loadLedgerData(user.id)

  if (!ledgerData) {
    return (
      <div>
        <div className="page-header fade-up d0">
          <h1 className="page-title">Incomes</h1>
          <p className="page-sub">Your complete, unified record of all gig earnings across every connected platform.</p>
        </div>
        <div className="card text-center fade-up d1" style={{ padding: 48 }}>
          <div className="hero-icon-wrap" style={{ margin: '0 auto 18px' }}>
            <div className="hero-icon hi-coral" style={{ width: 64, height: 64, borderRadius: 16 }}>
              <span className="text-2xl text-white">K</span>
            </div>
          </div>
          <h2 className="page-header-title" style={{ fontSize: 28 }}>No earnings data yet.</h2>
          <p className="page-header-desc" style={{ margin: '12px auto 0', maxWidth: 420 }}>
            Connect a gig platform via Plaid to start building your earnings ledger.
          </p>
          <Link href="/dashboard/worker/connections" className="btn-ink" style={{ marginTop: 24 }}>Connect a platform →</Link>
        </div>
      </div>
    )
  }

  const { monthly, totals, platforms, entryCount } = ledgerData

  const monthsWithData = new Set(monthly.map((m) => m.month))
  const totalActiveMonths = monthsWithData.size

  const combinedMonthly = Array.from(monthsWithData)
    .sort()
    .map((month) => {
      const monthRows = monthly.filter((m) => m.month === month)
      return {
        month,
        gross: monthRows.reduce((s, r) => s + Number(r.gross_total), 0),
        net: monthRows.reduce((s, r) => s + Number(r.net_total), 0),
        payments: monthRows.reduce((s, r) => s + r.payment_count, 0),
        platformCount: new Set(monthRows.map((r) => r.platform)).size,
      }
    })

  const sortedChron = combinedMonthly
  const reversedMonthly = [...combinedMonthly].reverse()

  const avgMonthly = totalActiveMonths > 0 ? totals.gross_total / totalActiveMonths : 0

  // Pillar 2 — Tax estimation
  const { annualSE, quarterlySE } = calcSETax(totals.net_total)

  // Pillar 2 — Anomaly detection
  const anomalies = detectAnomalies(sortedChron)
  const anomalyMonths = new Set(anomalies.map((a) => a.month))

  // Month-over-month delta for monthly avg metric
  const lastIdx = sortedChron.length - 1
  const currMoGross = lastIdx >= 0 ? sortedChron[lastIdx].gross : 0
  const prevMoGross = lastIdx > 0 ? sortedChron[lastIdx - 1].gross : 0
  const moDeltaPct = prevMoGross > 0 ? ((currMoGross - prevMoGross) / prevMoGross) * 100 : 0
  const moDeltaClass = moDeltaPct > 5 ? 'up' : moDeltaPct < -5 ? 'down' : 'flat'
  const moDeltaText = prevMoGross > 0
    ? (moDeltaPct > 0 ? `+${moDeltaPct.toFixed(0)}%` : `${moDeltaPct.toFixed(0)}%`)
    : '—'

  return (
    <div>
      {/* Page Header */}
      <div className="page-header fade-up d0">
        <h1 className="page-title">Incomes</h1>
        <p className="page-sub">Your complete, unified record of all gig earnings across every connected platform.</p>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card fade-up d1">
          <p className="mc-eyebrow">Total Gross</p>
          <p className="mc-value">{formatCurrency(totals.gross_total)}</p>
        </div>
        <div className="metric-card fade-up d2">
          <p className="mc-eyebrow">Monthly Avg</p>
          <p className="mc-value">{formatCurrency(avgMonthly)}</p>
          <span className={`mc-delta ${moDeltaClass}`}>{moDeltaText}</span>
        </div>
        <div className="metric-card fade-up d3">
          <p className="mc-eyebrow">Active Months</p>
          <p className="mc-value">{totalActiveMonths}<sup>m</sup></p>
        </div>
        <div className="metric-card fade-up d4">
          <p className="mc-eyebrow">Entries</p>
          <p className="mc-value">{entryCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Two-column: Tax estimation + Monthly chart */}
      <div className="grid-dashboard" style={{ marginBottom: 24 }}>
        {/* Tax estimation card */}
        {totals.net_total > 0 && (
          <div className="card fade-up d5">
            <div className="card-head">
              <p className="card-title">Self-employment tax</p>
              <p className="card-sub">Based on {formatCurrency(totals.net_total)} YTD net</p>
            </div>
            <div className="card-body">
              <div className="p-5 flex items-center gap-8">
                <div>
                  <p className="card-label">Annual estimate</p>
                  <p className="mt-2 font-display text-3xl tracking-tight text-ink-black">{formatCurrency(annualSE)}</p>
                </div>
                <div className="h-10 w-px bg-hairline" />
                <div>
                  <p className="card-label">Quarterly due</p>
                  <p className="mt-2 font-display text-3xl tracking-tight" style={{ color: 'var(--color-coral)' }}>{formatCurrency(quarterlySE)}</p>
                  <p className="mt-1 text-[10px] text-slate">≈ ${Math.round(quarterlySE / 3).toLocaleString()}/mo</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly mini chart card */}
        <div className="card fade-up d6">
          <div className="card-head">
            <p className="card-title">Monthly earnings</p>
            <p className="card-sub">{combinedMonthly.length} months</p>
          </div>
          <div className="card-body">
            <div className="p-5">
              <div className="flex items-end gap-1.5" style={{ height: 100 }}>
                {reversedMonthly.slice(0, 12).reverse().map((m) => {
                  const maxGross = Math.max(...reversedMonthly.map((cm) => cm.gross), 1)
                  const heightPct = Math.max(4, (m.gross / maxGross) * 100)
                  return (
                    <div key={m.month} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
                      <div
                        className="w-full rounded-t-sm transition-all hover:opacity-80"
                        style={{ height: `${heightPct}%`, backgroundColor: 'var(--color-coral)', minHeight: 4 }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                        {formatMonth(m.month)}: {formatCurrency(m.gross)}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex gap-1.5">
                {reversedMonthly.slice(0, 12).reverse().map((m) => (
                  <span key={m.month} className="flex-1 text-center text-[9px] text-muted-slate">{formatMonth(m.month).slice(0, 3)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: Platform breakdown + Monthly history */}
      <div className="grid-dashboard" style={{ marginBottom: 24 }}>
        {/* Platform breakdown card */}
        <div className="card fade-up d7">
          <div className="card-head">
            <p className="card-title">Platforms</p>
            <p className="card-sub">Income sources breakdown</p>
          </div>
          <div className="card-body">
            {platforms.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-slate">No platform data aggregated yet.</p>
              </div>
            ) : (
              <div>
                {platforms.sort((a, b) => b.gross_total - a.gross_total).map((p) => {
                  const pct = totals.gross_total > 0 ? ((p.gross_total / totals.gross_total) * 100).toFixed(1) : '0'
                  return (
                    <div key={p.name} className="platform-row">
                      <div className="platform-logo">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="platform-info">
                        <p className="platform-name">{p.name}</p>
                        <p className="platform-meta">{p.months_active}mo · {pct}%</p>
                      </div>
                      <div className="platform-right">
                        <p className="platform-amount">{formatCurrency(p.gross_total)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Monthly history table card */}
        <div className="card fade-up d7">
          <div className="card-head">
            <p className="card-title">Monthly history</p>
            <a href="/api/ledger/export" className="link-editorial text-xs">CSV →</a>
          </div>
          <div className="card-body">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>P</th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                {reversedMonthly.slice(0, 24).map((m) => {
                  const anomaly = anomalies.find((a) => a.month === m.month)
                  return (
                    <tr key={m.month} className={anomaly ? 'anomaly' : ''}>
                      <td className="cell-month">
                        {anomaly && (
                          <span className="anomaly-badge" title={`${anomaly.pctDrop}% drop`}>!</span>
                        )}
                        {formatMonth(m.month)}
                      </td>
                      <td className="cell-amount">{formatCurrency(m.gross)}</td>
                      <td className="cell-amount">{formatCurrency(m.net)}</td>
                      <td className="cell-center">{m.platformCount}</td>
                      <td className="cell-amount">{m.payments}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mb-6 fade-up d7">
        <LedgerTimeline />
      </div>
    </div>
  )
}
