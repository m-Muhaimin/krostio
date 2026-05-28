'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function GenerateReportButton({ hasReports }: { hasReports: boolean }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ downloadUrl?: string; shareUrl?: string; expiresAt?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopyShare = async () => {
    if (!result?.shareUrl) return
    try {
      await navigator.clipboard.writeText(result.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select text from a temp input
      const input = document.createElement('input')
      input.value = result.shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

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
      <div className="space-y-4">
        <p className="text-sm font-medium" style={{ color: 'var(--color-deep-green)' }}>Report generated!</p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={result.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ink text-sm"
          >
            Download PDF
          </a>
          <button
            onClick={handleCopyShare}
            className={`btn-outline text-sm ${copied ? '!bg-soft-stone !text-ink-black !border-ink-black' : ''}`}
          >
            {copied ? '✓ Link copied!' : 'Copy share link'}
          </button>
        </div>
        <div className="rounded-lg bg-soft-stone/50 px-4 py-3">
          <p className="text-xs text-slate break-all font-mono">{result.shareUrl}</p>
        </div>
        <p className="text-xs text-muted-slate">
          Recipients will be asked for their email before viewing the report.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-ink text-sm disabled:opacity-50"
      >
        {loading ? 'Generating…' : hasReports ? 'Generate new report' : 'Generate report'}
      </button>
      {error && <p className="text-xs" style={{ color: 'var(--color-error-red)' }}>{error}</p>}
    </div>
  )
}
