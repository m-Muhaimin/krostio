'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  const defaultRole = planParam === 'lender' ? 'lender' : 'gig_worker'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'gig_worker' | 'lender'>(defaultRole)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Preserve plan intent through email confirmation → login
    const loginParams = new URLSearchParams({
      message: 'Check your email to confirm your account',
    })
    if (planParam) loginParams.set('plan', planParam)
    router.push(`/login?${loginParams.toString()}`)
    router.refresh()
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    // After OAuth, send to a dashboard route that knows the plan intent
    const next = planParam ? `/dashboard?plan=${planParam}` : '/dashboard'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <p className="text-mono-label text-slate">Sign up</p>
          <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
            Create your account.
          </h1>
          <p className="mt-4 text-body text-slate">
            Start building an on-chain credit score from your existing gig-platform earnings.
          </p>
        </div>

        {/* Role toggle — pill-outline segment */}
        <div className="mb-8 inline-flex rounded-full border border-hairline bg-white p-1">
          <button
            onClick={() => setRole('gig_worker')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              role === 'gig_worker'
                ? 'bg-ink-black text-white'
                : 'text-slate hover:text-ink-black'
            }`}
          >
            Gig worker
          </button>
          <button
            onClick={() => setRole('lender')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              role === 'lender'
                ? 'bg-ink-black text-white'
                : 'text-slate hover:text-ink-black'
            }`}
          >
            Lender
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-2 block text-mono-label text-slate">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-rect"
              placeholder="Jane Doe"
              required
            />
          </div>
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
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-error-red)' }}>{error}</p>
          )}

          <Button variant="primary" disabled={loading} className="w-full" type="submit">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-hairline" />
          <span className="text-mono-label text-slate">or continue with</span>
          <div className="h-px flex-1 bg-hairline" />
        </div>

        <Button variant="outline" onClick={handleGoogleSignup} className="w-full">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>

        <p className="mt-10 text-sm text-slate">
          Already have an account?{' '}
          <Link href="/login" className="link-editorial">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
