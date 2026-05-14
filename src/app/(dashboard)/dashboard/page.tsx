'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function DashboardRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  // Came back from Stripe Checkout (success_url)
  const upgraded = searchParams.get('upgraded') === 'true'
  // Came in with a plan intent from landing/pricing
  const plan = searchParams.get('plan')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // 1. Stripe just sent the user back — route to billing so they see the updated plan.
      if (upgraded) {
        router.replace('/dashboard/billing?upgraded=true')
        return
      }

      // 2. User signed up via a plan CTA — auto-open the checkout flow.
      if (plan === 'worker' || plan === 'lender') {
        router.replace(`/dashboard/billing?start=${plan}`)
        return
      }

      // 3. Normal role-based home.
      if (profile?.role === 'lender') {
        router.push('/dashboard/lender')
      } else {
        router.push('/dashboard/worker')
      }
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
