import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      {/* ── Announcement bar ── */}
      <div className="announcement-bar relative">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4">
          <span className="text-center">
            Krostio is in private beta — early access for gig workers.{' '}
            <Link href="/register" className="underline underline-offset-2 hover:opacity-80">
              Request access
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

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="default" />
            <span className="font-display text-[17px] font-medium tracking-tight text-ink-black">
              Krostio
            </span>
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            <a href="#product" className="text-nav text-ink hover:text-ink-black">Product</a>
            <a href="#how-it-works" className="text-nav text-ink hover:text-ink-black">How it works</a>
            <Link href="/learn" className="text-nav text-ink hover:text-ink-black">Learn</Link>
            <Link href="/check-score" className="text-nav text-ink hover:text-ink-black font-medium">Score check</Link>
            <a href="#pricing" className="text-nav text-ink hover:text-ink-black">Pricing</a>
          </div>

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

      {/* ── HERO ── */}
      <section className="relative px-6 pt-24 pb-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-mono-label mb-8 text-slate">
            <span className="eyebrow-dot" />
            The financial identity platform for gig workers
          </p>

          <h1 className="text-display-hero max-w-5xl">
            Your gig income is real.
            <br />
            Own your financial identity.
          </h1>

          <div className="mt-10 max-w-2xl">
            <p className="text-body-lg text-slate">
              76 million Americans work gig jobs. Banks reject them because they can&apos;t see W-2s.
              Krostio turns multi-platform earnings into a portable, verifiable financial identity —
              built on four pillars: a credit score, an earnings ledger, lender-ready reports, and an on-chain passport.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/check-score" className="btn-primary">
                Check your score free
              </Link>
              <Link href="/register" className="btn-secondary">
                See the platform →
              </Link>
            </div>
          </div>

          {/* Four-pillar hero cards */}
          <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Pillar 01',
                title: 'Krost Score',
                desc: '300–850 income-based creditworthiness score built entirely on gig earnings, not credit history.',
                accent: 'bg-ink-black',
              },
              {
                label: 'Pillar 02',
                title: 'Krost Ledger',
                desc: 'Unified, worker-owned record of every dollar earned across every platform, all in one place.',
                accent: 'bg-action-blue',
              },
              {
                label: 'Pillar 03',
                title: 'Krost Verifier',
                desc: 'Lender-ready PDF reports and shareable links that any underwriter can accept. Expiring, revocable, verifiable.',
                accent: 'bg-coral',
              },
              {
                label: 'Pillar 04',
                title: 'Krost Passport',
                desc: 'Permanent on-chain identity attested on Base L2. Soul-bound. Portable. Yours forever, not a platform\'s.',
                accent: 'bg-deep-green',
              },
            ].map((p) => (
              <div key={p.label} className="flex flex-col gap-3 rounded-md border border-hairline p-6">
                <div className={`h-1 w-12 rounded-full ${p.accent}`} />
                <p className="text-mono-label text-slate mt-2">{p.label}</p>
                <h3 className="text-xl font-medium text-ink-black">{p.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Score demo band ── */}
      <section className="px-6 py-24" style={{ backgroundColor: 'var(--color-deep-green)' }}>
        <div className="mx-auto max-w-7xl text-white">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-mono-label text-white/50">
                <span className="eyebrow-dot" style={{ backgroundColor: '#ffad9b' }} />
                Krost Score
              </p>
              <h2 className="text-display-product mt-6 text-white">
                A credit score that
                <br />
                works for gig workers.
              </h2>
              <p className="text-body-lg mt-8 max-w-lg text-white/70">
                The Krost Score is a 300–850 income-based creditworthiness metric — built on
                9 factors from real earnings data. It&apos;s not a FICO score. It&apos;s better
                for anyone without a W-2.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link href="/register" className="btn-primary-light">
                  Check your score
                </Link>
                <Link href="/learn" className="btn-secondary text-white">
                  How it&apos;s calculated →
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: 'Income reliability',
                  title: 'Average monthly + trajectory over 24 months',
                  body: 'Higher income relative to $5K benchmark, weighted by 6-month trend slope.',
                },
                {
                  label: 'Platform diversity',
                  title: 'Multi-platform diversification bonus',
                  body: 'Workers with 3+ platforms score higher — less concentration risk for lenders.',
                },
                {
                  label: 'Consistency & tenure',
                  title: 'Months of history and earning consistency',
                  body: 'Longer track record with fewer zero-earning months signals reliability.',
                },
                {
                  label: 'Tax & ledger depth',
                  title: 'Verified history and tax compliance signals',
                  body: '1099-K filing and months of verified ledger history add bonus points.',
                },
              ].map((f) => (
                <div
                  key={f.label}
                  className="rounded-md border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-mono-label text-white/50">{f.label}</p>
                  <h3 className="mt-2 text-lg font-normal text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-white/65">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Four-pillar detail ── */}
      <section id="product" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-mono-label text-slate">
              <span className="eyebrow-dot" />
              The four pillars
            </p>
            <h2 className="text-heading-section mt-4">
              Everything a gig worker needs to own their financial identity.
            </h2>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {[
              {
                num: '01',
                title: 'Krost Score',
                subtitle: '300–850 income-based creditworthiness metric',
                body: 'A deterministic 9-factor scoring model purpose-built for 1099 workers. Tiers: Elite (750+), Strong (680+), Building (580+), Emerging. The score is computed from real ledger data — not a FICO equivalent or FCRA-regulated credit report.',
                accent: 'bg-ink-black',
              },
              {
                num: '02',
                title: 'Krost Ledger',
                subtitle: 'Permanent, unified earnings record across all platforms',
                body: 'Connect every gig platform — Uber, DoorDash, Lyft, Fiverr, Upwork, Instacart, and more — via Plaid. The Ledger aggregates all earnings into a single timeline. Export as CSV. Track monthly rollups. See your complete career earnings record in one place.',
                accent: 'bg-action-blue',
              },
              {
                num: '03',
                title: 'Krost Verifier',
                subtitle: 'Lender-ready reports you control',
                body: 'Generate on-demand PDF reports with 10 sections: executive summary, income history, earnings charts, platform profiles, stability analysis, trajectory statement, and verification footnotes. Share via expiring links with email-gated access. Revoke any time. Full access log.',
                accent: 'bg-coral',
              },
              {
                num: '04',
                title: 'Krost Passport',
                subtitle: 'Permanent, soul-bound on-chain identity',
                body: 'When your score reaches 580+, attest it on Base L2 as a soul-bound token (SBT). No wallet needed — Krostio creates one via Account Abstraction (gasless, email-based). Your Passport is a verifiable financial identity you own forever, even if Krostio shuts down.',
                accent: 'bg-deep-green',
              },
            ].map((p) => (
              <div key={p.num} className="flex flex-col gap-4 rounded-xl border border-hairline p-8">
                <div className={`h-1.5 w-16 rounded-full ${p.accent}`} />
                <p className="text-mono-label text-coral mt-3">{p.num}</p>
                <h3 className="text-2xl font-medium text-ink-black">{p.title}</h3>
                <p className="text-sm font-medium text-slate">{p.subtitle}</p>
                <p className="text-sm text-slate leading-relaxed">{p.body}</p>
                <Link
                  href="/register"
                  className="link-editorial mt-2 inline-block text-sm"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform strip ── */}
      <section className="border-t border-hairline px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-mono-label text-slate">
            Connecting with the platforms you already work on
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 text-ink-black/40">
            {['UBER', 'DOORDASH', 'LYFT', 'INSTACART', 'UPWORK', 'FIVERR', 'GRUBHUB', 'AMAZON FLEX'].map((logo) => (
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

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-6 py-24" style={{ backgroundColor: 'var(--color-dark-navy)' }}>
        <div className="mx-auto max-w-7xl text-white">
          <p className="text-mono-label text-white/50">
            <span className="eyebrow-dot" style={{ backgroundColor: '#ffad9b' }} />
            How it works
          </p>
          <h2 className="text-heading-section mt-4 max-w-2xl text-white">
            Four steps from gig worker to financial identity.
          </h2>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                num: '01',
                title: 'Connect platforms',
                body: 'Link any combination of Uber, DoorDash, Lyft, Upwork, Fiverr, and more via Plaid. One tap per platform — encrypted, revocable.',
              },
              {
                num: '02',
                title: 'Build your Ledger',
                body: 'All earnings from all platforms flow into a single unified timeline. See monthly rollups, career totals, and platform breakdowns at a glance.',
              },
              {
                num: '03',
                title: 'Get your Score',
                body: 'A deterministic 9-factor engine computes your Krost Score (300–850). See exactly what factors help or hurt, with personalized improvement tips.',
              },
              {
                num: '04',
                title: 'Share & attest',
                body: 'Generate a lender-ready report, share an expiring link, or mint your on-chain Passport. Your financial identity, fully under your control.',
              },
            ].map((s) => (
              <div key={s.num} className="flex flex-col gap-3">
                <span className="text-3xl font-light text-coral">{s.num}</span>
                <h3 className="text-xl font-medium text-white">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Research strip ── */}
      <section className="border-t border-hairline px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-mono-label text-slate">From the research blog</p>
          <h2 className="text-heading-section mt-4 max-w-3xl">
            What we&apos;re learning about credit at the edge of the W-2 economy.
          </h2>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="chip-coral">All posts</span>
            <span className="chip-coral-outline">Scoring methodology</span>
            <span className="chip-coral-outline">Income verification</span>
            <span className="chip-coral-outline">Platform integrations</span>
            <span className="chip-coral-outline">Lender case studies</span>
            <span className="chip-coral-outline">Policy &amp; advocacy</span>
          </div>

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
                topic: 'Verification',
                title: 'Designing a 300–850 Krost Score that lenders actually trust',
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

      {/* ── Pricing ── */}
      <section id="pricing" className="border-t border-hairline px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-mono-label text-slate text-center">
            <span className="eyebrow-dot" />
            Plans
          </p>
          <h2 className="text-heading-section mt-4 text-center">
            Simple pricing. No surprises.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Free */}
            <div className="card-stone">
              <p className="text-mono-label text-slate">Get started</p>
              <h3 className="mt-4 text-[32px] font-normal leading-none text-ink-black">Free</h3>
              <p className="mt-4 text-sm text-slate">
                See what Krostio can do. No credit card needed.
              </p>
              <div className="my-8 border-t border-hairline" />
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-normal tracking-tight">$0</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-ink">
                {[
                  '1 platform connection',
                  'Income summary view',
                  'Krost Score preview',
                  'No PDF reports',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1 w-1 rounded-full bg-coral" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/register" className="btn-pill-outline">
                  Get started
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="card-stone relative">
              <div className="absolute right-6 top-6">
                <span className="rounded-full bg-coral px-3 py-1 text-xs font-medium text-white">
                  Most popular
                </span>
              </div>
              <p className="text-mono-label text-slate">For serious earners</p>
              <h3 className="mt-4 text-[32px] font-normal leading-none text-ink-black">Pro</h3>
              <p className="mt-4 text-sm text-slate">
                Keep your income verification up to date across every platform you work on.
              </p>
              <div className="my-8 border-t border-hairline" />
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-normal tracking-tight">$19</span>
                <span className="text-sm text-slate">/ month</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-ink">
                {[
                  'Connect up to 5 platforms',
                  'Unlimited PDF reports',
                  'Expiring shareable links (7/30 day)',
                  '24 months income history',
                  'Krost Passport minting',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1 w-1 rounded-full bg-coral" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/register?plan=pro" className="btn-primary">
                  Start free trial
                </Link>
              </div>
            </div>

            {/* Single Report */}
            <div className="card-stone">
              <p className="text-mono-label text-slate">Pay as you go</p>
              <h3 className="mt-4 text-[32px] font-normal leading-none text-ink-black">Single Report</h3>
              <p className="mt-4 text-sm text-slate">
                One verified income report when you just need to share it with a lender.
              </p>
              <div className="my-8 border-t border-hairline" />
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-normal tracking-tight">$9</span>
                <span className="text-sm text-slate">one-time</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-ink">
                {[
                  '1 platform connection',
                  '1 PDF report',
                  '12 months history',
                  'Shareable link (7 days)',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1 w-1 rounded-full bg-coral" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/register?plan=single" className="btn-pill-outline">
                  Buy a report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24" style={{ backgroundColor: 'var(--color-pale-blue)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-mono-label text-slate">Get started</p>
              <h2 className="text-display-product mt-4 max-w-xl">
                Ready to own your financial identity?
              </h2>
              <p className="mt-6 max-w-md text-body text-slate">
                Free score preview. No credit card. Takes about three minutes.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/check-score" className="btn-primary">
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

      {/* ── Footer ── */}
      <footer className="px-6 py-20" style={{ backgroundColor: 'var(--color-ink-black)', color: 'rgba(255,255,255,0.7)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-mono-label" style={{ color: 'var(--color-coral)' }}>
                Stay in the loop
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

          <div className="grid gap-12 py-16 md:grid-cols-5">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <BrandLogo size="default" variant="light" />
                <span className="font-display text-[17px] font-medium tracking-tight text-white">
                  Krostio
                </span>
              </Link>
              <p className="mt-5 max-w-xs text-sm text-white/50">
                A financial identity platform for the gig economy. Four pillars. One portable credential.
              </p>
            </div>

            {[
              {
                heading: 'Product',
                links: [
                  ['Krost Score', '#product'],
                  ['Krost Ledger', '#product'],
                  ['Krost Verifier', '#product'],
                  ['Krost Passport', '#product'],
                  ['Pricing', '#pricing'],
                ],
              },
              {
                heading: 'Learn',
                links: [
                  ['All guides', '/learn'],
                  ['DoorDash income proof', '/learn/doordash-income-proof'],
                  ['Uber mortgage', '/learn/uber-mortgage'],
                  ['1099 car loans', '/learn/1099-income-verification'],
                ],
              },
              {
                heading: 'Company',
                links: [
                  ['About', '#'],
                  ['Privacy', '/privacy'],
                  ['Terms', '/terms'],
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

          <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
            <select className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm text-white outline-none">
              <option className="text-ink-black">United States (English)</option>
            </select>
            <p className="text-sm text-white/30">
              &copy; 2026 Krostio. The financial identity platform for gig workers.
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
