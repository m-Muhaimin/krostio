'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const redirect = searchParams.get('redirect')
  const planParam = searchParams.get('plan')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // If user came here from a plan CTA, route them straight to billing checkout
    const fallback = planParam ? `/dashboard?plan=${planParam}` : '/dashboard'
    router.push(redirect || fallback)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    const next = planParam ? `/dashboard?plan=${planParam}` : '/dashboard'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback?next=${next}`,
      },
    })

    if (oAuthError) {
      setError(oAuthError.message)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <p className="text-mono-label text-slate">Sign in</p>
          <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
            Welcome back.
          </h1>
          <p className="mt-4 text-body text-slate">
            Sign in to your Krost account to manage your score and share it with lenders.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-sm border border-card-border bg-soft-stone px-4 py-3 text-sm text-ink-black">
            {message}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-mono-label text-slate">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-rect"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-mono-label text-slate">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-rect"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-error-red)' }}>{error}</p>
          )}

          <Button variant="primary" disabled={loading} className="w-full" type="submit">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-hairline" />
          <span className="text-mono-label text-slate">or continue with</span>
          <div className="h-px flex-1 bg-hairline" />
        </div>

        <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>

        <p className="mt-10 text-sm text-slate">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="link-editorial">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
