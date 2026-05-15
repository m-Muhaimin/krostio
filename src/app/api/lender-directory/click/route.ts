import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceSupabaseClient } from '@/lib/supabase-service'

export async function POST(req: NextRequest) {
  let lenderId: string | undefined
  try {
    const body = await req.json()
    lenderId = body?.lenderId
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (!lenderId || typeof lenderId !== 'string') {
    return NextResponse.json({ error: 'missing_lender_id' }, { status: 400 })
  }

  // Auth — may be null (anonymous click is OK)
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = createServiceSupabaseClient()

  // Fetch lender (must be active)
  const { data: lender, error: lenderErr } = await service
    .from('lender_profiles')
    .select('id, application_url, referral_fee_cents, active')
    .eq('id', lenderId)
    .eq('active', true)
    .single()

  if (lenderErr || !lender) {
    return NextResponse.json({ error: 'lender_not_found' }, { status: 404 })
  }

  // Snapshot the worker's current consistency score (if authenticated)
  let scoreSnapshot: number | null = null
  if (user?.id) {
    const { data: latest } = await service
      .from('income_verifications')
      .select('consistency_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    scoreSnapshot = latest?.consistency_score ?? null
  }

  // Generate short, URL-safe ref code
  const refCode = crypto.randomBytes(6).toString('base64url')

  const userAgent = req.headers.get('user-agent') ?? null
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null

  const { error: insertErr } = await service.from('lender_referrals').insert({
    worker_id: user?.id ?? null,
    lender_id: lender.id,
    ref_code: refCode,
    estimated_payout_cents: lender.referral_fee_cents ?? 0,
    user_agent: userAgent,
    ip_address: ip,
    consistency_score_at_click: scoreSnapshot,
  })

  if (insertErr) {
    return NextResponse.json({ error: 'tracking_failed' }, { status: 500 })
  }

  const base = lender.application_url
  const separator = base.includes('?') ? '&' : '?'
  const redirectUrl = `${base}${separator}ref=krost_${refCode}`

  return NextResponse.json({ redirectUrl })
}
