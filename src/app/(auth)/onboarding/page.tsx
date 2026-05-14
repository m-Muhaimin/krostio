'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'

function OnboardingContent() {
  const router = useRouter()
  // next param reserved for future post-onboarding redirects
  useSearchParams()

  const [role, setRole] = useState<'gig_worker' | 'lender' | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Session expired. Please sign in again.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      name: name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role,
    })

    if (profileError) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role, name: name || user.user_metadata?.full_name || undefined })
        .eq('id', user.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    }

    await supabase.auth.updateUser({
      data: { onboarding_completed: true, role },
    })

    router.push(role === 'lender' ? '/dashboard/lender' : '/dashboard/worker')
    router.refresh()
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-10">
          <p className="text-mono-label text-slate">Onboarding</p>
          <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
            You&apos;re almost in.
          </h1>
          <p className="mt-4 text-body text-slate">
            Tell us about yourself so we can set up the right dashboard.
          </p>
        </div>

        <form onSubmit={handleComplete} className="space-y-10">
          <div>
            <label className="mb-2 block text-mono-label text-slate">
              What should we call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-rect"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-4 block text-mono-label text-slate">
              I&apos;m using Krost as a…
            </label>
            <div className="grid gap-3">
              {[
                { id: 'gig_worker', title: 'Gig worker', body: 'Build a verifiable on-chain credit score from platform earnings.' },
                { id: 'lender', title: 'Lender', body: 'Verify gig-worker income and scores on-chain.' },
              ].map((opt) => {
                const selected = role === (opt.id as 'gig_worker' | 'lender')
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id as 'gig_worker' | 'lender')}
                    className={`flex items-start justify-between gap-6 rounded-md border p-6 text-left transition ${
                      selected
                        ? 'border-ink-black bg-ink-black text-white'
                        : 'border-hairline bg-white hover:border-ink-black'
                    }`}
                  >
                    <div>
                      <p className={`text-mono-label ${selected ? 'text-white/60' : 'text-slate'}`}>
                        {opt.id === 'gig_worker' ? 'Workers' : 'Underwriters'}
                      </p>
                      <h3 className={`mt-2 text-xl font-normal ${selected ? 'text-white' : 'text-ink-black'}`}>
                        {opt.title}
                      </h3>
                      <p className={`mt-2 text-sm ${selected ? 'text-white/65' : 'text-slate'}`}>
                        {opt.body}
                      </p>
                    </div>
                    <div className={`mt-1 h-5 w-5 shrink-0 rounded-full border ${
                      selected ? 'border-white bg-white' : 'border-hairline'
                    }`}>
                      {selected && (
                        <svg viewBox="0 0 20 20" fill="none" className="h-full w-full">
                          <path d="M5 10l3 3 7-7" stroke="#17171c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-error-red)' }}>{error}</p>
          )}

          <Button
            variant="primary"
            disabled={!role || loading}
            className="w-full"
            type="submit"
          >
            {loading ? 'Setting up…' : 'Complete setup'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
