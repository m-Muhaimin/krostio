import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { calculateCreditScore } from '@/lib/scoring-engine'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { platform, records } = await request.json()

  if (!platform || !records || !Array.isArray(records)) {
    return NextResponse.json({ error: 'Platform and records required' }, { status: 400 })
  }

  // Store the income records
  const { error: insertError } = await supabase.from('income_records').insert(
    records.map((r: any) => ({
      user_id: user.id,
      platform,
      ...r,
    }))
  )

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Calculate new score
  const { data: allRecords } = await supabase
    .from('income_records')
    .select('*')
    .eq('user_id', user.id)

  if (!allRecords || allRecords.length === 0) {
    return NextResponse.json({ message: 'Records stored, not enough data for score' })
  }

  const score = calculateCreditScore(allRecords, user.id)

  // Save or update score
  const { data: existingScore } = await supabase
    .from('credit_scores')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingScore) {
    await supabase
      .from('credit_scores')
      .update({
        ...score,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', existingScore.id)
  } else {
    await supabase.from('credit_scores').insert({
      ...score,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  return NextResponse.json({ score })
}
