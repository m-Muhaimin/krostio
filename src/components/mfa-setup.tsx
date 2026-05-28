'use client'

import { useState, useEffect } from 'react'

export function MfaSetup() {
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'done'>('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [disableCode, setDisableCode] = useState('')

  useEffect(() => {
    fetch('/api/auth/mfa/status', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setMfaEnabled(d.mfa_enabled); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSetup = async () => {
    setError('')
    try {
      const res = await fetch('/api/auth/mfa/setup', {
        method: 'POST', credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setStep('setup')
    } catch { setError('Failed to start setup') }
  }

  const handleVerify = async () => {
    setError('')
    try {
      const res = await fetch('/api/auth/mfa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setMfaEnabled(true)
      setStep('done')
    } catch { setError('Verification failed') }
  }

  const handleDisable = async () => {
    setError('')
    try {
      const res = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disableCode }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setMfaEnabled(false)
      setStep('idle')
      setDisableCode('')
    } catch { setError('Failed to disable MFA') }
  }

  if (loading) return null

  return (
    <div>
      {mfaEnabled ? (
        <div className="settings-row">
          <div>
            <div className="sr-label">Two-factor authentication</div>
            <div className="sr-sub" style={{ color: 'var(--color-success)' }}>Enabled · Use your authenticator app to sign in</div>
          </div>
          <div className="sr-right" style={{ flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {step === 'done' && (
              <div className="text-xs" style={{ color: 'var(--color-success)', marginBottom: 4 }}>MFA enabled successfully</div>
            )}
            {error && <div className="text-xs" style={{ color: 'var(--color-error-red)', marginBottom: 4 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={disableCode}
                onChange={e => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-pill"
                style={{ width: 120, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13 }}
              />
              <button
                onClick={handleDisable}
                disabled={disableCode.length !== 6}
                className="btn-danger-outline"
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                Disable
              </button>
            </div>
          </div>
        </div>
      ) : step === 'setup' ? (
        <div className="settings-row" style={{ flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="sr-label">Scan QR code</div>
            <div className="sr-sub">Scan this with your authenticator app (Google Authenticator, Authy, etc.)</div>
          </div>
          {qrCode && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <img src={qrCode} alt="MFA QR code" style={{ width: 180, height: 180 }} />
              <code style={{ fontSize: 11, color: 'var(--color-muted-slate)', wordBreak: 'break-all', textAlign: 'center', maxWidth: 260 }}>
                {secret}
              </code>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000 000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-pill"
              style={{ width: 140, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 16, letterSpacing: '0.2em' }}
              autoFocus
            />
            <button
              onClick={handleVerify}
              disabled={code.length !== 6}
              className="btn-sm-primary"
            >
              Verify & Enable
            </button>
          </div>
          {error && <div className="text-xs" style={{ color: 'var(--color-error-red)' }}>{error}</div>}
          <button onClick={() => setStep('idle')} className="text-xs" style={{ color: 'var(--color-muted-slate)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', alignSelf: 'flex-start' }}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="settings-row">
          <div>
            <div className="sr-label">Two-factor authentication</div>
            <div className="sr-sub">Add an extra layer of security to your account</div>
          </div>
          <div className="sr-right">
            <button onClick={handleSetup} className="btn-sm-primary">Set up</button>
          </div>
        </div>
      )}
    </div>
  )
}
