'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export function BillingAutoStart({ priceId }: { priceId: string }) {
  const fired = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    ;(async () => {
      try {
        const { initializePaddle } = await import('@paddle/paddle-js')
        const paddle = await initializePaddle({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
          environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
        })
        if (!paddle) {
          window.history.replaceState({}, '', '/dashboard/billing')
          return
        }
        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            successUrl: `${window.location.origin}/dashboard/billing?upgraded=true`,
          },
        })
      } catch {
        window.history.replaceState({}, '', '/dashboard/billing')
      }
    })()
  }, [priceId])

  return (
    <div className="rounded-lg border border-hairline bg-soft-stone px-5 py-4 text-sm text-ink-black mb-4">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
        Starting your checkout…
      </div>
    </div>
  )
}

export function BillingSuccessBanner() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/dashboard/billing')
    }, 4000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div
      className="rounded-lg border px-5 py-4 text-sm mb-4"
      style={{
        backgroundColor: 'var(--color-pale-green)',
        borderColor: '#cfe9c8',
        color: 'var(--color-deep-green)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-coral shrink-0" />
        <div>
          <p className="font-medium">You&apos;re subscribed.</p>
          <p className="mt-1 text-xs opacity-80">
            Your plan is being activated. If it still shows as Free in a few seconds,
            refresh the page.
          </p>
        </div>
      </div>
    </div>
  )
}
