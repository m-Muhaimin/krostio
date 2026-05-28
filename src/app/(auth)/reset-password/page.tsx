'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Failed to reset password')
        return
      }
      setDone(true)
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-hairline bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-coral-pale">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4M12 16v.5" stroke="#ff7759" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="#ff7759" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-black">Invalid link</h1>
          <p className="mt-2 text-sm text-slate">This password reset link is invalid or expired.</p>
          <Link href="/forgot-password" className="mt-6 inline-block text-sm font-medium text-coral transition-colors hover:text-soft-coral">
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-hairline bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pale-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-black">Password reset</h1>
          <p className="mt-2 text-sm text-slate">Your password has been updated successfully.</p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-coral transition-colors hover:text-soft-coral">
            Sign in with your new password
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
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-black">Choose a new password</h1>
          <p className="mt-1.5 text-sm text-slate">Must be at least 8 characters.</p>
        </div>

        <div className="space-y-3.5">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            className="input-pill"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="input-pill"
          />
        </div>

        <Button type="submit" variant="ink" disabled={loading} className="mt-5 w-full">
          {loading ? 'Resetting\u2026' : 'Reset password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
