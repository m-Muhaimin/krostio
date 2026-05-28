import { requireRole } from '@/lib/auth-guard'
import { ConnectionsUI } from './connections-ui'

export default async function ConnectionsPage() {
  await requireRole(['gig_worker'])

  return (
    <div>
      <div className="pg-header fade-in d0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hero-icon-wrap" style={{ margin: 0 }}>
            <div className="hero-icon hi-blue" style={{ width: 52, height: 52, borderRadius: 14 }}>
              <svg viewBox="0 0 64 64" fill="none" style={{ color: 'var(--action-blue)' }}>
                <circle cx="16" cy="32" r="10" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="48" cy="32" r="10" stroke="currentColor" strokeWidth="2.5" />
                <path d="M26 32h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M32 20V12M32 52v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3,3" />
              </svg>
            </div>
          </div>
          <div>
            <div className="pg-title">Connect Your Platforms</div>
            <div className="pg-sub">
              Link your bank to detect gig deposits from Uber, DoorDash, Upwork, and more. We use Plaid — the same standard banks use.
            </div>
          </div>
        </div>
      </div>

      <ConnectionsUI />
    </div>
  )
}
