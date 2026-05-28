'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const pageLabels: Record<string, string> = {
  '/dashboard/worker': 'Dashboard',
  '/dashboard/worker/earnings': 'Earnings',
  '/dashboard/worker/statements': 'Statement',
  '/dashboard/worker/connections': 'Connections',
  '/dashboard/worker/alerts': 'Alerts',
  '/dashboard/worker/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/dashboard/worker/privacy': 'Privacy',
  '/dashboard/billing': 'Billing',
  '/dashboard/lender': 'Dashboard',
  '/dashboard/lender/requests': 'Requests',
  '/dashboard/lender/listings': 'Listings',
}

const pageCtas: Record<string, { label: string; href: string }> = {
  '/dashboard/worker': { label: 'View Statement', href: '/dashboard/worker/statements' },
  '/dashboard/worker/earnings': { label: 'Export CSV', href: '#' },
  '/dashboard/worker/statements': { label: 'New Statement', href: '/dashboard/worker/statements' },
  '/dashboard/worker/connections': { label: '+ Connect Platform', href: '#' },
  '/dashboard/worker/alerts': { label: 'Mark All Read', href: '#' },
  '/dashboard/worker/analytics': { label: 'Export Report', href: '#' },
}

export function DashboardTopbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname()
  const currentLabel = pageLabels[pathname] || 'Dashboard'
  const cta = pageCtas[pathname]

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          onClick={onMenuToggle}
          className="topbar-icon-btn lg:hidden"
          title="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="topbar-breadcrumb">
          <span>Krostio</span>
          <span className="topbar-breadcrumb-sep">/</span>
          <span className="topbar-breadcrumb-current">{currentLabel}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="sync-indicator" aria-live="polite">
          <div className="sync-dot" aria-hidden="true"></div>
          Live · synced 2 min ago
        </div>

        <div className="topbar-icon" title="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div className="topbar-icon" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div className="notif-pip"></div>
        </div>

        {cta && (
          <Link href={cta.href} className="btn-generate">
            {cta.label}
          </Link>
        )}
      </div>
    </header>
  )
}
