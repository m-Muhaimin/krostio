'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RevokeButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false)
  const [revoked, setRevoked] = useState(false)
  const router = useRouter()

  const handleRevoke = async () => {
    if (!confirm('Revoke this report link? Anyone with the link will lose access.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/report/${reportId}/revoke`, { method: 'POST' })
      if (res.ok) {
        setRevoked(true)
        router.refresh()
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }

  if (revoked) {
    return <span className="text-xs text-red-600">Revoked</span>
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? 'Revoking…' : 'Revoke'}
    </button>
  )
}
