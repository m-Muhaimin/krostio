'use client'

import { useState } from 'react'

type ReportView = {
  id: string
  report_id: string
  viewer_email: string | null
  viewed_at: string
}

type Report = {
  id: string
  created_at: string
  expires_at: string
  viewer_count: number | null
  is_expired: boolean
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReportViewsSection({
  views,
  reports,
}: {
  views: ReportView[]
  reports: Report[]
}) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? views : views.slice(0, 10)

  // Build a lookup: report_id → created_at date string
  const reportDateMap = new Map<string, string>()
  for (const r of reports) {
    const d = new Date(r.created_at)
    reportDateMap.set(
      r.id,
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    )
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-soft-stone text-mono-label text-slate">
              <th className="px-5 py-3 font-medium">Viewer email</th>
              <th className="px-5 py-3 font-medium">Report</th>
              <th className="px-5 py-3 font-medium text-right">Viewed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {displayed.map((v) => (
              <tr key={v.id} className="hover:bg-soft-stone transition-colors">
                <td className="px-5 py-4 text-ink-black">
                  {v.viewer_email || (
                    <span className="text-slate italic">No email captured</span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate">
                  Report · {reportDateMap.get(v.report_id) || '—'}
                </td>
                <td className="px-5 py-4 text-right text-slate whitespace-nowrap">
                  {formatDateTime(v.viewed_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {views.length > 10 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-link-blue hover:underline underline-offset-2"
        >
          Show all {views.length} views →
        </button>
      )}

      {views.length === 0 && (
        <p className="text-sm text-slate py-6 text-center">
          No one has viewed your reports yet. Share a report link with a lender to see views here.
        </p>
      )}
    </div>
  )
}
