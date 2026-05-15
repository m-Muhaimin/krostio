'use client'

import { useState, FormEvent } from 'react'

export function ReportGateClient({ shareToken }: { shareToken: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Step 1: Resolve shareToken to report ID via a lightweight lookup
      // We POST to a public endpoint that resolves the share token and logs the email
      const resolveRes = await fetch('/api/report/share/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareToken, viewer_email: email }),
      })

      if (!resolveRes.ok) {
        const errBody = await resolveRes.json()
        setError(errBody.error || 'Failed to access report')
        return
      }

      const { reportId, accessToken } = await resolveRes.json()

      if (accessToken) {
        // Step 2: Redirect to the PDF with the access token as a query param
        window.location.href = `/api/report/share/${reportId}?vt=${accessToken}`
      }
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="viewer-email" className="block text-sm font-medium text-ink-black mb-1.5">
          Your email address
        </label>
        <input
          id="viewer-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="lender@bank.com"
          className="input-pill w-full"
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-ink w-full justify-center text-sm disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Access report'}
      </button>

      {error && (
        <p className="text-xs text-center" style={{ color: 'var(--color-error-red)' }}>
          {error}
        </p>
      )}

      <p className="text-center text-xs text-slate">
        Your email will only be used to verify access.
        The worker who shared this report can see who viewed it.
      </p>
    </form>
  )
}
