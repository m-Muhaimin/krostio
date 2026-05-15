import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="default" />
            <span className="font-display text-[17px] font-medium tracking-tight text-ink-black">
              Krost
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
