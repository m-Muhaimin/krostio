'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const platforms = [
  { id: 'uber', name: 'Uber', icon: 'U', desc: 'Rides & Uber Eats' },
  { id: 'lyft', name: 'Lyft', icon: 'L', desc: 'Rideshare' },
  { id: 'doordash', name: 'DoorDash', icon: 'D', desc: 'Food delivery' },
  { id: 'instacart', name: 'Instacart', icon: 'I', desc: 'Grocery delivery' },
  { id: 'fiverr', name: 'Fiverr', icon: 'F', desc: 'Freelance services' },
  { id: 'upwork', name: 'Upwork', icon: 'U', desc: 'Freelance projects' },
  { id: 'amazon-flex', name: 'Amazon Flex', icon: 'A', desc: 'Package delivery' },
  { id: 'grubhub', name: 'Grubhub', icon: 'G', desc: 'Food delivery' },
]

function generateMockScore() {
  const base = Math.floor(Math.random() * 120) + 580
  return {
    score: base,
    incomeStability: Math.floor(Math.random() * 30) + 65,
    monthlyAvg: Math.floor(Math.random() * 3500) + 2500,
    platformDiversity: Math.floor(Math.random() * 4) + 1,
    tenure: Math.floor(Math.random() * 24) + 3,
    trend: Math.random() > 0.3 ? 'Stable' : 'Growing',
  }
}

type Step = 'landing' | 'connecting' | 'score'

export default function CheckScorePage() {
  const [step, setStep] = useState<Step>('landing')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [result, setResult] = useState<ReturnType<typeof generateMockScore> | null>(null)
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  const handleConnect = (platformId: string) => {
    setSelectedPlatform(platformId)
    setStep('connecting')
    setTimeout(() => {
      setResult(generateMockScore())
      setStep('score')
    }, 1500)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSaved(true)
  }

  const scoreCategory = (s: number) => {
    if (s >= 740) return 'Excellent'
    if (s >= 670) return 'Good'
    if (s >= 580) return 'Fair'
    return 'Needs work'
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Nav */}
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink-black text-xs font-medium text-white">
              K
            </div>
            <span className="font-display text-[17px] font-medium tracking-tight text-ink-black">
              Krost
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-nav text-ink hover:text-ink-black">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary">
              Request a demo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {step === 'landing' && (
          <section className="px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <p className="text-mono-label text-slate">
                <span className="eyebrow-dot" />
                Free · No credit card needed
              </p>
              <h1 className="text-display-product mt-6 max-w-4xl">
                Check your gig-worker credit score.
              </h1>
              <p className="mt-6 max-w-2xl text-body-lg text-slate">
                Pick a platform below to see your estimated credit score based on your real
                gig income. Your data is encrypted and never stored without your consent.
              </p>

              <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleConnect(p.id)}
                    className="card-bordered flex items-center gap-4 p-5 text-left transition hover:border-ink-black"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-ink-black text-sm font-medium text-white">
                      {p.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-black">{p.name}</p>
                      <p className="text-xs text-slate">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 'connecting' && (
          <section className="flex min-h-[60vh] items-center justify-center px-6">
            <div className="text-center">
              <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-ink-black">
                <svg className="h-7 w-7 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-mono-label text-slate">Analyzing your income</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-ink-black">
                Connecting to{' '}
                {platforms.find((p) => p.id === selectedPlatform)?.name}…
              </h2>
              <div className="mx-auto mt-8 h-1 w-64 overflow-hidden rounded-full bg-hairline">
                <div className="h-full w-full animate-pulse rounded-full bg-coral opacity-70" />
              </div>
            </div>
          </section>
        )}

        {step === 'score' && result && (
          <section className="px-6 py-16">
            <div className="mx-auto max-w-3xl">
              {/* Score band — deep green */}
              <div
                className="rounded-lg p-10"
                style={{ backgroundColor: 'var(--color-deep-green)', color: '#fff' }}
              >
                <p className="text-mono-label text-white/50">
                  Your estimated gig-worker credit score
                </p>
                <div className="mt-8 flex items-end gap-8">
                  <span className="font-display text-[120px] leading-none tracking-tight text-white">
                    {result.score}
                  </span>
                  <div className="mb-4">
                    <p className="text-mono-label text-coral">{scoreCategory(result.score)}</p>
                    <p className="mt-1 text-xs text-white/50">Range 300–850</p>
                  </div>
                </div>
                <div className="mt-8 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-coral transition-all duration-1000"
                    style={{ width: `${((result.score - 300) / 550) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor breakdown — rule-separated */}
              <ul className="mt-12 divide-y divide-hairline border-t border-hairline">
                {[
                  { label: 'Income stability', value: `${result.incomeStability}/100` },
                  { label: 'Monthly average', value: `$${result.monthlyAvg.toLocaleString()}` },
                  { label: 'Platforms', value: `${result.platformDiversity} connected` },
                  { label: 'Gig tenure', value: `${result.tenure} months` },
                  { label: 'Trend', value: result.trend },
                ].map((f) => (
                  <li key={f.label} className="flex items-center justify-between py-4">
                    <span className="text-mono-label text-slate">{f.label}</span>
                    <span className="text-base text-ink-black">{f.value}</span>
                  </li>
                ))}
              </ul>

              {/* Email capture / next steps */}
              {!saved ? (
                <form onSubmit={handleSave} className="mt-12 border-t border-hairline pt-10">
                  <p className="text-mono-label text-slate">Get the full report</p>
                  <h3 className="mt-3 font-display text-2xl tracking-tight text-ink-black">
                    Save your score and get early access.
                  </h3>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-rect flex-1 min-w-[240px]"
                    />
                    <Button variant="primary" type="submit">
                      Save &amp; join waitlist
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-slate">No spam. Unsubscribe anytime.</p>
                </form>
              ) : (
                <div className="mt-12 border-t border-hairline pt-10">
                  <p className="text-mono-label text-coral">You&apos;re on the list</p>
                  <h3 className="mt-3 font-display text-2xl tracking-tight text-ink-black">
                    We&apos;ll notify you at {email}.
                  </h3>
                  <div className="mt-6 flex flex-wrap gap-6">
                    <Link href="/register" className="btn-primary">
                      Create full account
                    </Link>
                    <button
                      onClick={() => {
                        setStep('landing')
                        setResult(null)
                        setEmail('')
                        setSaved(false)
                      }}
                      className="btn-secondary"
                    >
                      Try another platform →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
