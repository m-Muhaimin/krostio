'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function GenerateReportButton({ hasReports }: { hasReports: boolean }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ downloadUrl?: string; shareUrl?: string; expiresAt?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/report/generate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        if (data.upgrade) {
          // Redirect to billing for upgrade
          window.location.href = '/dashboard/billing?start=worker'
          return
        }
        setError(data.error || 'Failed to generate report')
        setLoading(false)
        return
      }
      setResult(data)
      setLoading(false)
    } catch (err) {
      setError((err as Error).message || 'Network error')
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-green-800">Report generated!</p>
        <div className="flex gap-3">
          <a
            href={result.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ink text-sm"
          >
            Download PDF
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(result.shareUrl!)
              alert('Share link copied!')
            }}
            className="btn-outline text-sm"
          >
            Copy share link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-signal text-sm disabled:opacity-50"
      >
        {loading ? 'Generating…' : hasReports ? 'Generate new report' : 'Generate report'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
