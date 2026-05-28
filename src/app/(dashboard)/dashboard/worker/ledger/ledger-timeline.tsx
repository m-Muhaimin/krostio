'use client'

import { useEffect, useState, useCallback } from 'react'

type LedgerEntry = {
  id: string
  platform: string
  gross_amount: number
  net_amount: number
  currency: string
  period_start: string
  period_end: string
  payment_date: string | null
  category: string | null
  source: string
  verified_at: string
}

type Pagination = {
  page: number
  limit: number
  total: number
  total_pages: number
}

const PLATFORM_LABELS: Record<string, string> = {
  uber: 'Uber', lyft: 'Lyft', ubereats: 'Uber Eats', doordash: 'DoorDash',
  grubhub: 'Grubhub', instacart: 'Instacart', fiverr: 'Fiverr', upwork: 'Upwork',
  freelancer: 'Freelancer', turo: 'Turo', airbnb: 'Airbnb', amazon_flex: 'Amazon Flex',
  shopify: 'Shopify', etsy: 'Etsy', mercari: 'Mercari', poshmark: 'Poshmark',
  ebay: 'eBay', depop: 'Depop', stockx: 'StockX', whatnot: 'Whatnot',
}

const CATEGORY_COLORS: Record<string, string> = {
  rides: 'var(--color-coral)',
  delivery: 'var(--color-action-blue)',
  rideshare: 'var(--color-coral)',
  marketplace: 'var(--color-coral)',
  flex: 'var(--color-slate)',
}

function platformLabel(p: string) {
  return PLATFORM_LABELS[p] || p.charAt(0).toUpperCase() + p.slice(1)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(amount: number) {
  return '$' + Math.round(amount).toLocaleString()
}

export function LedgerTimeline() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [filterPlatform, setFilterPlatform] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const loadEntries = useCallback(async (p: number, platform?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50' })
      if (platform) params.set('platform', platform)

      const res = await fetch(`/api/ledger/entries?${params}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to load entries')
        return
      }

      setEntries(json.entries ?? [])
      setPagination(json.pagination ?? null)

      // Collect unique platforms
      const uniquePlatforms = Array.from(
        new Set((json.entries as LedgerEntry[]).map((e: LedgerEntry) => e.platform))
      ) as string[]
      setPlatforms((prev) => {
        const merged = new Set([...prev, ...uniquePlatforms])
        return Array.from(merged)
      })
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntries(1)
  }, [loadEntries])

  const handleFilter = () => {
    setPage(1)
    loadEntries(1, filterPlatform)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    loadEntries(newPage, filterPlatform)
  }

  const hasEntries = entries.length > 0

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <p className="text-mono-label text-muted-slate tracking-widest text-[10px]">Timeline</p>
          <h2 className="mt-2 text-heading-feature text-ink-black">Detailed entries</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-slate underline underline-offset-2 hover:text-ink-black"
          >
            {showFilters ? 'Hide filters' : 'Filter'}
          </button>
          <a
            href="/api/ledger/export"
            className="btn-outline text-xs"
          >
            Export CSV
          </a>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="rounded-full border border-hairline px-4 py-2 text-sm outline-none focus:border-ink-black bg-white"
          >
            <option value="">All platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>{platformLabel(p)}</option>
            ))}
          </select>
          <button
            onClick={handleFilter}
            className="btn-ink text-xs"
          >
            Apply
          </button>
        </div>
      )}

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--color-error-red)', color: 'var(--color-error-red)' }}
        >
          {error}
        </div>
      )}

      {loading && !hasEntries && (
        <div className="rounded-[20px] border border-hairline bg-white px-8 py-12 text-center">
          <p className="text-sm text-slate">Loading entries…</p>
        </div>
      )}

      {!loading && !hasEntries && !error && (
        <div className="rounded-[20px] border border-hairline bg-white px-8 py-12 text-center">
          <p className="text-mono-label text-muted-slate tracking-widest text-[10px]">Empty</p>
          <p className="mt-3 text-sm text-ink">No detailed entries yet.</p>
          <p className="mt-1 text-sm text-slate">
            Entries appear here as your platforms sync earnings data.
          </p>
        </div>
      )}

      {hasEntries && (
        <>
          <div className="overflow-x-auto rounded-[20px] border border-hairline">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-soft-stone/50">
                  <th className="px-4 py-3 font-medium text-mono-label text-muted-slate text-[10px] tracking-widest">Date</th>
                  <th className="px-4 py-3 font-medium text-mono-label text-muted-slate text-[10px] tracking-widest">Platform</th>
                  <th className="px-4 py-3 font-medium text-mono-label text-muted-slate text-[10px] tracking-widest">Category</th>
                  <th className="px-4 py-3 font-medium text-mono-label text-muted-slate text-[10px] tracking-widest text-right">Gross</th>
                  <th className="px-4 py-3 font-medium text-mono-label text-muted-slate text-[10px] tracking-widest text-right">Net</th>
                  <th className="px-4 py-3 font-medium text-mono-label text-muted-slate text-[10px] tracking-widest text-center">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-soft-stone/30 transition-colors">
                    <td className="px-4 py-3 text-ink-black whitespace-nowrap text-sm">
                      {formatDate(e.period_start)}
                      {e.period_start !== e.period_end && (
                        <span className="text-slate"> – {formatDate(e.period_end)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-black text-[10px] font-medium text-white shrink-0">
                          {platformLabel(e.platform).charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-ink-black">
                          {platformLabel(e.platform)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {e.category && (
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white"
                          style={{
                            backgroundColor: CATEGORY_COLORS[e.category] || 'var(--color-slate)',
                          }}
                        >
                          {e.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-ink-black">
                      {formatCurrency(e.gross_amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate">
                      {e.net_amount ? formatCurrency(e.net_amount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] uppercase tracking-wider ${
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

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="btn-outline text-xs disabled:opacity-30"
              >
                ← Previous
              </button>
              <span className="text-sm text-slate">
                Page {pagination.page} of {pagination.total_pages}
                <span className="ml-2 text-xs">({pagination.total} entries)</span>
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.total_pages}
                className="btn-outline text-xs disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
