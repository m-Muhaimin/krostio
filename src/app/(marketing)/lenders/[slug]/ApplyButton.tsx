'use client'

import { useState } from 'react'

export default function ApplyButton({ lenderId, label = 'Get pre-qualified →' }: { lenderId: string; label?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/lender-directory/click', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lenderId }),
      })
      if (!res.ok) {
        setError('Could not start application. Try again.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError('Could not start application. Try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="btn-primary w-full disabled:opacity-60"
      >
        {loading ? 'Redirecting…' : label}
      </button>
      {error && <p className="mt-2 text-xs" style={{ color: 'var(--color-coral)' }}>{error}</p>}
    </div>
  )
}
