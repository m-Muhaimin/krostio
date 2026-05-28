import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Entry = {
  id: string
  platform: string
  gross_amount: number
  net_amount: number
  currency: string
  period_start: string
  payment_date: string | null
  description: string | null
  category: string | null
  source: string
}

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

export default async function StatementPage() {
  const { userId } = await requireRole(['gig_worker'])
  const supabase = createServerSupabaseClient()

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('id, platform, gross_amount, net_amount, currency, period_start, payment_date, description, category, source')
    .eq('user_id', userId)
    .order('period_start', { ascending: false })

  const { data: score } = await supabase
    .from('income_verifications')
    .select('consistency_score, annualized_income, lender_ready_status')
    .eq('user_id', userId)
    .maybeSingle()

  if (!entries || entries.length === 0) {
    return (
      <div>
        <div className="pg-header fade-in d0">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="hero-icon-wrap" style={{ margin: 0 }}>
              <div className="hero-icon hi-coral" style={{ width: 52, height: 52, borderRadius: 14 }}>
                <svg viewBox="0 0 64 64" fill="none" style={{ width: 28, height: 28, color: 'var(--color-coral)' }}>
                  <rect x="10" y="6" width="44" height="52" rx="6" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M20 22h24M20 30h24M20 38h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M38 50l5 5 9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <div className="pg-title">Statement</div>
              <div className="pg-sub">A complete chronological record of all verified gig income transactions across your connected platforms.</div>
            </div>
          </div>
          <Link href="/dashboard/worker/report" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
            View Full Report →
          </Link>
        </div>
        <div className="card text-center fade-up d1" style={{ padding: 48 }}>
          <div className="hero-icon-wrap" style={{ margin: '0 auto 18px' }}>
            <div className="hero-icon hi-coral" style={{ width: 64, height: 64, borderRadius: 16 }}>
              <span className="text-2xl text-white">K</span>
            </div>
          </div>
          <h2 className="page-header-title" style={{ fontSize: 28 }}>No transactions yet.</h2>
          <p className="page-header-desc" style={{ margin: '12px auto 0', maxWidth: 420 }}>
            Connect a gig platform via Plaid to start building your transaction statement.
          </p>
          <Link href="/dashboard/worker/connections" className="btn-ink" style={{ marginTop: 24 }}>Connect a platform →</Link>
        </div>
      </div>
    )
  }

  const totalGross = Math.round(entries.reduce((s, e) => s + Number(e.gross_amount), 0))
  const totalNet = Math.round(entries.reduce((s, e) => s + Number(e.net_amount || e.gross_amount), 0))
  const avgPerTxn = totalGross / entries.length
  const platformCount = new Set(entries.map((e) => e.platform)).size
  const firstDate = entries[entries.length - 1].period_start
  const lastDate = entries[0].period_start

  return (
    <div>
      <div className="pg-header fade-in d0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hero-icon-wrap" style={{ margin: 0 }}>
            <div className="hero-icon hi-coral" style={{ width: 52, height: 52, borderRadius: 14 }}>
              <svg viewBox="0 0 64 64" fill="none" style={{ width: 28, height: 28, color: 'var(--color-coral)' }}>
                <rect x="10" y="6" width="44" height="52" rx="6" stroke="currentColor" strokeWidth="2.5" />
                <path d="M20 22h24M20 30h24M20 38h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M38 50l5 5 9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div>
            <div className="pg-title">Statement</div>
            <div className="pg-sub">A complete chronological record of all verified gig income transactions across your connected platforms.</div>
          </div>
        </div>
        <Link href="/dashboard/worker/report" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
          View Full Report →
        </Link>
      </div>

      <div className="metrics-row">
        <div className="metric-card fade-up d1">
          <p className="mc-eyebrow">Total Deposits</p>
          <p className="mc-value">{fmtCurrency(totalGross)}</p>
        </div>
        <div className="metric-card fade-up d2">
          <p className="mc-eyebrow">Net Total</p>
          <p className="mc-value">{fmtCurrency(totalNet)}</p>
        </div>
        <div className="metric-card fade-up d3">
          <p className="mc-eyebrow">Avg per Transaction</p>
          <p className="mc-value">{fmtCurrency(avgPerTxn)}</p>
        </div>
        <div className="metric-card fade-up d4">
          <p className="mc-eyebrow">Platforms Active</p>
          <p className="mc-value">{platformCount}</p>
        </div>
      </div>

      <div className="card fade-up d5">
        <div className="card-head">
          <p className="card-title">Transaction History</p>
          <p className="card-sub">{entries.length} entries · {fmtDate(firstDate)} – {fmtDate(lastDate)}</p>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="stmt-table-filter-bar" style={{ padding: '16px 20px 0' }}>
            <div className="filter-group">
              <select>
                <option value="">All platforms</option>
                {Array.from(new Set(entries.map((e) => e.platform))).sort().map((p) => (
                  <option key={p} value={p}>{platformLabel(p)}</option>
                ))}
              </select>
              <select>
                <option value="">All sources</option>
                <option value="plaid">Plaid</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <a href="/api/ledger/export" className="link-editorial text-xs">CSV →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-soft-stone/50">
                  <th className="px-5 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate">Date</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate">Platform</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate">Description</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate text-right">Credit</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate text-right">Net</th>
                  <th className="px-5 py-3 font-mono text-[10px] font-medium tracking-widest text-muted-slate text-center">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {entries.map((e, i) => (
                  <tr key={e.id} className="hover:bg-soft-stone/20 transition-colors">
                    <td className="px-5 py-3.5 text-ink-black whitespace-nowrap text-sm">
                      {fmtDate(e.payment_date || e.period_start)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-black text-[10px] font-medium text-white shrink-0">
                          {platformLabel(e.platform).charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-ink-black">{platformLabel(e.platform)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate">
                      {e.description || categoryLabel(e.category)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-ink-black">
                      {fmtCurrency(e.gross_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm tabular-nums text-slate">
                      {e.net_amount ? fmtCurrency(e.net_amount) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${
                        e.source === 'plaid' ? 'text-deep-green font-medium' : 'text-muted-slate'
                      }`}>
                        {e.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
