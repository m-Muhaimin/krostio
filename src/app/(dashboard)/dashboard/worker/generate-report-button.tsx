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
      <div className="space-y-3">
        <p className="text-sm text-green-800">Report generated!</p>
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
            className={`btn-outline text-sm ${copied ? '!bg-emerald-50 !text-emerald-700 !border-emerald-300' : ''}`}
          >
            {copied ? '✓ Link copied!' : 'Copy share link'}
          </button>
        </div>
        <p className="text-xs text-slate break-all">
          Share: <span className="font-mono text-slate/70">{result.shareUrl}</span>
        </p>
        <p className="text-xs text-slate">
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
        className="btn-signal text-sm disabled:opacity-50"
      >
        {loading ? 'Generating…' : hasReports ? 'Generate new report' : 'Generate report'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
