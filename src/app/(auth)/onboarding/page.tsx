'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, Suspense } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Step = 1 | 2 | 3 | 4

const PLATFORMS = [
  { id: 'uber', name: 'Uber', initial: 'U' },
  { id: 'lyft', name: 'Lyft', initial: 'L' },
  { id: 'doordash', name: 'DoorDash', initial: 'D' },
  { id: 'ubereats', name: 'Uber Eats', initial: 'U' },
  { id: 'instacart', name: 'Instacart', initial: 'I' },
  { id: 'fiverr', name: 'Fiverr', initial: 'F' },
  { id: 'upwork', name: 'Upwork', initial: 'U' },
  { id: 'amazon_flex', name: 'Amazon Flex', initial: 'A' },
]

const PROGRESS_STATES = [
  'Connecting to platform…',
  'Downloading earnings history…',
  'Calculating your score…',
]

function StepDots({ step }: { step: Step }) {
  return (
    <div className="mb-10 flex items-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`h-1 w-10 rounded-full transition ${
            n <= step ? 'bg-ink-black' : 'bg-hairline'
          }`}
        />
      ))}
      <span className="ml-3 text-mono-label text-slate">Step {step} of 4</span>
    </div>
  )
}

function StepOne({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <p className="text-mono-label text-slate">Welcome</p>
      <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
        Your gig income, verified.
      </h1>
      <p className="mt-4 text-body text-slate">
        A 30-second tour of what Krostio does for you.
      </p>

      <div className="mt-10 space-y-4">
        {[
          {
            label: '01',
            title: 'Connect your gig platforms via Plaid',
            body: 'Securely link your bank or accounts. Read-only — we never move money.',
          },
          {
            label: '02',
            title: 'Get an income consistency score',
            body: 'Not a credit score. A signal of how steady your earnings are over time.',
          },
          {
            label: '03',
            title: 'Generate lender-ready PDF reports',
            body: 'Hand verified income to landlords, lenders, or anyone who needs proof.',
          },
        ].map((v) => (
          <div key={v.label} className="card-bordered flex gap-5 px-6 py-5">
            <span className="text-mono-label text-coral">{v.label}</span>
            <div>
              <h3 className="text-sm font-medium text-ink-black">{v.title}</h3>
              <p className="mt-1 text-sm text-slate">{v.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Button variant="primary" className="w-full" onClick={onNext}>
          Next →
        </Button>
      </div>
    </div>
  )
}

function StepTwo({
  onConnected,
  onSkip,
}: {
  onConnected: () => void
  onSkip: () => void
}) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exchanging, setExchanging] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function getToken() {
      try {
        const res = await fetch('/api/plaid/link-token', { method: 'POST' })
        const json = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(json.error || 'Failed to initialize Plaid')
          return
        }
        setLinkToken(json.link_token)
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Plaid init failed')
      }
    }
    getToken()
    return () => {
      cancelled = true
    }
  }, [])

  const onSuccess = useCallback(
    async (public_token: string, metadata: any) => {
      setExchanging(true)
      setError(null)
      try {
        const res = await fetch('/api/plaid/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token,
            institution: metadata?.institution
              ? {
                  name: metadata.institution.name,
                  institution_id: metadata.institution.institution_id,
                }
              : undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || 'Failed to connect')
          setExchanging(false)
          return
        }
        onConnected()
      } catch (err: any) {
        setError(err?.message ?? 'Exchange failed')
        setExchanging(false)
      }
    },
    [onConnected]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  })

  return (
    <div>
      <p className="text-mono-label text-slate">Connect</p>
      <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
        Pick a platform.
      </h1>
      <p className="mt-4 text-body text-slate">
        Connect your bank via Plaid and we&apos;ll auto-detect deposits from the gig
        platforms below.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {PLATFORMS.map((p) => (
          <div
            key={p.id}
            className="card-bordered flex flex-col items-center gap-2 px-4 py-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-ink-black text-sm font-medium text-white">
              {p.initial}
            </div>
            <p className="text-xs text-ink-black">{p.name}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm" style={{ color: 'var(--color-error-red)' }}>
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center gap-6">
        <Button
          variant="primary"
          onClick={() => open()}
          disabled={!ready || !linkToken || exchanging}
          className="flex-1"
        >
          {exchanging
            ? 'Connecting…'
            : ready && linkToken
            ? 'Connect with Plaid'
            : 'Loading…'}
        </Button>
        <button
          onClick={onSkip}
          className="text-sm text-slate underline-offset-4 hover:underline"
        >
          Skip for now
        </button>
      </div>

      <p className="mt-4 text-xs text-slate">
        {process.env.NEXT_PUBLIC_PLAID_ENV !== 'production' &&
          'Sandbox mode — use test bank credentials.'}
      </p>
    </div>
  )
}

function StepThree({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (progress >= PROGRESS_STATES.length) {
      const t = setTimeout(onDone, 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setProgress((p) => p + 1), 2000)
    return () => clearTimeout(t)
  }, [progress, onDone])

  return (
    <div>
      <p className="text-mono-label text-slate">Processing</p>
      <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
        Pulling your income data…
      </h1>
      <p className="mt-4 text-body text-slate">
        Hang tight — this takes just a few seconds.
      </p>

      <div className="mt-14 flex flex-col items-center gap-8">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
        <div className="w-full space-y-3">
          {PROGRESS_STATES.map((label, idx) => {
            const done = idx < progress
            const active = idx === progress
            return (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-md border px-5 py-4 transition ${
                  done || active
                    ? 'border-ink-black bg-white'
                    : 'border-hairline bg-white opacity-50'
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    done
                      ? 'border-ink-black bg-ink-black'
                      : active
                      ? 'border-ink-black'
                      : 'border-hairline'
                  }`}
                >
                  {done && (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        d="M5 10l3 3 7-7"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {active && (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-ink-black" />
                  )}
                </div>
                <p
                  className={`text-sm ${
                    done || active ? 'text-ink-black' : 'text-slate'
                  }`}
                >
                  {label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

type Summary = {
  annualized: number | null
  score: number | null
  platforms: number
}

function StepFour({
  summary,
  finishing,
  onFinish,
}: {
  summary: Summary
  finishing: boolean
  onFinish: (destination: string) => void
}) {
  const fmt = (n: number | null) =>
    n === null
      ? '—'
      : n.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })

  return (
    <div>
      <p className="text-mono-label text-coral">All set</p>
      <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
        Here&apos;s what we found.
      </h1>
      <p className="mt-4 text-body text-slate">
        A snapshot of your verified income. Upgrade to download a PDF report.
      </p>

      <div className="card-stone mt-10 px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-mono-label text-slate">Annualized income</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-ink-black">
              {summary.annualized === null ? '—' : fmt(summary.annualized)}
            </p>
          </div>
          <div>
            <p className="text-mono-label text-slate">Consistency score</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-ink-black">
              {summary.score === null ? 'pending' : `${summary.score}/100`}
            </p>
          </div>
          <div>
            <p className="text-mono-label text-slate">Platforms connected</p>
            <p className="mt-3 font-display text-3xl tracking-tight text-ink-black">
              {summary.platforms}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 md:flex-row">
        <button
          onClick={() => onFinish('/dashboard/billing?start=one-time')}
          disabled={finishing}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {finishing ? 'Saving…' : 'Generate Report — $9'}
        </button>
        <button
          onClick={() => onFinish('/dashboard/worker')}
          disabled={finishing}
          className="btn-pill-outline flex-1 disabled:opacity-50"
        >
          Go to Dashboard →
        </button>
      </div>

      <p className="mt-5 text-xs text-slate">
        Free plan: see income summary. Upgrade for PDF reports.
      </p>

      <p className="mt-3 text-xs text-slate">
        Not a worker?{' '}
        <Link href="/dashboard/lender" className="underline">
          Continue as lender
        </Link>
      </p>
    </div>
  )
}

function OnboardingContent() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [summary, setSummary] = useState<Summary>({
    annualized: null,
    score: null,
    platforms: 0,
  })
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch real summary data after processing step completes.
  const loadSummary = useCallback(async () => {
    try {
      const [connRes, scoreRes] = await Promise.all([
        fetch('/api/gig-platforms').then((r) => r.json()).catch(() => null),
        fetch('/api/score').then((r) => r.json()).catch(() => null),
      ])
      const platforms =
        (connRes?.connections ?? []).filter((c: any) => c.is_active).length || 0
      const score =
        scoreRes?.score?.consistency_score ??
        scoreRes?.consistency_score ??
        null
      const annualized =
        scoreRes?.score?.annualized_income ??
        scoreRes?.annualized_income ??
        null
      setSummary({ platforms, score, annualized })
    } catch {
      // Best-effort; keep placeholders.
    }
  }, [])

  // Ensure profile exists with gig_worker role (this wizard targets workers).
  const ensureProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'User'
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      name,
      role: 'gig_worker',
    })
    if (insertError) {
      // Likely already exists — try update to ensure role is set.
      await supabase
        .from('profiles')
        .update({ role: 'gig_worker' })
        .eq('id', user.id)
        .is('role', null)
    }
    return user
  }, [supabase])

  useEffect(() => {
    ensureProfile()
  }, [ensureProfile])

  const goToStepThree = () => setStep(3)
  const skipToStepFour = () => setStep(4)

  const handleStepThreeDone = useCallback(async () => {
    await loadSummary()
    setStep(4)
  }, [loadSummary])

  const finishOnboarding = useCallback(
    async (destination: string) => {
      setFinishing(true)
      setError(null)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { onboarding_completed: true, role: 'gig_worker' },
      })
      if (updateError) {
        setError(updateError.message)
        setFinishing(false)
        return
      }
      router.push(destination)
      router.refresh()
    },
    [router, supabase]
  )

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <StepDots step={step} />

        {error && (
          <div
            className="mb-6 rounded-md border px-5 py-4 text-sm"
            style={{
              borderColor: 'var(--color-error-red)',
              color: 'var(--color-error-red)',
            }}
          >
            {error}
          </div>
        )}

        {step === 1 && <StepOne onNext={() => setStep(2)} />}
        {step === 2 && (
          <StepTwo onConnected={goToStepThree} onSkip={skipToStepFour} />
        )}
        {step === 3 && <StepThree onDone={handleStepThreeDone} />}
        {step === 4 && (
          <StepFour
            summary={summary}
            finishing={finishing}
            onFinish={finishOnboarding}
          />
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  )
}
