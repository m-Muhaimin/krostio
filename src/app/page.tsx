import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      {/* ── Announcement bar — full-width black strip above nav ── */}
      <div className="announcement-bar relative">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4">
          <span className="text-center">
            Krost is live on Base L2.{' '}
            <Link href="/check-score" className="underline underline-offset-2 hover:opacity-80">
              Learn more
            </Link>
          </span>
          <button
            aria-label="Dismiss"
            className="absolute right-4 text-white/70 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>

      {/* ── Three-zone nav: logo left, links center, sign-in/CTA right ── */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink-black text-xs font-medium text-white">
              K
            </div>
            <span className="font-display text-[17px] font-medium tracking-tight text-ink-black">
              Krost
            </span>
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            <a href="#product" className="text-nav text-ink hover:text-ink-black">Product</a>
            <a href="#how-it-works" className="text-nav text-ink hover:text-ink-black">How it works</a>
            <a href="#research" className="text-nav text-ink hover:text-ink-black">Research</a>
            <a href="#pricing" className="text-nav text-ink hover:text-ink-black">Pricing</a>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/login" className="text-nav text-ink hover:text-ink-black">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary">
              Request a demo
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO — monumental typographic declaration over white canvas ── */}
      <section className="relative px-6 pt-24 pb-20">
        <div className="mx-auto max-w-7xl">
          {/* Mono category label */}
          <p className="text-mono-label mb-8 text-slate">
            <span className="eyebrow-dot" />
            Decentralized credit scoring
          </p>

          {/* Hero declaration — tight line-height, negative tracking */}
          <h1 className="text-display-hero max-w-5xl">
            Your gig income is real.
            <br />
            We make lenders see it.
          </h1>

          <div className="mt-10 max-w-2xl">
            <p className="text-body-lg text-slate">
              60M Americans work gig jobs. Banks reject them because they don&apos;t see W-2s.
              Krost turns multi-platform earnings into a verifiable, on-chain credit
              score — so lenders can say yes.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/check-score" className="btn-primary">
                Check your score free
              </Link>
              <Link href="/register" className="btn-secondary">
                Explore products →
              </Link>
            </div>
          </div>

          {/* Two-card media composition: wide product mockup + narrow photo card */}
          <div className="mt-20 grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Wide agent-console mockup card */}
            <div className="card-media bg-soft-stone p-8">
              <div className="agent-console">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-coral/20 ring-1 ring-coral/40" />
                    <div>
                      <p className="text-sm font-medium text-white">Income agent</p>
                      <p className="text-xs text-white/50">Verifying 4 platforms</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="agent-console-chip">
                      <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                      Uber
                    </span>
                    <span className="agent-console-chip">
                      <span className="h-1.5 w-1.5 rounded-full bg-action-blue" />
                      DoorDash
                    </span>
                    <span className="agent-console-chip">
                      <span className="h-1.5 w-1.5 rounded-full bg-pale-green" />
                      Upwork
                    </span>
                  </div>
                </div>

                <div className="rule-light my-5 border-white/10" />

                <p className="text-mono-label mb-3 text-white/40">Prompt</p>
                <p className="text-sm text-white/90">
                  Compute attested credit score for verified user 0x71C…dE3a across all connected
                  income platforms over the last 12 months.
                </p>

                <div className="mt-6 rounded-md border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-mono-label text-white/40">Computed score</p>
                      <p className="mt-2 text-5xl font-light tracking-tight text-white">742</p>
                    </div>
                    <div className="text-right text-xs text-white/50">
                      <p>Income stability · 92%</p>
                      <p className="mt-1">Trajectory · +14% YoY</p>
                      <p className="mt-1">Tenure · 31 months</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                    Attested on Base L2 · tx 0x4a…91f2
                  </div>
                </div>
              </div>
            </div>

            {/* Narrower photo placeholder card */}
            <div className="card-media relative flex flex-col justify-end bg-soft-stone p-8 min-h-[420px]">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(120% 80% at 20% 0%, rgba(255,119,89,0.35), transparent 55%), radial-gradient(80% 60% at 90% 30%, rgba(24,99,220,0.18), transparent 60%), linear-gradient(180deg, #eeece7 0%, #e2dfd9 100%)',
                }}
              />
              <div className="relative">
                <p className="text-mono-label text-ink-black/60">Field study</p>
                <h3 className="mt-3 text-[28px] leading-tight text-ink-black">
                  &ldquo;My Uber earnings finally count toward a real credit line.&rdquo;
                </h3>
                <p className="mt-4 text-sm text-ink-black/60">
                  Marcus T. · Rideshare driver, Atlanta · Verified income $48,200 / yr
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust-logo strip — wide spacing, monochrome, no chrome ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-mono-label text-slate">
            Trusted by underwriting teams across the new economy
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 text-ink-black/40">
            {['UPSTART', 'AFFIRM', 'KIVA', 'OPPLOANS', 'AVANT', 'FINOVA', 'ONEMAIN'].map((logo) => (
              <span
                key={logo}
                className="font-display text-2xl font-medium tracking-tight"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark feature band — deep green, North-style capability panel ── */}
      <section id="product" className="px-6 py-24" style={{ backgroundColor: 'var(--color-deep-green)' }}>
        <div className="mx-auto max-w-7xl text-white">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-mono-label text-white/50">
                <span className="eyebrow-dot" style={{ backgroundColor: '#ffad9b' }} />
                The product
              </p>
              <h2 className="text-display-product mt-6 text-white">
                Income, attested.
                <br />
                Underwriting, accelerated.
              </h2>
              <p className="text-body-lg mt-8 max-w-lg text-white/70">
                Connect platforms, generate an attested score, and share verifiable income
                with a single signed link. No more paper pay stubs. No more bank-statement
                screenshots. No more six-week underwriting cycles.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link href="/register" className="btn-primary-light">
                  Request a demo
                </Link>
                <Link href="/check-score" className="btn-secondary text-white">
                  Try the playground →
                </Link>
              </div>
            </div>

            {/* Stacked dark capability panels */}
            <div className="space-y-4">
              {[
                {
                  label: 'Connector layer',
                  title: 'One-tap platform linking',
                  body: 'OAuth flows for Uber, Lyft, DoorDash, Instacart, Fiverr, Upwork, and 40+ gig platforms — encrypted at rest, revocable any time.',
                },
                {
                  label: 'Scoring engine',
                  title: 'Multi-factor income score',
                  body: 'Pure-function scoring across stability, diversity, tenure, and trajectory — auditable, deterministic, no opaque ML black boxes.',
                },
                {
                  label: 'Attestation',
                  title: 'On-chain proofs on Base L2',
                  body: 'Each score is published as a cryptographic attestation. Lenders verify with one RPC call. Workers revoke with one signed transaction.',
                },
              ].map((p) => (
                <div
                  key={p.label}
                  className="rounded-md border border-white/10 bg-white/[0.04] p-6"
                >
                  <p className="text-mono-label text-white/50">{p.label}</p>
                  <h3 className="mt-3 text-2xl font-normal text-white">{p.title}</h3>
                  <p className="mt-3 text-sm text-white/65">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Capability cards — thin-line illustrations, white surface ── */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-mono-label text-slate">How it works</p>
              <h2 className="text-heading-section mt-4">
                Three steps from gig income to underwriting-ready score.
              </h2>
            </div>
            <div className="grid gap-10 sm:grid-cols-3">
              {[
                {
                  num: '01',
                  title: 'Connect platforms',
                  body: 'Link any combination of Uber, DoorDash, Fiverr, Upwork, and 40+ income sources. We never store raw transactions — only the cryptographic digest needed for scoring.',
                },
                {
                  num: '02',
                  title: 'Generate a score',
                  body: 'A deterministic engine computes income stability, platform diversity, tenure, and trajectory. The output is a single number in the standard 300–850 range.',
                },
                {
                  num: '03',
                  title: 'Share an attestation',
                  body: 'A signed, on-chain attestation makes the score independently verifiable. Lenders accept it in seconds; workers revoke it whenever they choose.',
                },
              ].map((s) => (
                <div key={s.num} className="border-t border-hairline pt-6">
                  <p className="text-mono-label text-coral">{s.num}</p>
                  <h3 className="mt-4 text-[22px] leading-tight text-ink-black">{s.title}</h3>
                  <p className="mt-3 text-sm text-slate">{s.body}</p>
                  <Link
                    href="/check-score"
                    className="link-editorial mt-4 inline-block text-sm"
                  >
                    Read more
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Editorial taxonomy strip — coral chips, large, hero-level ── */}
      <section id="research" className="border-t border-hairline px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-mono-label text-slate">From the research blog</p>
          <h2 className="text-heading-section mt-4 max-w-3xl">
            What we&apos;re learning about credit at the edge of the W-2 economy.
          </h2>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="chip-coral">All posts</span>
            <span className="chip-coral-outline">Scoring methodology</span>
            <span className="chip-coral-outline">On-chain attestation</span>
            <span className="chip-coral-outline">Platform integrations</span>
            <span className="chip-coral-outline">Lender case studies</span>
            <span className="chip-coral-outline">Policy &amp; advocacy</span>
          </div>

          {/* Rule-separated publication list */}
          <ul className="mt-14 divide-y divide-hairline">
            {[
              {
                date: 'May 2026',
                topic: 'Methodology',
                title: 'Why income volatility is the wrong proxy for gig-worker creditworthiness',
              },
              {
                date: 'Apr 2026',
                topic: 'Case study',
                title: 'How a regional lender cut gig-worker underwriting time from 9 days to 11 minutes',
              },
              {
                date: 'Mar 2026',
                topic: 'On-chain',
                title: 'Attesting income on Base: a minimal trust model for verifiable scores',
              },
              {
                date: 'Feb 2026',
                topic: 'Policy',
                title: 'Reading CFPB&apos;s Section 1033 final rule through a gig-economy lens',
              },
            ].map((row) => (
              <li
                key={row.title}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-8 py-6"
              >
                <span className="text-mono-label text-slate min-w-[6rem]">{row.date}</span>
                <div>
                  <span className="chip-coral-outline mr-3">{row.topic}</span>
                  <span className="text-[17px] text-ink-black">{row.title}</span>
                </div>
                <Link href="#" className="link-editorial text-sm">
                  Read →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pricing — restrained card pair ── */}
      <section id="pricing" className="border-t border-hairline px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-mono-label text-slate">Plans</p>
              <h2 className="text-heading-section mt-4">Built for both sides of the credit table.</h2>
              <p className="mt-6 text-body text-slate">
                Workers pay a flat monthly fee to maintain their attested score. Lenders pay
                per verification or annual seat. No surprise overage charges.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Worker */}
              <div className="card-stone">
                <p className="text-mono-label text-slate">For workers</p>
                <h3 className="mt-4 text-[32px] font-normal leading-none text-ink-black">
                  Gig worker
                </h3>
                <p className="mt-4 text-sm text-slate">
                  Build a verifiable on-chain credit score from your existing platform earnings.
                </p>
                <div className="my-8 border-t border-hairline" />
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-normal tracking-tight">$29</span>
                  <span className="text-sm text-slate">/ month</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-ink">
                  {[
                    'Connect up to 5 platforms',
                    'Monthly score recompute',
                    'On-chain attestation',
                    'Selective lender sharing',
                    'Full income history export',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="mt-[7px] h-1 w-1 rounded-full bg-coral" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link href="/register?plan=worker" className="btn-pill-outline">
                    Start free trial
                  </Link>
                </div>
              </div>

              {/* Lender */}
              <div className="card-stone" style={{ backgroundColor: 'var(--color-ink-black)', color: '#fff' }}>
                <p className="text-mono-label text-white/50">For lenders</p>
                <h3 className="mt-4 text-[32px] font-normal leading-none text-white">
                  Lender
                </h3>
                <p className="mt-4 text-sm text-white/65">
                  Verify gig-worker income in seconds. Reduce manual underwriting overhead.
                </p>
                <div className="my-8 border-t border-white/15" />
                <div className="flex items-baseline gap-2 text-white">
                  <span className="font-display text-5xl font-normal tracking-tight">$99</span>
                  <span className="text-sm text-white/65">/ month</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-white/80">
                  {[
                    '50 verifications / month',
                    'On-chain attestation lookup',
                    'Bulk income report exports',
                    'Risk-scoring API access',
                    'Custom scoring parameters',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="mt-[7px] h-1 w-1 rounded-full bg-coral" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link href="/register?plan=lender" className="btn-primary-light">
                    Request a demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA image band — pale blue surface, abstract field ── */}
      <section className="px-6 py-24" style={{ backgroundColor: 'var(--color-pale-blue)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-mono-label text-slate">Get started</p>
              <h2 className="text-display-product mt-4 max-w-xl">
                Ready to get the credit you actually deserve?
              </h2>
              <p className="mt-6 max-w-md text-body text-slate">
                Free score preview. No credit card. Takes about three minutes.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link href="/register" className="btn-primary">
                  Get your free score
                </Link>
                <Link href="/login" className="btn-secondary">
                  I already have an account →
                </Link>
              </div>
            </div>

            <div
              aria-hidden
              className="card-media min-h-[360px]"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, rgba(24,99,220,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(255,119,89,0.25), transparent 50%), linear-gradient(135deg, #1863dc 0%, #071829 100%)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Dark footer w/ coral eyebrow, newsletter, columns ── */}
      <footer className="px-6 py-20" style={{ backgroundColor: 'var(--color-ink-black)', color: 'rgba(255,255,255,0.7)' }}>
        <div className="mx-auto max-w-7xl">
          {/* Top — newsletter band */}
          <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-mono-label" style={{ color: 'var(--color-coral)' }}>
                AI moves fast
              </p>
              <h2 className="mt-4 text-[40px] leading-tight text-white">
                Get our research and product updates,
                <br />
                straight to your inbox.
              </h2>
              <p className="mt-4 text-sm text-white/50">
                One email a month. No spam. Unsubscribe any time.
              </p>
            </div>
            <form className="flex max-w-md items-end gap-3 self-end">
              <div className="flex-1">
                <label className="text-mono-label mb-2 block text-white/40">Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full border-0 border-b border-white/30 bg-transparent pb-3 text-white outline-none placeholder:text-white/40 focus:border-coral"
                />
              </div>
              <button type="submit" className="pb-3 text-white" aria-label="Subscribe">
                →
              </button>
            </form>
          </div>

          {/* Columns */}
          <div className="grid gap-12 py-16 md:grid-cols-5">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-white text-xs font-medium text-ink-black">
                  K
                </div>
                <span className="font-display text-[17px] font-medium tracking-tight text-white">
                  Krost
                </span>
              </Link>
              <p className="mt-5 max-w-xs text-sm text-white/50">
                Decentralized credit scoring for the gig economy. Built on Base L2.
              </p>
            </div>

            {[
              {
                heading: 'Product',
                links: [
                  ['Features', '#product'],
                  ['Pricing', '#pricing'],
                  ['Free score check', '/check-score'],
                  ['Sign up', '/register'],
                ],
              },
              {
                heading: 'Research',
                links: [
                  ['Methodology', '#research'],
                  ['Case studies', '#research'],
                  ['On-chain proofs', '#research'],
                  ['Policy', '#research'],
                ],
              },
              {
                heading: 'Company',
                links: [
                  ['About', '#'],
                  ['Privacy', '#'],
                  ['Terms', '#'],
                  ['Contact', '#'],
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-mono-label mb-5 text-white">{col.heading}</p>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm text-white/55 transition hover:text-white"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
            <select className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm text-white outline-none">
              <option className="text-ink-black">United States (English)</option>
            </select>
            <p className="text-sm text-white/30">
              © 2026 Krost. Decentralized credit for the gig economy.
            </p>
            <div className="flex items-center gap-5 text-white/40">
              {['LinkedIn', 'X', 'GitHub'].map((s) => (
                <a key={s} href="#" className="hover:text-white text-sm">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
