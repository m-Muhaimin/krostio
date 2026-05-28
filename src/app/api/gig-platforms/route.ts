import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  const { platform, platform_user_id } = await request.json()

  if (!platform) {
    return NextResponse.json({ error: 'Platform is required' }, { status: 400 })
  }

  // Upsert platform connection
  const { data, error } = await supabase
    .from('platform_connections')
    .upsert({
      user_id: user.id,
      platform,
      platform_user_id: platform_user_id || `${user.id}_${platform}`,
      is_active: true,
      last_sync_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ connection: data })
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  const { data: connections } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('user_id', user.id)

  return NextResponse.json({ connections: connections || [] })
}
