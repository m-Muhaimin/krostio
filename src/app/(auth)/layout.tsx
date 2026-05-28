import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-soft-stone">
          <BrandLogo size="default" variant="dark" />
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink-black">
            Krost<span className="text-coral">io</span>
          </span>
        </Link>
      </div>
      <Link
        href="/"
        className="fixed top-5 right-6 z-50 flex items-center gap-1.5 rounded-full border border-hairline bg-white px-4 py-2 text-sm text-slate transition-colors hover:border-slate hover:text-ink-black"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M11.5 3.5l-8 8M3.5 3.5l8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Exit
      </Link>
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        {children}
      </main>
    </div>
  )
}
