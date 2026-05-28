'use client'

import { useState } from 'react'

export function EmailVerificationBanner() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (data.already_verified) {
        window.location.reload()
        return
      }
      setSent(true)
    } catch {}
    finally { setSending(false) }
  }

  return (
    <div style={{ background: 'var(--color-warning-bg)', borderBottom: '1px solid rgba(234,179,8,0.2)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 13 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L1 14h14L8 1z" stroke="#a16207" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 5.5v3M8 10.5v.5" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span style={{ color: '#a16207' }}>
        {sent
          ? 'Verification email sent! Check your inbox.'
          : 'Please verify your email address to unlock all features.'
        }
      </span>
      {!sent && (
        <button
          onClick={handleResend}
          disabled={sending}
          style={{ background: 'none', border: '1px solid #a16207', borderRadius: 40, padding: '4px 14px', fontSize: 12, color: '#a16207', cursor: 'pointer' }}
        >
          {sending ? 'Sending\u2026' : 'Resend email'}
        </button>
      )}
    </div>
  )
}
