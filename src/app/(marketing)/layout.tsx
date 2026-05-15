import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="default" />
            <span className="font-display text-[17px] font-medium tracking-tight text-ink-black">
              Krost
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/lenders" className="text-nav text-ink hover:text-ink-black">
              Lenders
            </Link>
            <Link href="/login" className="text-nav text-ink hover:text-ink-black">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary">
              Request a demo
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-slate md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Krost. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/lenders" className="hover:text-ink-black">
              Lenders
            </Link>
            <Link href="/learn" className="hover:text-ink-black">
              Learn
            </Link>
            <Link href="/pricing" className="hover:text-ink-black">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-ink-black">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink-black">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
