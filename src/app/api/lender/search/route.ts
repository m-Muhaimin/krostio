import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceSupabaseClient } from '@/lib/supabase-service'

/**
 * GET /api/lender/search?q=alice
 *
 * Lender-only endpoint. Searches the profiles table for gig_worker accounts by
 * email or name, returns a redacted summary (name initials, platforms list,
 * tenure, monthly avg) plus the score IF the lender already has an approved
 * lender_request for that worker. Otherwise score is null.
 *
 * Uses the service-role client to bypass profiles RLS for search, then redacts
 * the response before returning.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the caller is a lender
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'lender') {
    return NextResponse.json({ error: 'Lender access only' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  if (!q) {
    return NextResponse.json({ workers: [] })
  }

  const service = createServiceSupabaseClient()

  // Search workers by email or name (case-insensitive)
  const { data: workers, error: searchErr } = await service
    .from('profiles')
    .select('id, name, email')
    .eq('role', 'gig_worker')
    .or(`email.ilike.%${q}%,name.ilike.%${q}%`)
    .limit(25)

  if (searchErr) {
    return NextResponse.json({ error: searchErr.message }, { status: 500 })
  }
  if (!workers || workers.length === 0) {
    return NextResponse.json({ workers: [] })
  }

  const workerIds = workers.map((w) => w.id)

  // Fetch lender_requests for this lender against these workers
  const { data: requests } = await service
    .from('lender_requests')
    .select('worker_id, status')
    .eq('lender_id', user.id)
    .in('worker_id', workerIds)

  const statusByWorker = new Map<string, string>()
  for (const r of requests ?? []) {
    statusByWorker.set(r.worker_id, r.status)
  }

  // Fetch credit scores (only for workers whose request is approved)
  const approvedIds = (requests ?? [])
    .filter((r) => r.status === 'approved')
    .map((r) => r.worker_id)

  let scoresByWorker = new Map<string, any>()
  if (approvedIds.length > 0) {
    const { data: scores } = await service
      .from('income_verifications')
      .select('user_id, consistency_score, monthly_avg_income, tenure_months, platform_diversity, annualized_income, lender_ready_status')
      .in('user_id', approvedIds)
    for (const s of scores ?? []) {
      scoresByWorker.set(s.user_id, s)
    }
  }

  // Fetch a coarse "platforms active" list for each worker (always visible — non-PII)
  const { data: connections } = await service
    .from('platform_connections')
    .select('user_id, platform')
    .in('user_id', workerIds)
    .eq('is_active', true)

  const platformsByWorker = new Map<string, string[]>()
  for (const c of connections ?? []) {
    const list = platformsByWorker.get(c.user_id) ?? []
    if (!list.includes(c.platform)) list.push(c.platform)
    platformsByWorker.set(c.user_id, list)
  }

  // Redact: don't return full email, only first initial of name + masked email
  const redactName = (name: string | null, email: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/)
      const first = parts[0]
      const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0) + '.' : ''
      return `${first} ${lastInitial}`.trim()
    }
    if (email) {
      const [local] = email.split('@')
      return `${local.charAt(0).toUpperCase()}${local.slice(1, 2)}.`
    }
    return 'Worker'
  }

  const redactEmail = (email: string | null) => {
    if (!email) return null
    const [local, domain] = email.split('@')
    if (!domain) return null
    const visible = local.slice(0, 2)
    return `${visible}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`
  }

  const result = workers.map((w) => {
    const score = scoresByWorker.get(w.id)
    const requestStatus = statusByWorker.get(w.id) ?? null
    return {
      id: w.id,
      display_name: redactName(w.name, w.email),
      masked_email: redactEmail(w.email),
      platforms: platformsByWorker.get(w.id) ?? [],
      request_status: requestStatus, // null | 'pending' | 'approved' | 'denied'
      // Score only revealed if approved
      consistency_score: score?.consistency_score ?? null,
      monthly_avg_income: score?.monthly_avg_income ?? null,
      annualized_income: score?.annualized_income ?? null,
      tenure_months: score?.tenure_months ?? null,
      platform_diversity: score?.platform_diversity ?? null,
      lender_ready_status: score?.lender_ready_status ?? null,
    }
  })

  return NextResponse.json({ workers: result })
}
