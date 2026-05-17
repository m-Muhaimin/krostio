import Link from 'next/link';

const pillars = [
  {
    label: 'Krost Score',
    desc: '300–850 creditworthiness scored from real gig signals across every platform you work on.',
    color: 'bg-brand-black',
    icon: '◈',
  },
  {
    label: 'Krost Ledger',
    desc: 'Unified multi-platform earnings ledger that replaces fragmented pay stubs and screenshots.',
    color: 'bg-action-blue',
    icon: '⊞',
  },
  {
    label: 'Krost Verifier',
    desc: 'PDF reports and shareable verification links lenders trust — no more manual income calls.',
    color: 'bg-coral',
    icon: '⊡',
  },
  {
    label: 'Krost Passport',
    desc: 'On-chain soul-bound attestation that proves your financial identity anywhere, forever.',
    color: 'bg-ink/60',
    icon: '◇',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Announcement bar ── */}
      <div className="announcement-bar">
        <span className="hidden sm:inline">
          Krostio is in private beta — early access for gig workers.{' '}
        </span>
        <span className="sm:hidden">
          Private beta — early access for gig workers.{' '}
        </span>
        <Link
          href="/register"
          className="ml-2 underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          Join the waitlist
        </Link>
      </div>

      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-hairline/50">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <Link href="/" className="font-display text-xl font-medium tracking-tight">
            Krostio
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-nav text-ink/60">
            <a href="#product" className="hover:text-ink transition-colors">
              Product
            </a>
            <a href="#how-it-works" className="hover:text-ink transition-colors">
              How it works
            </a>
            <Link href="/login" className="hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-5">
              Get started
            </Link>
          </div>

          {/* Mobile nav toggle — simplified */}
          <div className="md:hidden flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pb-36">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mono-label text-ink/40 mb-5 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" />
            Financial Identity for the Gig Economy
          </p>
          <h1 className="font-display text-[clamp(40px,8vw,80px)] font-medium tracking-tight leading-[1.02]">
            Your income data is the new credit score.
          </h1>
          <p className="text-body-lg text-ink/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            More than <strong className="text-ink">64 million gig workers</strong> in the US
            are building financial lives outside traditional employment.{' '}
            <span className="hidden sm:inline">
              Krostio turns your fragmented earnings from Uber, DoorDash, Upwork, and
              200+ platforms into a portable, verifiable financial identity — one you
              own, control, and take anywhere.
            </span>
            <span className="sm:hidden">
              Turn fragmented gig earnings into a portable, verifiable financial identity
              you own and control.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            <Link href="/register" className="btn-primary text-[15px] !px-8 !py-4">
              Start building your score
            </Link>
            <Link
              href="#product"
              className="btn-pill-outline text-[15px] !px-8 !py-4"
            >
              See how it works
            </Link>
          </div>

          {/* Social proof micro */}
          <div className="flex items-center justify-center gap-6 mt-14 text-micro text-ink/40">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Trusted by early-access gig workers
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-action-blue" />
              Built on Base L2 + Supabase
            </span>
          </div>
        </div>
      </section>

      {/* ── Four-pillar preview (id=product) ── */}
      <section id="product" className="max-w-6xl mx-auto px-6 pb-28 scroll-mt-20">
        <div className="text-center mb-14">
          <p className="text-mono-label text-ink/30 mb-3">THE FOUR PILLARS</p>
          <h2 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05]">
            Everything you need for a portable financial identity
          </h2>
          <p className="text-body text-ink/50 mt-4 max-w-lg mx-auto">
            Four interconnected tools that work together to give gig workers the same
            financial infrastructure as salaried employees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.label}
              className="group card-cohere p-6 md:p-8 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`w-10 h-10 ${pillar.color} rounded-cohere-sm mb-5 flex items-center justify-center text-white text-lg`}
              >
                {pillar.icon}
              </div>
              <h3 className="font-display text-xl font-medium tracking-tight">
                {pillar.label}
              </h3>
              <p className="text-caption text-ink/50 mt-2 leading-relaxed flex-1">
                {pillar.desc}
              </p>
              <Link
                href="/register"
                className="btn-secondary mt-5 text-sm"
              >
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works (id=how-it-works) ── */}
      <section
        id="how-it-works"
        className="bg-soft-stone py-24 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-mono-label text-ink/30 mb-3">HOW IT WORKS</p>
            <h2 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05]">
              Three steps to your financial identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                title: 'Connect your platforms',
                desc: 'Link Uber, DoorDash, Upwork, Instacart, and 200+ platforms securely. Krostio reads earnings data — never your personal messages or passwords.',
              },
              {
                step: '02',
                title: 'Get your Krost Score',
                desc: 'Our engine analyses income consistency, platform diversity, and earning trends to generate a 300–850 creditworthiness score you can track over time.',
              },
              {
                step: '03',
                title: 'Verify & share anywhere',
                desc: 'Generate lender-ready PDF reports, shareable verification links, and an on-chain Passport attestation — all from one dashboard.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center md:text-left">
                <div className="w-12 h-12 rounded-cohere-sm bg-brand-black text-white flex items-center justify-center font-display text-lg font-medium mx-auto md:mx-0 mb-5">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-medium tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-body text-ink/60 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="bg-brand-black text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-mono-label text-white/40 mb-4">EARLY ACCESS</p>
          <h2 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05]">
            Ready to turn your gig earnings into a financial identity?
          </h2>
          <p className="text-body-lg text-white/60 mt-5 max-w-lg mx-auto">
            Join thousands of gig workers building the new standard for income
            verification. Private beta is open now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-black px-8 py-4 rounded-cohere-pill font-medium text-[15px] transition-all hover:opacity-90"
            >
              Get early access
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/30 px-8 py-4 rounded-cohere-pill font-medium text-[15px] transition-all hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-brand-black text-white/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="font-display text-xl font-medium tracking-tight text-white">
                Krostio
              </span>
              <p className="text-micro mt-3 text-white/40 max-w-[180px]">
                Financial identity infrastructure for the gig economy.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-mono-label text-white/30 mb-4">Product</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#product" className="hover:text-white transition-colors">Krost Score</a></li>
                <li><a href="#product" className="hover:text-white transition-colors">Krost Ledger</a></li>
                <li><a href="#product" className="hover:text-white transition-colors">Krost Verifier</a></li>
                <li><a href="#product" className="hover:text-white transition-colors">Krost Passport</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-mono-label text-white/30 mb-4">Company</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><a href="mailto:hello@krostio.com" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-mono-label text-white/30 mb-4">Legal</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="rule-hairline border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-micro">
            <p>&copy; {new Date().getFullYear()} Krostio. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Built on Base L2</span>
              <span>·</span>
              <span>Secured by Supabase</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
