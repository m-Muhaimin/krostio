'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('No verification token provided.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (res.ok) {
          setStatus('verified')
        } else {
          setStatus('error')
          setErrorMsg(data.error || 'Verification failed')
        }
      } catch {
        setStatus('error')
        setErrorMsg('Something went wrong.')
      }
    }

    verify()
  }, [token])

  return (
    <div className="w-full max-w-sm text-center">
      {status === 'verifying' && (
        <div className="rounded-2xl border border-hairline bg-white p-8 shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-soft-stone">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--color-hairline)" strokeWidth="2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-coral)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-black">Verifying&hellip;</h1>
          <p className="mt-2 text-sm text-slate">Please wait while we verify your email.</p>
        </div>
      )}
      {status === 'verified' && (
        <div className="rounded-2xl border border-hairline bg-white p-8 shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pale-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-black">Email verified</h1>
          <p className="mt-2 text-sm text-slate">Your email has been verified successfully.</p>
          <Link href="/dashboard" className="mt-6 inline-block text-sm font-medium text-coral transition-colors hover:text-soft-coral">
            Go to dashboard
          </Link>
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-2xl border border-hairline bg-white p-8 shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-coral-pale">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4M12 16v.5" stroke="#ff7759" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="#ff7759" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-black">Verification failed</h1>
          <p className="mt-2 text-sm text-slate">{errorMsg || 'This link is invalid or expired.'}</p>
          <Link href="/dashboard" className="mt-6 inline-block text-sm font-medium text-coral transition-colors hover:text-soft-coral">
            Go to dashboard
          </Link>
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
