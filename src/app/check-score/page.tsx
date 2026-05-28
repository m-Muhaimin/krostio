'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brand-logo'

/* ─────────────────────────────────── Types ──────────────────────────────── */

type Step = 'landing' | 'connecting' | 'result' | 'email' | 'saved'

interface PlatformInfo {
  id: string
  label: string
  color: string
}

/* ──────────────────────────── Platform catalog ──────────────────────────── */

const PLATFORMS: PlatformInfo[] = [
  { id: 'uber', label: 'Uber', color: 'bg-black' },
  { id: 'doordash', label: 'DoorDash', color: 'bg-red-600' },
  { id: 'lyft', label: 'Lyft', color: 'bg-purple-600' },
  { id: 'instacart', label: 'Instacart', color: 'bg-green-500' },
  { id: 'upwork', label: 'Upwork', color: 'bg-green-700' },
  { id: 'fiverr', label: 'Fiverr', color: 'bg-gray-800' },
  { id: 'grubhub', label: 'Grubhub', color: 'bg-orange-500' },
  { id: 'amazonflex', label: 'Amazon Flex', color: 'bg-amber-600' },
]

/* ──────────────────────── Score simulation logic ────────────────────────── */

const FACTORS = [
  { key: 'stability', label: 'Income Stability', weight: '30%', icon: '📊' },
  { key: 'income', label: 'Average Monthly Income', weight: '25%', icon: '💰' },
  { key: 'diversity', label: 'Platform Diversity', weight: '20%', icon: '🔄' },
  { key: 'tenure', label: 'Tenure & Consistency', weight: '15%', icon: '📅' },
  { key: 'trajectory', label: 'Earnings Trajectory', weight: '10%', icon: '📈' },
]

function generateScore(platformId: string): {
  score: number
  breakdown: { key: string; value: number; max: number }[]
  monthlyIncome: number
  platforms: number
  tenureMonths: number
  trend: 'Growing' | 'Stable' | 'Declining'
} {
  const baseScore = 580 + Math.floor(Math.random() * 180)
  const stability = 60 + Math.floor(Math.random() * 35)
  const incomePt = 65 + Math.floor(Math.random() * 30)
  const diversity = 50 + Math.floor(Math.random() * 40)
  const tenure = 55 + Math.floor(Math.random() * 35)
  const trajectory = 60 + Math.floor(Math.random() * 30)
  const trends: ('Growing' | 'Stable' | 'Declining')[] = ['Growing', 'Growing', 'Stable', 'Stable', 'Declining']
  const trend = trends[Math.floor(Math.random() * trends.length)]

  return {
    score: Math.min(850, Math.max(300, baseScore)),
    breakdown: [
      { key: 'stability', value: stability, max: 100 },
      { key: 'income', value: incomePt, max: 100 },
      { key: 'diversity', value: diversity, max: 100 },
      { key: 'tenure', value: tenure, max: 100 },
      { key: 'trajectory', value: trajectory, max: 100 },
    ],
    monthlyIncome: 3200 + Math.floor(Math.random() * 3600),
    platforms: 2 + Math.floor(Math.random() * 3),
    tenureMonths: 6 + Math.floor(Math.random() * 24),
    trend,
  }
}

/* ──────────────────────────────── Score ring SVG ───────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const r = 72
  const circumference = 2 * Math.PI * r
  const [animatedOffset, setAnimatedOffset] = useState(circumference)

  const normalizedScore = Math.max(300, Math.min(850, score))
  const fraction = (normalizedScore - 300) / 550
  const targetOffset = circumference * (1 - fraction)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(targetOffset), 100)
    return () => clearTimeout(timer)
  }, [targetOffset])

  let tier: { label: string; color: string; textColor: string }
  if (score >= 750) { tier = { label: 'Elite', color: '#003c33', textColor: '#003c33' }
  } else if (score >= 680) { tier = { label: 'Strong', color: '#1863dc', textColor: '#1863dc' }
  } else if (score >= 580) { tier = { label: 'Building', color: '#e6a700', textColor: '#b8860b' }
  } else { tier = { label: 'Emerging', color: '#b30000', textColor: '#b30000' } }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="180" height="180" viewBox="0 0 180 180" className="drop-shadow-sm">
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="#f2f2f2"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={tier.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text
          x="90" y="78"
          textAnchor="middle"
          fontFamily="Space Grotesk, Inter, sans-serif"
          fontSize="40"
          fontWeight="500"
          fill="#17171c"
        >
          {score}
        </text>
        <text
          x="90" y="102"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="12"
          fill="#75758a"
        >
          Krostio Score
        </text>
        <text
          x="90" y="122"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fill={tier.textColor}
          fontWeight="500"
        >
          {tier.label}
        </text>
      </svg>
      <div className="flex items-center gap-1 text-xs text-muted-slate">
        <span>300</span>
        <span className="h-px w-12 bg-hairline" />
        <span>850</span>
      </div>
    </div>
  )
}

/* ──────────────────────────── Factor bar component ─────────────────────── */

function FactorBar({ label, value, max, weight, icon }: { label: string; value: number; max: number; weight: string; icon: string }) {
  const pct = (value / max) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 text-center text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm text-ink truncate">{label}</span>
          <span className="text-xs text-slate shrink-0 ml-2">{value}/{max}</span>
        </div>
        <div className="h-1.5 rounded-full bg-soft-stone overflow-hidden">
          <div
            className="h-full rounded-full bg-ink-black"
            style={{ width: `${pct}%`, transition: 'width 1s ease-in-out' }}
          />
        </div>
      </div>
      <span className="text-xs text-muted-slate w-8 text-right shrink-0">{weight}</span>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   CheckScorePage — lead magnet with state machine
   ────────────────────────────────────────────────────────────────────────── */

export default function CheckScorePage() {
  const [step, setStep] = useState<Step>('landing')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<string>('')
  const [result, setResult] = useState<ReturnType<typeof generateScore> | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'gig_worker' | 'lender'>('gig_worker')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [connectionProgress, setConnectionProgress] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleConnect = useCallback((platformId: string, label: string) => {
    setSelectedPlatform(platformId)
    setSelectedLabel(label)
    setStep('connecting')
    setConnectionProgress(0)

    // Simulate progressive connection animation
    const interval = setInterval(() => {
      setConnectionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.floor(Math.random() * 15) + 5
      })
    }, 150)

    // After 1.5-2s, generate score and transition to result
    const delay = 1600 + Math.floor(Math.random() * 600)
    setTimeout(() => {
      clearInterval(interval)
      setConnectionProgress(100)
      setTimeout(() => {
        const res = generateScore(platformId)
        setResult(res)
        setStep('result')
        // Scroll result into view
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200)
        // Auto-show breakdown after score appears
        setTimeout(() => setShowBreakdown(true), 800)
      }, 300)
    }, delay)
  }, [])

  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          score: result?.score ?? null,
          platform: selectedPlatform ?? undefined,
          role,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('saved')
      } else {
        setSubmitError(data.error || 'Something went wrong.')
      }
    } catch {
      setSubmitError('Could not reach server. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }, [email, name, role, result, selectedPlatform])

  /* ── Landing step: platform grid ── */
  if (step === 'landing') {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center mb-12">
            <p className="text-mono-label text-slate mb-4">
              <span className="eyebrow-dot" />Free score check
            </p>
            <h1 className="text-heading-section mb-4">
              See your gig worker income consistency score — for free
            </h1>
            <p className="text-body-lg text-slate max-w-xl mx-auto">
              Pick a platform you work on. We&apos;ll estimate your Krostio Score
              based on how real gig workers with similar profiles score.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleConnect(p.id, p.label)}
                className="btn-pill-outline flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium"
              >
                <span className={`w-3 h-3 rounded-full ${p.color}`} />
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-slate text-center mt-8">
            No signup or credit card required. Your data is encrypted and never shared.
          </p>
        </div>
      </PageShell>
    )
  }

  /* ── Connecting step: loading animation ── */
  if (step === 'connecting') {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="card-stone">
            {/* Spinning indicator */}
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20">
                <svg className="animate-spin w-20 h-20" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#d9d9dd" strokeWidth="6" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#17171c" strokeWidth="6"
                    strokeDasharray="188" strokeDashoffset="60" strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.3s' }}
                  />
                </svg>
                <span className={`w-4 h-4 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${PLATFORMS.find(p => p.id === selectedPlatform)?.color || 'bg-ink-black'}`} />
              </div>
            </div>

            <p className="text-heading-feature mb-2">Connecting to {selectedLabel}...</p>
            <p className="text-sm text-slate mb-6">Analyzing your earnings profile</p>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-white overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full rounded-full bg-deep-green"
                style={{ width: `${Math.min(100, connectionProgress)}%`, transition: 'width 0.15s linear' }}
              />
            </div>
            <p className="text-xs text-muted-slate mt-3">
              Simulating score from aggregated platform data
            </p>
          </div>
        </div>
      </PageShell>
    )
  }

  /* ── Result step: score ring + breakdown + email CTA ── */
  if (step === 'result' && result) {
    return (
      <PageShell>
        <div ref={resultRef} className="mx-auto max-w-2xl px-6 py-24">
          {/* Score card */}
          <div className="card-bordered p-8 md:p-12 mb-8" style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.06)' }}>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <ScoreRing score={result.score} />
              <div className="flex-1 text-center md:text-left">
                <p className="text-mono-label text-slate mb-1">Your estimated Krostio Score</p>
                <p className="text-body-lg text-ink mt-2 leading-relaxed">
                  Based on earnings patterns from {result.platforms} platform{result.platforms > 1 ? 's' : ''} over {result.tenureMonths} months, your estimated income consistency score is <strong>{result.score}</strong>.
                </p>
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  <span className="chip-coral-outline text-xs">~${result.monthlyIncome.toLocaleString()}/mo</span>
                  <span className="chip-coral-outline text-xs">{result.trend} {result.trend === 'Growing' ? '↑' : result.trend === 'Stable' ? '→' : '↓'}</span>
                  <span className="chip-coral-outline text-xs">{result.platforms} platform{result.platforms > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Factor breakdown — animated in */}
          <div
            className={`transition-all duration-700 ease-in-out overflow-hidden ${showBreakdown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ maxHeight: showBreakdown ? '600px' : '0' }}
          >
            <div className="card-bordered p-6 md:p-8 mb-8">
              <p className="text-mono-label text-slate mb-6">Score factors</p>
              <div className="space-y-5">
                {FACTORS.map((f) => {
                  const bd = result.breakdown.find(b => b.key === f.key)
                  return (
                    <FactorBar
                      key={f.key}
                      label={f.label}
                      value={bd?.value ?? 50}
                      max={bd?.max ?? 100}
                      weight={f.weight}
                      icon={f.icon}
                    />
                  )
                })}
              </div>
              <div className="rule-hairline mt-6 pt-4">
                <p className="text-xs text-muted-slate">
                  Based on aggregated earnings patterns of gig workers with similar profiles.
                  <Link href="/learn" className="link-editorial ml-1">Learn how scoring works →</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Email capture */}
          <div className="card-bordered p-6 md:p-8 bg-soft-stone">
            <h3 className="text-heading-feature mb-2">Save your score — get early access</h3>
            <p className="text-sm text-slate mb-6">
              Create a profile to track your score, connect your real platforms, and get verified.
              Beta testers get free access to premium features.
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input-pill flex-1"
                  autoComplete="email"
                />
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-pill flex-1"
                  autoComplete="name"
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="gig_worker"
                    checked={role === 'gig_worker'}
                    onChange={() => setRole('gig_worker')}
                    className="accent-ink-black"
                  />
                  <span className="text-sm text-ink">I&apos;m a gig worker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="lender"
                    checked={role === 'lender'}
                    onChange={() => setRole('lender')}
                    className="accent-ink-black"
                  />
                  <span className="text-sm text-ink">I&apos;m a lender</span>
                </label>
              </div>
              {submitError && (
                <p className="text-sm text-error-red">{submitError}</p>
              )}
              <div className="flex items-center gap-4 pt-2">
                <button type="submit" disabled={submitting || !email.trim()} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save my score →'}
                </button>
                <Link href="/register" className="text-sm link-editorial">
                  Skip & sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </PageShell>
    )
  }

  /* ── Saved confirmation step ── */
  if (step === 'saved') {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="card-stone">
            <div className="w-16 h-16 rounded-full bg-deep-green mx-auto mb-6 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-heading-feature mb-2">You&apos;re on the list!</h2>
            <p className="text-sm text-slate mb-6">
              We&apos;ll send your score to <strong>{email}</strong> and keep you updated on our launch.
              Beta testers get priority access and premium features free.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/register" className="btn-primary">
                Create your full profile →
              </Link>
              <Link href="/" className="text-sm link-editorial">
                Back to home
              </Link>
            </div>
            {/* Social share */}
            <div className="rule-hairline mt-8 pt-6">
              <p className="text-xs text-muted-slate mb-3">Share your score</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My gig worker income consistency score is ${result?.score}! Check yours free →`)}&url=${encodeURIComponent('https://krost.xyz/check-score')}`, '_blank')}
                  className="btn-pill-outline text-xs"
                >
                  Share on X
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(`My gig worker income consistency score is ${result?.score}! Check yours free → https://krost.xyz/check-score`)}
                  className="btn-pill-outline text-xs"
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  return null
}

/* ──────────────────────── Shared page shell ───────────────────────────── */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      {/* Nav bar */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="default" />
            <span className="font-display text-[17px] font-medium tracking-tight text-ink-black">
              Krostio
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-nav text-ink hover:text-ink-black">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      {/* Minimal footer */}
      <footer className="border-t border-hairline px-6 py-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p className="text-xs text-muted-slate">
            &copy; {new Date().getFullYear()} Krostio. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-muted-slate hover:text-ink">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-slate hover:text-ink">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
