'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function DashboardRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  const upgraded = searchParams.get('upgraded') === 'true'
  const plan = searchParams.get('plan')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (upgraded) {
        router.replace('/dashboard/billing?upgraded=true')
        return
      }

      if (plan === 'worker') {
        router.replace('/dashboard/billing?start=worker')
        return
      }

      router.replace('/dashboard/worker')
      setLoading(false)
    }
    load()
  }, [router, supabase, upgraded, plan])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
          <p className="text-mono-label text-slate">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return null
}

export default function DashboardRedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
      </div>
    }>
      <DashboardRedirect />
    </Suspense>
  )
}
