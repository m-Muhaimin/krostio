'use client'

import { useState } from 'react'

interface WorkerResult {
  id: string
  name: string
  platforms: string[]
  score: number | null
  rating: number
  tenure: string
  monthlyAvg: string
}

const mockResults: WorkerResult[] = [
  {
    id: '1',
    name: 'Alex M.',
    platforms: ['Uber', 'DoorDash'],
    score: 720,
    rating: 4.92,
    tenure: '14 months',
    monthlyAvg: '$4,200',
  },
  {
    id: '2',
    name: 'Jordan K.',
    platforms: ['Fiverr', 'Upwork'],
    score: 680,
    rating: 4.8,
    tenure: '8 months',
    monthlyAvg: '$3,100',
  },
  {
    id: '3',
    name: 'Sam T.',
    platforms: ['Lyft', 'Instacart', 'Amazon Flex'],
    score: null,
    rating: 4.75,
    tenure: '22 months',
    monthlyAvg: '$5,800',
  },
]

export function LenderSearchUI() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WorkerResult[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = () => {
    setSearched(true)
    setResults(query.trim() ? mockResults : [])
  }

  const scoreLabel = (score: number | null) => {
    if (!score) return 'No score'
    if (score >= 740) return `${score} · Excellent`
    if (score >= 670) return `${score} · Good`
    if (score >= 580) return `${score} · Fair`
    return `${score} · Poor`
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

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by email, wallet address, or name…"
          className="input-rect flex-1 min-w-[260px]"
        />
        <button onClick={handleSearch} className="btn-primary">
          Search
        </button>
      </div>

      {/* Filter pills — research-style */}
      <div className="flex flex-wrap gap-2">
        {['Score 700+', 'Score 600+', 'Uber', 'Lyft', 'DoorDash', 'Fiverr', '$3,000+/mo', '$5,000+/mo'].map((label) => (
          <button key={label} className="btn-pill-outline">{label}</button>
        ))}
      </div>

      {/* Results */}
      {searched && (
        <section>
          <p className="text-mono-label mb-6 text-slate">
            {results.length === 0
              ? 'No results found. Try a different search term.'
              : `Found ${results.length} worker${results.length > 1 ? 's' : ''}`}
          </p>
          <ul className="divide-y divide-hairline border-t border-hairline">
            {results.map((worker) => (
              <li key={worker.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-6 py-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-black text-sm font-medium text-white">
                  {worker.name.charAt(0)}
                </div>
                <div>
                  <p className="text-base text-ink-black">{worker.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {worker.platforms.map((p) => (
                      <span key={p} className="chip-coral-outline text-xs">{p}</span>
                    ))}
                    <span className="text-mono-label text-slate">
                      {worker.tenure} · {worker.monthlyAvg}/mo · ★ {worker.rating}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-mono-label text-coral">{scoreLabel(worker.score)}</span>
                  <button className="btn-primary">Request access</button>
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
            Search by email, wallet address, or name to find gig workers and request access
            to their verified credit scores and income history.
          </p>
          <p className="mt-4 text-xs text-slate">
            0 / 50 verifications remaining this month
          </p>
        </section>
      )}
    </div>
  )
}
