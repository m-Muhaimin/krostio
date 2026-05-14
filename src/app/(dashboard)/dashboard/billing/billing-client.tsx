'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Auto-starts a Stripe Checkout session when the billing page is loaded with
 * a `?start=worker|lender` hint (set by post-auth redirect from a plan CTA).
 *
 * Runs at most once per page mount, then strips the param from the URL so a
 * back-button doesn't re-trigger checkout.
 */
export function BillingAutoStart({ priceId }: { priceId: string }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    ;(async () => {
      try {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          // Drop the start param so the user sees the plan picker instead of a stuck spinner.
          window.history.replaceState({}, '', '/dashboard/billing')
        }
      } catch {
        window.history.replaceState({}, '', '/dashboard/billing')
      }
    })()
  }, [priceId])

  return (
    <div className="rounded-md border border-hairline bg-soft-stone px-5 py-4 text-sm text-ink">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
        Starting your checkout…
      </div>
    </div>
  )
}

/**
 * Shown after a successful return from Stripe Checkout (`?upgraded=true`).
 * Also nudges a refresh once after a short delay in case the webhook is still
 * landing (Stripe usually fires within a few seconds in test mode).
 */
export function BillingSuccessBanner() {
  const router = useRouter()

  useEffect(() => {
    // Strip the query so reloads don't keep showing the banner.
    const t = setTimeout(() => {
      router.replace('/dashboard/billing')
    }, 4000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div
      className="rounded-md border px-5 py-4 text-sm"
      style={{
        backgroundColor: '#edfce9',
        borderColor: '#cfe9c8',
        color: '#003c33',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-coral" />
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
