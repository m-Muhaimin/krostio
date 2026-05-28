'use client'

import { useState } from 'react'
import { MfaSetup } from '@/components/mfa-setup'

type SettingsTab = 'profile' | 'notifications' | 'security' | 'danger'

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 16c0-4 3-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg viewBox="0 0 18 18" fill="none">
        <path d="M9 2v1M4 7a5 5 0 0110 0v3l2 3H2l2-3V7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M7 15a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg viewBox="0 0 18 18" fill="none">
        <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 8V5a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'danger',
    label: 'Danger zone',
    icon: (
      <svg viewBox="0 0 18 18" fill="none">
        <path d="M9 3l-7 12h14L9 3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="9" cy="13" r=".5" fill="currentColor" />
      </svg>
    ),
  },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  return (
    <div>
      <div className="pg-header fade-in d0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="hero-icon-wrap" style={{ margin: 0 }}>
            <div className="hero-icon hi-stone" style={{ width: 52, height: 52, borderRadius: 14 }}>
              <svg viewBox="0 0 64 64" fill="none" style={{ width: 28, height: 28, color: 'var(--color-muted-slate)' }}>
                <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" strokeWidth="2.5" />
                <path d="M22 22h20M22 34h20M22 40h14M22 46h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="42" cy="24" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div>
            <div className="pg-title">Account Settings</div>
            <div className="pg-sub">Manage your personal details, notification preferences, and account security.</div>
          </div>
        </div>
      </div>

      <div className="settings-layout fade-in d1">
        <nav className="settings-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`set-nav-item${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div>
          {activeTab === 'profile' && <ProfilePanel />}
          {activeTab === 'notifications' && <NotificationsPanel />}
          {activeTab === 'security' && <SecurityPanel />}
          {activeTab === 'danger' && <DangerPanel />}
        </div>
      </div>
    </div>
  )
}

function ProfilePanel() {
  return (
    <div>
      <div className="settings-panel-title">Profile</div>
      <div className="settings-panel-sub">Your personal information</div>

      <div className="settings-section">
        <div className="ss-head">
          <div className="ss-head-icon" style={{ background: 'var(--color-soft-stone)' }}>
            <svg viewBox="0 0 64 64" fill="none" style={{ color: 'var(--color-muted-slate)' }}>
              <circle cx="32" cy="22" r="10" stroke="currentColor" strokeWidth="2.5" />
              <path d="M14 54c0-12 8-20 18-20s18 8 18 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="ss-head-title">Personal details</div>
            <div className="ss-head-sub">Your name and contact information</div>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="sr-label">Full name</div>
            <div className="sr-sub">Displayed on income statements</div>
          </div>
          <div className="sr-right">
            <input type="text" className="input-field" placeholder="Enter your full name" />
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="sr-label">Email address</div>
            <div className="sr-sub">Used for login and notifications</div>
          </div>
          <div className="sr-right">
            <input type="email" className="input-field" disabled />
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="sr-label">Phone</div>
            <div className="sr-sub">Optional contact number</div>
          </div>
          <div className="sr-right">
            <input type="tel" className="input-field" placeholder="Add phone number" />
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationsPanel() {
  return (
    <div>
      <div className="settings-panel-title">Notifications</div>
      <div className="settings-panel-sub">Choose what Krostio notifies you about</div>

      <div className="settings-section">
        <div className="ss-head">
          <div className="ss-head-icon" style={{ background: 'var(--color-soft-stone)' }}>
            <svg viewBox="0 0 64 64" fill="none" style={{ color: 'var(--color-muted-slate)' }}>
              <rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" />
              <path d="M12 28h40" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="28" cy="38" r="3" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="ss-head-title">Email preferences</div>
            <div className="ss-head-sub">Control what emails you receive</div>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="sr-label">Weekly email digest</div>
            <div className="sr-sub">Every Monday — last week&rsquo;s total, top platform, and trend</div>
          </div>
          <div className="sr-right">
            <div className="toggle on" />
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="sr-label">Income drop alerts</div>
            <div className="sr-sub">Notify when income drops more than 20% month-over-month</div>
          </div>
          <div className="sr-right">
            <div className="toggle on" />
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="sr-label">Marketing emails</div>
            <div className="sr-sub">Product updates, tips, and occasional offers</div>
          </div>
          <div className="sr-right">
            <div className="toggle" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SecurityPanel() {
  return (
    <div>
      <div className="settings-panel-title">Security</div>
      <div className="settings-panel-sub">Two-factor authentication and account protection</div>

      <div className="settings-section">
        <div className="ss-head">
          <div className="ss-head-icon" style={{ background: 'var(--color-soft-stone)' }}>
            <svg viewBox="0 0 64 64" fill="none" style={{ color: 'var(--color-muted-slate)' }}>
              <rect x="16" y="12" width="32" height="40" rx="4" stroke="currentColor" strokeWidth="2.5" />
              <path d="M28 30l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="ss-head-title">Two-factor authentication</div>
            <div className="ss-head-sub">Add an extra layer of security to your account</div>
          </div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <MfaSetup />
        </div>
      </div>
    </div>
  )
}

function DangerPanel() {
  return (
    <div>
      <div className="settings-panel-title">Danger zone</div>
      <div className="settings-panel-sub">These actions are permanent and cannot be undone</div>

      <div className="danger-zone">
        <div className="dz-head">
          <div>
            <div className="dz-head-title">Danger zone</div>
            <div className="dz-head-sub">These actions are permanent and cannot be undone</div>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="sr-label" style={{ color: 'var(--color-error-red)' }}>Delete all data</div>
            <div className="sr-sub">Permanently remove all earnings data and statements</div>
          </div>
          <div className="sr-right">
            <button className="btn-danger-outline">Delete data</button>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="sr-label" style={{ color: 'var(--color-error-red)' }}>Close account</div>
            <div className="sr-sub">Cancel subscription and permanently delete your account</div>
          </div>
          <div className="sr-right">
            <button className="btn-danger">Close account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
