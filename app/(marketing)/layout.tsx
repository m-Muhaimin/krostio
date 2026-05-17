import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-hairline/50">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <Link href="/" className="font-display text-xl font-medium tracking-tight">
            Krostio
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-nav text-ink/60">
            <Link href="/about" className="hover:text-ink transition-colors">
              About
            </Link>
            <Link href="/blog" className="hover:text-ink transition-colors">
              Blog
            </Link>
            <Link href="/check-score" className="hover:text-ink transition-colors">
              Check Score
            </Link>
            <Link href="/login" className="hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-5">
              Get started
            </Link>
          </div>

          {/* Mobile nav toggle */}
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

      {/* ── Page content ── */}
      <main className="flex-1">{children}</main>

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
                <li><a href="/#product" className="hover:text-white transition-colors">Krost Score</a></li>
                <li><a href="/#product" className="hover:text-white transition-colors">Krost Ledger</a></li>
                <li><a href="/#product" className="hover:text-white transition-colors">Krost Verifier</a></li>
                <li><a href="/#product" className="hover:text-white transition-colors">Krost Passport</a></li>
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
