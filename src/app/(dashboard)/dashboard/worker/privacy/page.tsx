import { requireRole } from '@/lib/auth-guard'

export default async function PrivacyPage() {
  await requireRole(['gig_worker'])

  return (
    <div>
      <div className="pg-header fade-in d0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hero-icon-wrap" style={{ margin: 0 }}>
            <div className="hero-icon hi-dark" style={{ width: 52, height: 52, borderRadius: 14 }}>
              <svg viewBox="0 0 64 64" fill="none" style={{ width: 28, height: 28 }}>
                <rect x="12" y="26" width="40" height="32" rx="6" stroke="white" strokeWidth="2.5" />
                <path d="M20 26V20a12 12 0 0124 0v6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="32" cy="42" r="5" fill="white" />
                <path d="M32 44v4" stroke="#003c33" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div>
            <div className="pg-title">Your Data, Your Control</div>
            <div className="pg-sub">Krostio is built on a simple principle: your income data belongs to you. We aggregate it, you own it, and you can delete it anytime.</div>
          </div>
        </div>
      </div>

      <div className="privacy-pillars fade-in d1">
        <div className="pillar-card">
          <div className="pillar-icon" style={{ background: 'var(--color-pale-blue)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="6" y="17" width="24" height="16" rx="4" stroke="var(--color-action-blue)" strokeWidth="2.5" />
              <path d="M11 17V12a7 7 0 0114 0v5" stroke="var(--color-action-blue)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="25" r="3" fill="var(--color-action-blue)" />
            </svg>
          </div>
          <div className="pillar-title">Zero credential storage</div>
          <div className="pillar-desc">We never store your passwords. Plaid OAuth tokens are encrypted at rest. You can disconnect any platform with one click — access is immediately revoked.</div>
        </div>
        <div className="pillar-card">
          <div className="pillar-icon" style={{ background: 'var(--color-pale-green)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M6 18l8-8 6 6 10-10" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="4" y="4" width="28" height="28" rx="6" stroke="var(--color-success)" strokeWidth="2" opacity=".3" />
            </svg>
          </div>
          <div className="pillar-title">You own your statements</div>
          <div className="pillar-desc">Every PDF is self-generated and self-owned. Krostio doesn&apos;t share your statements with lenders, landlords, or any third party. Only you decide who sees your income.</div>
        </div>
        <div className="pillar-card">
          <div className="pillar-icon" style={{ background: 'var(--color-coral-pale)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4l12 6v10c0 7-5.4 13.6-12 16-6.6-2.4-12-9-12-16V10l12-6z" stroke="var(--color-coral)" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M13 18l3 3 7-7" stroke="var(--color-coral)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="pillar-title">Right to deletion</div>
          <div className="pillar-desc">Request deletion of all your data at any time. We permanently remove your earnings history, statements, and account data within 24 hours — no questions asked.</div>
        </div>
      </div>

      <div className="data-export-card fade-in d2">
        <div className="dec-icon">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M16 4v16M10 14l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 24v2a2 2 0 002 2h20a2 2 0 002-2v-2" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="dec-title">Export all your data</div>
          <div className="dec-sub">Download a complete export of your earnings history, statements, and account data in JSON or CSV format. GDPR and CCPA compliant.</div>
        </div>
        <div className="dec-actions">
          <button className="btn-white">Export as CSV</button>
          <button className="btn-ghost-white">Export as JSON</button>
        </div>
      </div>

      <div className="card fade-in d3">
        <div className="card-head">
          <div>
            <div className="card-title">Data we collect</div>
            <div className="card-sub">Transparent breakdown of what Krostio stores</div>
          </div>
        </div>
        <div className="settings-row">
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="pref-icon" style={{ background: 'var(--color-pale-green)', width: 44, height: 44, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 18l5-7 5 6 3-4 3 5" stroke="var(--color-success)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="sr-label">Earnings transactions</div>
              <div className="sr-sub">Merchant-level transaction data from Plaid — amounts, dates, platform names. Not your full bank statement.</div>
            </div>
          </div>
          <span className="badge badge-green">Collected</span>
        </div>
        <div className="settings-row">
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="pref-icon" style={{ background: 'var(--color-soft-stone)', width: 44, height: 44, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="9" r="4" stroke="var(--color-slate)" strokeWidth="1.8" />
                <path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="var(--color-slate)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="sr-label">Account credentials</div>
              <div className="sr-sub">We never see or store your bank or gig platform passwords. Plaid handles all authentication independently.</div>
            </div>
          </div>
          <span className="badge badge-slate">Never collected</span>
        </div>
        <div className="settings-row">
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="pref-icon" style={{ background: 'var(--color-soft-stone)', width: 44, height: 44, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 11h16M11 3l8 8-8 8" stroke="var(--color-slate)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="sr-label">Data sold to third parties</div>
              <div className="sr-sub">Your income data is never sold, shared with advertisers, or provided to lenders without your explicit action.</div>
            </div>
          </div>
          <span className="badge badge-slate">Never</span>
        </div>
      </div>
    </div>
  )
}
