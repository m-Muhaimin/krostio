'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  badge?: string
  icon: React.ReactNode
}

interface Section {
  label: string
  items: NavItem[]
}

const OverviewIcon = () => (
  <svg className="nav-icon" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)

const EarningsIcon = () => (
  <svg className="nav-icon" viewBox="0 0 18 18" fill="none">
    <path d="M2 14l4-8 4 5 2-3 4 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const StatementsIcon = () => (
  <svg className="nav-icon" viewBox="0 0 18 18" fill="none">
    <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const ConnectionsIcon = () => (
  <svg className="nav-icon" viewBox="0 0 18 18" fill="none">
    <circle cx="5" cy="9" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="13" cy="9" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 9h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const AnalyticsIcon = () => (
  <svg className="nav-icon" viewBox="0 0 18 18" fill="none">
    <path d="M2 12l5-5 4 4 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SettingsIcon = () => (
  <svg className="nav-icon" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4 4l1.5 1.5M12.5 12.5 14 14M4 14l1.5-1.5M12.5 5.5 14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const PrivacyIcon = () => (
  <svg className="nav-icon" viewBox="0 0 18 18" fill="none">
    <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const workerSections: Section[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard/worker', icon: <OverviewIcon /> },
      { label: 'Earnings', href: '/dashboard/worker/earnings', icon: <EarningsIcon /> },
      { label: 'Statement', href: '/dashboard/worker/statements', icon: <StatementsIcon /> },
      { label: 'Report', href: '/dashboard/worker/report', icon: <StatementsIcon /> },
    ],
  },
  {
    label: 'Platforms',
    items: [
      { label: 'Connections', href: '/dashboard/worker/connections', icon: <ConnectionsIcon /> },
      { label: 'Analytics', href: '/dashboard/worker/analytics', icon: <AnalyticsIcon /> },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: <SettingsIcon /> },
      { label: 'Privacy', href: '/dashboard/worker/privacy', icon: <PrivacyIcon /> },
    ],
  },
]

const lenderSections: Section[] = [
  {
    label: 'Lending',
    items: [
      { label: 'Dashboard', href: '/dashboard/lender', icon: <OverviewIcon /> },
      { label: 'Requests', href: '/dashboard/lender/requests', icon: <ConnectionsIcon /> },
      { label: 'Listings', href: '/dashboard/lender/listings', icon: <AnalyticsIcon /> },
    ],
  },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard/worker') {
    return pathname === '/dashboard/worker'
  }
  return pathname.startsWith(href)
}

export function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname()
  const sections = role === 'lender' ? lenderSections : workerSections

  return (
    <>
      {sections.map((section) => (
        <div key={section.label} className="sidebar-nav-section-wrap">
          <p className="sidebar-nav-section">{section.label}</p>
          {section.items.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item"
                data-active={active || undefined}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            )
          })}
        </div>
      ))}
    </>
  )
}
