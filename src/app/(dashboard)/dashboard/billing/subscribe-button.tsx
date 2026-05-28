'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PADDLE_CLIENT_TOKEN } from '@/lib/paddle'

let paddleInitialized = false
let paddleInstance: any = null

async function getPaddle() {
  if (paddleInstance) return paddleInstance
  const { initializePaddle } = await import('@paddle/paddle-js')
  paddleInstance = await initializePaddle({
    token: PADDLE_CLIENT_TOKEN,
    environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  })
  paddleInitialized = true
  return paddleInstance
}

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
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    if (typeof window !== 'undefined' && !paddleInitialized) {
      getPaddle().catch(() => {})
    }
  }, [])

  const handleClick = async () => {
    if (disabled) return
    setError(null)
    setLoading(true)

    try {
      const paddle = await getPaddle()
      if (!paddle) {
        setError('Payment system failed to load. Please refresh.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Checkout initialization failed')
        setLoading(false)
        return
      }
      const data = await res.json()

      paddle.Checkout.open(data.settings)
    } catch (err) {
      setError((err as Error).message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`btn-primary w-full text-sm ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
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
