import Link from 'next/link'
import { requireRole } from '@/lib/auth-guard'
import { createServiceSupabaseClient } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'

const RANGE_DAYS: Record<string, number | null> = {
  '7': 7,
  '30': 30,
  '90': 90,
  all: null,
}

type ReferralRow = {
  id: string
  worker_id: string | null
  ref_code: string
  clicked_at: string
  applied_at: string | null
  funded_at: string | null
  estimated_payout_cents: number | null
  actual_payout_cents: number | null
  consistency_score_at_click: number | null
}

function fmtUsd(cents: number | null | undefined): string {
  if (cents == null) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

function status(r: ReferralRow): { label: string; color: string } {
  if (r.funded_at) return { label: 'Funded', color: 'var(--color-deep-green)' }
  if (r.applied_at) return { label: 'Applied', color: 'var(--color-ink-black)' }
  return { label: 'Clicked', color: 'var(--color-slate)' }
}

export default async function LenderReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { userId: lenderId } = await requireRole(['lender'])
  const sp = await searchParams
  const rangeKey = sp.range && RANGE_DAYS[sp.range] !== undefined ? sp.range : '30'
  const days = RANGE_DAYS[rangeKey]

  const service = createServiceSupabaseClient()

  let query = service
    .from('lender_referrals')
    .select(
      'id, worker_id, ref_code, clicked_at, applied_at, funded_at, estimated_payout_cents, actual_payout_cents, consistency_score_at_click',
    )
    .eq('lender_id', lenderId)
    .order('clicked_at', { ascending: false })
    .limit(200)

  if (days != null) {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
    query = query.gte('clicked_at', since)
  }

  const { data } = await query
  const rows = ((data as ReferralRow[] | null) ?? [])

  const totals = {
    clicks: rows.length,
    applied: rows.filter((r) => r.applied_at).length,
    funded: rows.filter((r) => r.funded_at).length,
    estimated: rows.reduce((sum, r) => sum + (r.estimated_payout_cents ?? 0), 0),
    actual: rows.reduce((sum, r) => sum + (r.actual_payout_cents ?? 0), 0),
  }

  return (
    <div className="space-y-12">
      <div>
        <p className="text-mono-label text-slate">Referrals</p>
        <h1 className="mt-3 font-display text-[40px] leading-none tracking-tight text-ink-black">
          Workers you reached.
        </h1>
        <p className="mt-3 text-body text-slate">
          Every time a worker clicks through to your application page from the Krost directory,
          we record it here.
        </p>
      </div>

      {/* Range pills */}
      <div className="flex gap-2">
        {(['7', '30', '90', 'all'] as const).map((k) => (
          <Link
            key={k}
            href={`/dashboard/lender/referrals?range=${k}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              rangeKey === k
                ? 'border-ink-black bg-ink-black text-white'
                : 'border-hairline text-slate hover:text-ink-black'
            }`}
          >
            {k === 'all' ? 'All time' : `Last ${k} days`}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <section className="grid gap-0 border-t border-b border-hairline md:grid-cols-5">
        {[
          { label: 'Clicks', value: String(totals.clicks) },
          { label: 'Applied', value: String(totals.applied) },
          { label: 'Funded', value: String(totals.funded) },
          { label: 'Est. revenue', value: fmtUsd(totals.estimated) },
          { label: 'Actual revenue', value: fmtUsd(totals.actual) },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`py-6 md:px-6 ${i < 4 ? 'md:border-r border-hairline' : ''}`}
          >
            <p className="text-mono-label text-slate">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-normal tracking-tight text-ink-black">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="card-bordered px-8 py-12 text-center">
          <p className="text-mono-label text-slate">Empty state</p>
          <p className="mt-3 text-sm text-ink">No referrals in this window.</p>
          <p className="mt-1 text-sm text-slate">
            Make sure your directory listing is up to date.{' '}
            <Link href="/dashboard/lender/listing" className="link-editorial">
              Edit listing →
            </Link>
          </p>
        </div>
      ) : (
        <div className="card-bordered overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-mono-label text-slate">
                <th className="px-6 py-4 font-normal">Date</th>
                <th className="px-6 py-4 font-normal">Worker</th>
                <th className="px-6 py-4 font-normal">Krost score</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Est. payout</th>
                <th className="px-6 py-4 font-normal">Actual payout</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = status(r)
                return (
                  <tr key={r.id} className="border-b border-hairline last:border-b-0">
                    <td className="px-6 py-4 text-ink">
                      {new Date(r.clicked_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-ink">
                      {r.worker_id ? `Worker #${r.worker_id.slice(0, 6)}` : 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-ink">
                      {r.consistency_score_at_click ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: s.color }}>{s.label}</span>
                    </td>
                    <td className="px-6 py-4 text-ink">{fmtUsd(r.estimated_payout_cents)}</td>
                    <td className="px-6 py-4 text-ink">{fmtUsd(r.actual_payout_cents)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
