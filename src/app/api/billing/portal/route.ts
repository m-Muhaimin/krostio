import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = currentUser.user
  const supabase = createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('paddle_customer_id, paddle_subscription_id, subscription_status, email')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  return NextResponse.json({
    url: `${appUrl}/dashboard/billing`,
    message: 'Manage your subscription from the billing page. Contact support for changes.',
  })
}
