'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePlaidLink } from 'react-plaid-link'

function hasOAuthParams(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.has('oauth_token_id') || params.has('oauth_state_id')
}

type Connection = {
  id: string
  platform: string
  institution_name: string | null
  is_active: boolean
  last_sync_at: string | null
  provider: string | null
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
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<{
    platforms: string[]
    records: number
    score: number | null
  } | null>(null)

  const [mfaRequired, setMfaRequired] = useState(false)
  const [showMfaModal, setShowMfaModal] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState('')
  const [mfaVerifying, setMfaVerifying] = useState(false)
  const stepupTokenRef = useRef<string | null>(null)

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

  useEffect(() => {
    fetch('/api/auth/mfa/status', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.mfa_enabled) setMfaRequired(true) })
      .catch(() => {})
  }, [])

  const oauthRedirect = useRef(hasOAuthParams() ? window.location.href : undefined)

  useEffect(() => {
    if (oauthRedirect.current) return
    let cancelled = false
    async function getToken() {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (stepupTokenRef.current) headers['x-mfa-stepup'] = stepupTokenRef.current
        const res = await fetch('/api/plaid/link-token', { method: 'POST', headers })
        const json = await res.json()
        if (cancelled) return
        if (json.mfa_required) {
          setMfaRequired(true)
          return
        }
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
    return () => { cancelled = true }
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
              ? { name: metadata.institution.name, institution_id: metadata.institution.institution_id }
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
    ...(oauthRedirect.current ? { receivedRedirectUri: oauthRedirect.current } : {}),
  })

  const handleMfaVerify = async () => {
    setMfaError('')
    setMfaVerifying(true)
    try {
      const res = await fetch('/api/auth/mfa/verify-stepup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mfaCode }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) { setMfaError(data.error || 'Verification failed'); return }
      stepupTokenRef.current = data.stepupToken
      setShowMfaModal(false)
      setMfaCode('')

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      headers['x-mfa-stepup'] = data.stepupToken as string
      const tokenRes = await fetch('/api/plaid/link-token', { method: 'POST', headers })
      const tokenJson = await tokenRes.json()
      if (tokenRes.ok && tokenJson.link_token) {
        setLinkToken(tokenJson.link_token)
      } else {
        setError('Failed to initialize Plaid after verification')
      }
    } catch { setMfaError('Something went wrong') }
    finally { setMfaVerifying(false) }
  }

  const handlePlaidClick = () => {
    if (mfaRequired && !stepupTokenRef.current) {
      setShowMfaModal(true)
      return
    }
    open()
  }

  const disconnect = async (platform: string) => {
    setConnections((prev) => prev.filter((c) => c.platform !== platform))
  }

  const active = connections.filter((c) => c.is_active)

  return (
    <div className="fade-in d2">
      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 18px', marginBottom: 16,
          background: 'var(--color-error-bg)', borderRadius: 'var(--radius-md)',
        }}>
          <div className="alert-icon ai-coral">!</div>
          <div className="flex-1 min-w-0">
            <p className="alert-title">Error</p>
            <p className="alert-desc">{error}</p>
          </div>
        </div>
      )}

      {/* Sync result banner */}
      {lastResult && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 18px', marginBottom: 16,
          background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)',
        }}>
          <div className="alert-icon ai-success">&check;</div>
          <div className="flex-1 min-w-0">
            <p className="alert-title">Sync complete</p>
            <p className="alert-desc">
              Added {lastResult.records} record{lastResult.records === 1 ? '' : 's'} across{' '}
              {lastResult.platforms.length} platform{lastResult.platforms.length === 1 ? '' : 's'}
              {lastResult.score !== null && (
                <> &middot; Consistency score: <strong>{lastResult.score}</strong>/100</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Plaid trust banner */}
      <div className="plaid-trust">
        <div className="pt-icon">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect x="3" y="11" width="20" height="13" rx="3" stroke="var(--action-blue)" strokeWidth="2" />
            <path d="M8 11V8a5 5 0 0110 0v3" stroke="var(--action-blue)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="13" cy="17" r="2" fill="var(--action-blue)" />
          </svg>
        </div>
        <div>
          <div className="pt-title">Secured by Plaid — the same standard banks use</div>
          <div className="pt-sub">
            Your login credentials are never stored or seen by Krostio. Plaid uses OAuth to connect securely to 12,000+ financial institutions. Disconnect any account instantly.
          </div>
        </div>
        <div className="badge badge-blue" style={{ flexShrink: 0 }}>Bank-grade security</div>
      </div>

      {/* Connected platforms */}
      <div style={{ marginTop: 20, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--color-ink-black)' }}>
            Connected platforms
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-muted-slate)', marginLeft: 8 }}>
              {active.length} active
            </span>
          </p>
          <button
            onClick={handlePlaidClick}
            disabled={!ready || !linkToken || syncing}
            className="cc-btn cc-btn-connect"
            style={{ width: 'auto', padding: '10px 24px' }}
          >
            {syncing ? 'Syncing\u2026' : ready && linkToken ? 'Connect with Plaid' : 'Loading\u2026'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--color-muted-slate)' }}>Loading connections&hellip;</p>
        </div>
      ) : active.length === 0 ? (
        <div className="conn-grid">
          {Object.entries(PLATFORM_LABELS).map(([key, val]) => (
            <div key={key} className="conn-card" style={{ opacity: 0.45, cursor: 'default' }}>
              <div className="cc-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="cc-logo" style={{ fontSize: 20 }}>{val.initial}</div>
                  <div>
                    <div className="cc-name">{val.name}</div>
                    <div className="cc-cat">Gig economy</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted-slate)', lineHeight: 1.5 }}>
                Detected automatically when you connect your bank via Plaid.
              </div>
            </div>
          ))}
          <div className="conn-card" style={{
            border: '1.5px dashed var(--color-hairline)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: 32, cursor: 'pointer',
          }} onClick={handlePlaidClick}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--color-soft-stone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-muted-slate)' }}>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="cc-name" style={{ textAlign: 'center' }}>Add connection</div>
              <div className="cc-cat" style={{ textAlign: 'center' }}>Connect your bank to detect gig income automatically</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handlePlaidClick() }}
              disabled={!ready || !linkToken}
              className="cc-btn cc-btn-connect"
              style={{ width: 'auto', padding: '10px 24px' }}
            >
              {ready && linkToken ? 'Connect with Plaid' : 'Loading\u2026'}
            </button>
          </div>
        </div>
      ) : (
        <div className="conn-grid">
          {Object.entries(PLATFORM_LABELS).map(([key, val]) => {
            const conn = active.find(c => c.platform === key)
            const isConnected = !!conn
            return (
              <div key={key} className={`conn-card${isConnected ? ' connected' : ''}`} style={!isConnected ? { opacity: 0.45, cursor: 'default' } : undefined}>
                <div className="cc-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="cc-logo" style={{ fontSize: 20 }}>{val.initial}</div>
                    <div>
                      <div className="cc-name">{val.name}</div>
                      <div className="cc-cat">
                        {isConnected ? (conn.institution_name || conn.provider || 'Plaid') : 'Gig economy'}
                      </div>
                    </div>
                  </div>
                  {isConnected && (
                    <span className="badge badge-green">Active</span>
                  )}
                </div>
                {isConnected ? (
                  <div className="cc-stat-row">
                    <div>
                      <div className="cc-stat-label">Sync</div>
                      <div className="cc-stat-val">{formatSync(conn.last_sync_at)}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--color-muted-slate)', lineHeight: 1.5, marginBottom: 16 }}>
                    Detected automatically when you connect your bank via Plaid.
                  </div>
                )}
                {isConnected && (
                  <button
                    onClick={() => disconnect(conn.platform)}
                    className="cc-btn cc-btn-connected"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--color-error-bg)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--color-error-red)'
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(220,38,38,.2)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = ''
                      ;(e.currentTarget as HTMLElement).style.color = ''
                      ;(e.currentTarget as HTMLElement).style.borderColor = ''
                    }}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            )
          })}
          <div className="conn-card" style={{
            border: '1.5px dashed var(--color-hairline)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: 32, cursor: 'pointer',
          }} onClick={handlePlaidClick}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--color-soft-stone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-muted-slate)' }}>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="cc-name" style={{ textAlign: 'center' }}>Add connection</div>
              <div className="cc-cat" style={{ textAlign: 'center' }}>Connect your bank to detect gig income automatically</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handlePlaidClick() }}
              disabled={!ready || !linkToken}
              className="cc-btn cc-btn-connect"
              style={{ width: 'auto', padding: '10px 24px' }}
            >
              {ready && linkToken ? 'Connect with Plaid' : 'Loading\u2026'}
            </button>
          </div>
        </div>
      )}

      {/* MFA challenge modal */}
      {showMfaModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600 }}>Two-factor authentication</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-muted-slate)' }}>Enter the code from your authenticator app to continue.</p>
            {mfaError && <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--color-error-red)' }}>{mfaError}</p>}
            <input
              type="text"
              inputMode="numeric"
              placeholder="000 000"
              value={mfaCode}
              onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ width: '100%', textAlign: 'center', fontSize: 24, letterSpacing: '0.3em', fontFamily: 'var(--font-mono)', padding: '12px 16px', border: '1px solid var(--color-hairline)', borderRadius: 12, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowMfaModal(false); setMfaCode(''); setMfaError('') }}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 40, border: '1px solid var(--color-hairline)', background: '#fff', fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleMfaVerify}
                disabled={mfaCode.length !== 6 || mfaVerifying}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 40, border: 'none', background: 'var(--color-ink-black)', color: '#fff', fontSize: 13, cursor: mfaCode.length === 6 ? 'pointer' : 'default', opacity: mfaCode.length === 6 ? 1 : 0.5 }}
              >
                {mfaVerifying ? 'Verifying\u2026' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
