import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'
import { BrandLogo } from '@/components/ui/brand-logo'

interface NavSection {
  label: string
  items: { label: string; href: string }[]
}

const commonNav: NavSection = {
  label: 'General',
  items: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Billing', href: '/dashboard/billing' },
  ],
}

const workerNav: NavSection = {
  label: 'Worker',
  items: [
    { label: 'My score', href: '/dashboard/worker' },
    { label: 'Score breakdown', href: '/dashboard/worker/score' },
    { label: 'Platforms', href: '/dashboard/worker/connections' },
    { label: 'Ledger', href: '/dashboard/worker/ledger' },
    { label: 'Reports', href: '/dashboard/worker/reports' },
  ],
}

function NavGroup({ section }: { section: NavSection }) {
  return (
    <div className="mb-8">
      <p className="mb-3 px-3 text-mono-label text-slate">{section.label}</p>
      <ul className="space-y-1">
        {section.items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-sm px-3 py-2 text-sm text-ink transition hover:bg-soft-stone hover:text-ink-black"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, userId } = await getCurrentUserRole()

  if (!role || !userId) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-hairline bg-white p-6 lg:flex lg:flex-col">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <BrandLogo size="default" />
          <span className="font-display text-[17px] font-medium tracking-tight text-ink-black">
            Krost
          </span>
        </Link>

        <nav className="flex-1">
          <NavGroup section={commonNav} />
          <div className="mb-6 border-t border-hairline" />
          <NavGroup section={workerNav} />
        </nav>

        <div className="border-t border-hairline pt-5">
          <div className="mb-3 px-3 text-xs text-muted-slate">
            Signed in as{' '}
            <span className="font-medium text-ink-black">Gig worker</span>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full rounded-sm px-3 py-2 text-left text-sm text-slate transition hover:bg-soft-stone hover:text-ink-black"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-6 py-10 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
