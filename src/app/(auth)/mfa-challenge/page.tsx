'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function MfaChallengePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/auth/mfa/status', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.mfa_enabled) router.replace('/login')
        else setChecking(false)
      })
      .catch(() => { setChecking(false) })
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/mfa/validate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
        credentials: 'include',
      })

      if (res.redirected) {
        window.location.href = res.url
        return
      }

      const data = await res.json()
      setError(data.error || 'Invalid code. Try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      {error && (
        <div className="mb-5 rounded-xl border border-card-border bg-soft-stone px-4 py-3.5 text-sm text-ink-black">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-hairline bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pale-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--color-action-blue)" strokeWidth="1.8" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="var(--color-action-blue)" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="15" r="1.5" fill="var(--color-action-blue)" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-black">Two-factor authentication</h1>
          <p className="mt-1.5 text-sm text-slate">Enter the 6-digit code from your authenticator app.</p>
        </div>

        <div className="space-y-3.5">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000 000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            className="input-pill text-center text-2xl tracking-[0.3em] font-mono"
            autoFocus
          />
        </div>

        <Button type="submit" variant="ink" disabled={loading || code.length !== 6} className="mt-5 w-full">
          {loading ? 'Verifying\u2026' : 'Verify'}
        </Button>
      </form>
    </div>
  )
}
