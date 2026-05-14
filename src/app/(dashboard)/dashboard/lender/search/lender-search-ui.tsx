'use client'

import { useState, useCallback } from 'react'

interface WorkerResult {
  id: string
  display_name: string
  masked_email: string | null
  platforms: string[]
  request_status: 'pending' | 'approved' | 'denied' | null
  score: number | null
  monthly_avg_income: number | null
  tenure_months: number | null
  platform_diversity: number | null
}

const PLATFORM_LABEL: Record<string, string> = {
  uber: 'Uber',
  lyft: 'Lyft',
  doordash: 'DoorDash',
  ubereats: 'Uber Eats',
  grubhub: 'Grubhub',
  instacart: 'Instacart',
  fiverr: 'Fiverr',
  upwork: 'Upwork',
  freelancer: 'Freelancer',
  turo: 'Turo',
  airbnb: 'Airbnb',
  amazon_flex: 'Amazon Flex',
  other: 'Other',
}

export function LenderSearchUI() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WorkerResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requesting, setRequesting] = useState<Record<string, boolean>>({})

  const handleSearch = useCallback(async () => {
    setSearched(true)
    setError(null)
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/lender/search?q=${encodeURIComponent(query.trim())}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Search failed')
        setResults([])
        return
      }
      setResults(json.workers || [])
    } catch (err: any) {
      setError(err?.message ?? 'Network error')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleRequestAccess = async (workerId: string) => {
    setRequesting((prev) => ({ ...prev, [workerId]: true }))
    setError(null)
    try {
      const res = await fetch('/api/lender/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to send request')
        return
      }
      // Optimistically mark as pending in results
      setResults((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, request_status: 'pending' } : w))
      )
    } catch (err: any) {
      setError(err?.message ?? 'Network error')
    } finally {
      setRequesting((prev) => ({ ...prev, [workerId]: false }))
    }
  }

  const scoreLabel = (score: number | null) => {
    if (!score) return 'Locked'
    if (score >= 740) return `${score} · Excellent`
    if (score >= 670) return `${score} · Good`
    if (score >= 580) return `${score} · Fair`
    return `${score} · Poor`
  }

  const requestButton = (worker: WorkerResult) => {
    const isLoading = requesting[worker.id]
    switch (worker.request_status) {
      case 'approved':
        return <button className="btn-primary">View score</button>
      case 'pending':
        return <span className="text-mono-label text-slate">Request pending</span>
      case 'denied':
        return <span className="text-mono-label text-slate">Denied</span>
      default:
        return (
          <button
            className="btn-primary disabled:opacity-50"
            onClick={() => handleRequestAccess(worker.id)}
            disabled={isLoading}
          >
            {isLoading ? 'Requesting…' : 'Request access'}
          </button>
        )
    }
  }

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Lender</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Search workers.
        </h1>
        <p className="mt-3 text-body text-slate">
          Find gig workers and request access to their verified credit scores.
        </p>
      </div>

      {error && (
        <div
          className="rounded-md border px-5 py-4 text-sm"
          style={{ borderColor: 'var(--color-error-red)', color: 'var(--color-error-red)' }}
        >
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by email or name…"
          className="input-rect flex-1 min-w-[260px]"
        />
        <button onClick={handleSearch} className="btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <section>
          <p className="text-mono-label mb-6 text-slate">
            {loading
              ? 'Searching…'
              : results.length === 0
                ? 'No results found. Try a different search term.'
                : `Found ${results.length} worker${results.length > 1 ? 's' : ''}`}
          </p>
          <ul className="divide-y divide-hairline border-t border-hairline">
            {results.map((worker) => (
              <li
                key={worker.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-6 py-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-black text-sm font-medium text-white">
                  {worker.display_name.charAt(0)}
                </div>
                <div>
                  <p className="text-base text-ink-black">{worker.display_name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {worker.platforms.length === 0 ? (
                      <span className="text-mono-label text-slate">No platforms connected</span>
                    ) : (
                      worker.platforms.map((p) => (
                        <span key={p} className="chip-coral-outline text-xs">
                          {PLATFORM_LABEL[p] ?? p}
                        </span>
                      ))
                    )}
                    {worker.tenure_months !== null && (
                      <span className="text-mono-label text-slate">
                        {worker.tenure_months} mo
                      </span>
                    )}
                    {worker.monthly_avg_income !== null && (
                      <span className="text-mono-label text-slate">
                        ${worker.monthly_avg_income.toLocaleString()}/mo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-mono-label text-coral">{scoreLabel(worker.score)}</span>
                  {requestButton(worker)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Empty state */}
      {!searched && (
        <section className="card-stone">
          <p className="text-mono-label text-slate">Getting started</p>
          <h2 className="mt-3 text-heading-feature text-ink-black">Find workers</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate">
            Search by email or name to find gig workers. Once you find one, request access
            to view their attested credit score. Workers approve or deny each request.
          </p>
        </section>
      )}
    </div>
  )
}
