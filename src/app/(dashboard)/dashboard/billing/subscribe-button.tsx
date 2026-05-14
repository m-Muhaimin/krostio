'use client'

import { useState } from 'react'

export function SubscribeButton({
  priceId,
  label,
  disabled,
}: {
  priceId: string
  label: string
  disabled?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (disabled) return
    setError(null)
    setLoading(true)

    try {
      const endpoint = priceId === 'portal' ? '/api/billing/portal' : '/api/billing/checkout'
      const body = priceId === 'portal' ? undefined : JSON.stringify({ priceId })
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError('Stripe did not return a redirect URL.')
      setLoading(false)
    } catch (err) {
      setError((err as Error).message || 'Network error')
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`btn-primary w-full ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Loading…' : label}
      </button>
      {error && (
        <p className="mt-3 text-xs" style={{ color: 'var(--color-error-red)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
