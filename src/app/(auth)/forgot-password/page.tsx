'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Something went wrong')
        return
      }
      setSent(true)
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-hairline bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pale-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-black">Check your inbox</h1>
          <p className="mt-2 text-sm text-slate">If an account exists with that email, we&apos;ve sent a password reset link.</p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-coral transition-colors hover:text-soft-coral">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      {formError && (
        <div className="mb-5 rounded-xl border border-card-border bg-soft-stone px-4 py-3.5 text-sm text-ink-black">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-hairline bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-black">Forgot password?</h1>
          <p className="mt-1.5 text-sm text-slate">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        <div className="space-y-3.5">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="input-pill"
          />
        </div>

        <Button type="submit" variant="ink" disabled={loading} className="mt-5 w-full">
          {loading ? 'Sending\u2026' : 'Send reset link'}
        </Button>

        <p className="mt-7 text-center text-sm text-slate">
          <Link href="/login" className="font-medium text-coral transition-colors hover:text-soft-coral">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
