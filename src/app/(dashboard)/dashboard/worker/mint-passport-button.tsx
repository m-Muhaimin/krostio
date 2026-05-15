'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MintPassportButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleMint = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/passport/attest', {
        method: 'POST',
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to mint passport')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMint}
      disabled={loading}
      className="btn-primary text-xs disabled:opacity-50"
    >
      {loading ? 'Attesting...' : 'Mint Passport →'}
    </button>
  )
}
