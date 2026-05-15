'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'

type Connection = {
  id: string
  platform: string
  institution_name: string | null
  is_active: boolean
  last_sync_at: string | null
  provider: string | null
  access_token?: string
  item_id?: string
}

const PLATFORM_LABELS: Record<string, { name: string; initial: string }> = {
  uber: { name: 'Uber', initial: 'U' },
  lyft: { name: 'Lyft', initial: 'L' },
  doordash: { name: 'DoorDash', initial: 'D' },
  ubereats: { name: 'Uber Eats', initial: 'U' },
  grubhub: { name: 'Grubhub', initial: 'G' },
  fiverr: { name: 'Fiverr', initial: 'F' },
  upwork: { name: 'Upwork', initial: 'U' },
  freelancer: { name: 'Freelancer', initial: 'F' },
  instacart: { name: 'Instacart', initial: 'I' },
  turo: { name: 'Turo', initial: 'T' },
  airbnb: { name: 'Airbnb', initial: 'A' },
  amazon_flex: { name: 'Amazon Flex', initial: 'A' },
  other: { name: 'Other deposits', initial: 'O' },
}

function platformLabel(p: string) {
  return PLATFORM_LABELS[p] ?? { name: p, initial: p.charAt(0).toUpperCase() }
}

function formatSync(iso: string | null) {
  if (!iso) return 'Never'
  const d = new Date(iso)
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`
  return d.toLocaleDateString()
}

export function ConnectionsUI() {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<{
    platforms: string[]
    records: number
    score: number | null
  } | null>(null)
  const [seedResult, setSeedResult] = useState<{
    total: number
    platforms: string[]
    score: number | null
  } | null>(null)

  // Load existing connections
  const loadConnections = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/gig-platforms')
      const json = await res.json()
      setConnections(json.connections ?? [])
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load connections')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  // Fetch a link token on mount so Plaid Link is ready when user clicks
  useEffect(() => {
    let cancelled = false
    async function getToken() {
      try {
        const res = await fetch('/api/plaid/link-token', { method: 'POST' })
        const json = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(json.error || 'Failed to initialize Plaid')
          return
        }
        setLinkToken(json.link_token)
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Plaid init failed')
      }
    }
    getToken()
    return () => {
      cancelled = true
    }
  }, [])

  const onSuccess = useCallback(
    async (public_token: string, metadata: any) => {
      setSyncing(true)
      setError(null)
      setLastResult(null)
      try {
        const res = await fetch('/api/plaid/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token,
            institution: metadata?.institution
              ? {
                  name: metadata.institution.name,
                  institution_id: metadata.institution.institution_id,
                }
              : undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || 'Failed to connect')
          return
        }
        setLastResult({
          platforms: json.platforms_connected ?? [],
          records: json.income_records_added ?? 0,
          score: json.score?.consistency_score ?? null,
        })
        await loadConnections()
      } catch (err: any) {
        setError(err?.message ?? 'Exchange failed')
      } finally {
        setSyncing(false)
      }
    },
    [loadConnections]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  })

  // Sandbox seed: inject fake gig transactions + resync
  const handleSandboxSeed = async () => {
    setSeeding(true)
    setError(null)
    setSeedResult(null)
    try {
      const res = await fetch('/api/plaid/sandbox-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resync: true, weeks: 13 }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Sandbox seed failed')
        return
      }
      setSeedResult({
        total: json.total_seeded,
        platforms: json.sync?.platforms_detected ?? [],
        score: json.sync?.score ?? null,
      })
      await loadConnections()
    } catch (err: any) {
      setError(err?.message ?? 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  const handleResync = async () => {
    setSyncing(true)
    setError(null)
    setLastResult(null)
    try {
      const res = await fetch('/api/plaid/sandbox-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resync: true, weeks: 13 }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Re-sync failed')
        return
      }
      setLastResult({
        platforms: json.sync?.platforms_detected ?? [],
        records: json.sync?.income_rows ?? 0,
        score: json.sync?.score ?? null,
      })
      await loadConnections()
    } catch (err: any) {
      setError(err?.message ?? 'Re-sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const disconnect = async (platform: string) => {
    setConnections((prev) => prev.filter((c) => c.platform !== platform))
  }

  const active = connections.filter((c) => c.is_active)
  const isSandbox = typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' || window.location.hostname.endsWith('.vercel.app')

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Worker</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Platform connections.
        </h1>
        <p className="mt-3 text-body text-slate">
          Connect your bank to verify your gig income. Your deposits are scanned for earnings
          from Uber, Lyft, DoorDash, Instacart, Fiverr, Upwork, and more.
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

      {lastResult && (
        <div className="card-bordered px-6 py-5" style={{ borderLeft: '4px solid var(--color-coral)' }}>
          <p className="text-mono-label text-coral">Sync complete</p>
          <p className="mt-2 text-sm text-ink-black">
            Added {lastResult.records} income record{lastResult.records === 1 ? '' : 's'} across{' '}
            {lastResult.platforms.length} platform
            {lastResult.platforms.length === 1 ? '' : 's'}
            {lastResult.score !== null && (
              <>
                {' '}· Consistency score: <strong>{lastResult.score}</strong>/100
              </>
            )}
          </p>
        </div>
      )}

      {seedResult && (
        <div className="card-bordered px-6 py-5" style={{ borderLeft: '4px solid var(--color-link-blue)' }}>
          <p className="text-mono-label text-link-blue">Sandbox seed complete</p>
          <p className="mt-2 text-sm text-ink-black">
            Injected {seedResult.total} fake transactions across{' '}
            {seedResult.platforms.length} platform{seedResult.platforms.length === 1 ? '' : 's'}
            {seedResult.score !== null && (
              <>
                {' '}· Score: <strong>{seedResult.score}</strong>/100
              </>
            )}
          </p>
        </div>
      )}

      {/* Connected platforms */}
      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="text-heading-feature text-ink-black">Connected</h2>
          <span className="text-mono-label text-coral">{active.length}</span>
        </div>
        {loading ? (
          <div className="card-bordered px-8 py-12 text-center">
            <p className="text-sm text-slate">Loading connections…</p>
          </div>
        ) : active.length === 0 ? (
          <div className="card-bordered px-8 py-12 text-center">
            <p className="text-mono-label text-slate">Empty state</p>
            <p className="mt-3 text-sm text-ink">No platforms connected yet.</p>
            <p className="mt-1 text-sm text-slate">
              Connect your bank below to detect gig platform deposits automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {active.map((c) => {
              const label = platformLabel(c.platform)
              return (
                <div
                  key={c.id}
                  className="card-bordered flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-ink-black text-sm font-medium text-white">
                      {label.initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-black">{label.name}</p>
                      <p className="text-xs text-slate">
                        {c.institution_name ? `${c.institution_name} · ` : ''}
                        Last sync {formatSync(c.last_sync_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnect(c.platform)}
                    className="btn-pill-outline"
                    style={{
                      borderColor: 'var(--color-error-red)',
                      color: 'var(--color-error-red)',
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Connect via Plaid */}
      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="text-heading-feature text-ink-black">Add a connection</h2>
        </div>
        <div className="card-bordered px-8 py-10">
          <p className="text-mono-label text-slate">Bank-verified income</p>
          <h3 className="mt-3 font-display text-2xl tracking-tight text-ink-black">
            Connect your bank.
          </h3>
          <p className="mt-3 max-w-xl text-sm text-slate">
            We use <strong>Plaid</strong> to securely scan your deposits and detect income from
            Uber, Lyft, DoorDash, Instacart, Fiverr, Upwork, and more. Read-only — we never
            move your money.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => open()}
              disabled={!ready || !linkToken || syncing}
              className="btn-ink disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : ready && linkToken ? 'Connect with Plaid' : 'Loading…'}
            </button>
            <p className="text-xs text-slate">
              Sandbox mode — use test credentials
            </p>
          </div>
        </div>
      </section>

      {/* Sandbox seed + resync (always visible) */}
      <section>
        <div className="card-bordered px-8 py-10">
          <p className="text-mono-label text-slate">Sandbox tools</p>
          <h3 className="mt-3 font-display text-2xl tracking-tight text-ink-black">
            Generate demo income data.
          </h3>
          <p className="mt-3 max-w-xl text-sm text-slate">
            Inject fake gig payouts (Uber, Lyft, DoorDash, Instacart, Upwork, Fiverr, Grubhub)
            spanning the last 13 weeks, then recalculate your score.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSandboxSeed}
              disabled={seeding || active.length === 0}
              className="btn-outline disabled:opacity-50"
            >
              {seeding ? 'Generating…' : 'Seed demo data'}
            </button>
            <button
              onClick={handleResync}
              disabled={syncing || active.length === 0}
              className="btn-outline disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : 'Re-sync transactions'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
