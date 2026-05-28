'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brand-logo'
import { DashboardNav } from './dashboard-nav'
import { EmailVerificationBanner } from '@/components/email-verification-banner'
import { ConnectPlaidButton } from '../dashboard/worker/connect-plaid-button'

export function DashboardShell({
  role,
  userId,
  userName,
  userEmail,
  emailVerified,
  children,
}: {
  role: string
  userId: string
  userName: string
  userEmail: string
  emailVerified?: boolean
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const initials = (userName?.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()
    ?? userEmail?.[0]?.toUpperCase()
    ?? '?')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [mobileMenuOpen])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  return (
    <div className="shell">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`sidebar fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:static lg:z-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="sidebar-logo">
          <BrandLogo size="sm" variant="dark" />
          <span className="sidebar-logo-text">Krost<span className="text-coral">io</span></span>
        </div>

        <div className="sidebar-nav">
          <DashboardNav role={role} />
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-upgrade-card">
          <p className="sidebar-upgrade-eyebrow">Active Plan</p>
          <p className="sidebar-upgrade-title">Pro · $14.99/mo</p>
          <p className="sidebar-upgrade-desc">5 platforms · Unlimited PDFs · Weekly digest</p>
          <Link href="/dashboard/billing" className="sidebar-upgrade-btn">Manage</Link>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{userName}</p>
            <p className="sidebar-user-plan">{userEmail}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="topbar-icon-btn flex-shrink-0" title="Sign out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>
      </aside>

      <DashboardTopbarWithToggle onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {emailVerified === false && <EmailVerificationBanner />}

      <main className="main-content min-h-[calc(100vh-60px)] lg:min-h-0">
        <div className="main-content-inner">{children}</div>
      </main>
    </div>
  )
}

import { usePathname } from 'next/navigation'

function DashboardTopbarWithToggle({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname()

  const pageLabels: Record<string, string> = {
    '/dashboard/worker': 'Dashboard',
    '/dashboard/worker/earnings': 'Earnings',
    '/dashboard/worker/statements': 'Statement',
    '/dashboard/worker/report': 'Report',
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

  const currentLabel = pageLabels[pathname] || 'Dashboard'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button onClick={onMenuToggle} className="topbar-icon-btn lg:hidden" title="Toggle menu">
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

      <div className="topbar-right" style={{ gap: 10 }}>
        <ConnectPlaidButton variant="primary" label="Connect" />
        <Link href="/dashboard/worker/report" className="btn-generate">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginRight: -2 }}>
            <rect x="1" y="1" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M4 4.5h5M4 6.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          New Report
        </Link>
      </div>
    </header>
  )
}
