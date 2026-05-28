'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePlaidLink } from 'react-plaid-link'

function hasOAuthParams(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.has('oauth_token_id') || params.has('oauth_state_id')
}

export function ConnectPlaidButton({
  variant = 'primary',
  label = 'Connect a Platform',
  className,
}: {
  variant?: 'primary' | 'hero'
  label?: string
  className?: string
}) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const oauthRedirect = useRef(hasOAuthParams() ? window.location.href : undefined)

  useEffect(() => {
    if (oauthRedirect.current) return
    let cancelled = false
    fetch('/api/plaid/link-token', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(r => r.json())
      .then(json => { if (!cancelled) setLinkToken(json.link_token) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const onSuccess = useCallback(async (public_token: string, metadata: any) => {
    setSyncing(true)
    setError(null)
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
      if (!res.ok) { setError(json.error || 'Failed to connect'); return }
      window.location.reload()
    } catch {
      setError('Connection failed')
    } finally {
      setSyncing(false)
    }
  }, [])

  const { open, ready } = usePlaidLink({
    token: linkToken || undefined,
    onSuccess,
    ...(oauthRedirect.current ? { receivedRedirectUri: oauthRedirect.current } : {}),
  })

  if (error) {
    return <span style={{ color: 'var(--color-error-red)', fontSize: 12 }}>{error}</span>
  }

  const isDisabled = !ready || !linkToken || syncing
  const btnLabel = syncing ? 'Connecting\u2026' : ready && linkToken ? label : 'Loading\u2026'

  if (variant === 'hero') {
    return (
      <button
        onClick={() => open()}
        disabled={isDisabled}
        className={`btn-primary${className ? ` ${className}` : ''}`}
        style={{ fontSize: 14, padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {btnLabel}
      </button>
    )
  }

  return (
    <button
      onClick={() => open()}
      disabled={isDisabled}
      className={`${className || 'btn-primary'}`}
      style={{ padding: '9px 20px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 7 }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {btnLabel}
    </button>
  )
}
