import { requireRole } from '@/lib/auth-guard'
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

async function loadLedgerData(userId: string): Promise<LedgerData | null> {
  const supabase = await createServerSupabaseClient()

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
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="py-20 text-center text-slate">Authentication error.</div>
  }

  const ledgerData = await loadLedgerData(user.id)

  if (!ledgerData) {
    return (
      <div className="space-y-14">
        <div>
          <p className="text-mono-label text-slate">Worker</p>
          <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">Earnings ledger.</h1>
          <p className="mt-3 text-body text-slate">Your complete, unified record of all gig earnings across every connected platform.</p>
        </div>
        <section className="card-bordered px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-ink-black">
            <span className="text-2xl text-white">K</span>
          </div>
          <h2 className="font-display text-2xl tracking-tight text-ink-black">No earnings data yet.</h2>
          <p className="mt-3 max-w-md mx-auto text-sm text-slate">
            Connect a gig platform via Plaid to start building your earnings ledger. Every deposit from Uber, Lyft, DoorDash, and more is tracked automatically.
          </p>
          <Link href="/dashboard/worker/connections" className="btn-ink mt-8 inline-flex">Connect a platform →</Link>
        </section>
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
    .reverse()

  const avgMonthly = totalActiveMonths > 0 ? totals.gross_total / totalActiveMonths : 0

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Worker</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">Earnings ledger.</h1>
        <p className="mt-3 text-body text-slate">Your complete, unified record of all gig earnings across every connected platform.</p>
      </div>

      {/* Stats row */}
      <section className="grid gap-px overflow-hidden rounded-md md:grid-cols-4"
        style={{ backgroundColor: 'var(--color-hairline)' }}
      >
        {[
          { label: 'Total gross earnings', value: formatCurrency(totals.gross_total) },
          { label: 'Monthly average', value: formatCurrency(avgMonthly) },
          { label: 'Active months', value: `${totalActiveMonths}m` },
          { label: 'Total entries', value: entryCount.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-white px-6 py-8">
            <p className="text-mono-label text-slate">{stat.label}</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-ink-black">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Monthly chart */}
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-heading-feature text-ink-black">Monthly earnings</h2>
          <span className="text-mono-label text-slate">{combinedMonthly.length} months</span>
        </div>
        <div className="card-bordered px-6 py-8">
          <div className="flex items-end gap-1.5" style={{ height: 120 }}>
            {combinedMonthly.slice(0, 12).reverse().map((m) => {
              const maxGross = Math.max(...combinedMonthly.map((cm) => cm.gross), 1)
              const heightPct = Math.max(4, (m.gross / maxGross) * 100)
              return (
                <div key={m.month} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-sm transition-all hover:opacity-80"
                    style={{ height: `${heightPct}%`, backgroundColor: 'var(--color-coral)', minHeight: 4 }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {formatMonth(m.month)}: {formatCurrency(m.gross)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex gap-1.5">
            {combinedMonthly.slice(0, 12).reverse().map((m) => (
              <span key={m.month} className="flex-1 text-center text-[10px] text-slate">{formatMonth(m.month).slice(0, 3)}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Platform breakdown */}
      <section>
        <h2 className="mb-6 text-heading-feature text-ink-black">Platform breakdown</h2>
        {platforms.length === 0 ? (
          <div className="card-bordered px-8 py-12 text-center">
            <p className="text-sm text-slate">No platform data aggregated yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {platforms.sort((a, b) => b.gross_total - a.gross_total).map((p) => {
              const pct = totals.gross_total > 0 ? ((p.gross_total / totals.gross_total) * 100).toFixed(1) : '0'
              return (
                <div key={p.name} className="card-bordered flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-ink-black text-sm font-medium text-white">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize text-ink-black">{p.name}</p>
                      <p className="text-xs text-slate">{p.months_active} month{p.months_active === 1 ? '' : 's'} · {pct}% of total</p>
                    </div>
                  </div>
                  <p className="font-display text-xl tracking-tight text-ink-black">{formatCurrency(p.gross_total)}</p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Monthly history table */}
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-heading-feature text-ink-black">Monthly history</h2>
          <a href="/api/ledger/export" className="link-editorial text-sm">Download CSV →</a>
        </div>
        <div className="overflow-x-auto rounded-md border border-hairline">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-soft-stone text-mono-label text-slate">
                <th className="px-5 py-3 font-medium">Month</th>
                <th className="px-5 py-3 font-medium text-right">Gross</th>
                <th className="px-5 py-3 font-medium text-right">Net</th>
                <th className="px-5 py-3 font-medium text-center">Platforms</th>
                <th className="px-5 py-3 font-medium text-right">Payments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {combinedMonthly.slice(0, 24).map((m) => (
                <tr key={m.month} className="hover:bg-soft-stone transition-colors">
                  <td className="px-5 py-4 font-medium text-ink-black">{formatMonth(m.month)}</td>
                  <td className="px-5 py-4 text-right text-ink-black">{formatCurrency(m.gross)}</td>
                  <td className="px-5 py-4 text-right text-slate">{formatCurrency(m.net)}</td>
                  <td className="px-5 py-4 text-center text-slate">{m.platformCount}</td>
                  <td className="px-5 py-4 text-right text-slate">{m.payments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <LedgerTimeline />
    </div>
  )
}
