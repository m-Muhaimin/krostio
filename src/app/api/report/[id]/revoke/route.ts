import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * POST /api/report/[id]/revoke
 * Revokes a shared report link. Only the owner can revoke.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the report belongs to this user
    const { data: report } = await supabase
      .from('reports')
      .select('id, is_revoked')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (report.is_revoked) {
      return NextResponse.json({ message: 'Report was already revoked' })
    }

    // Revoke it
    const { error } = await supabase
      .from('reports')
      .update({ is_revoked: true })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Report revoked successfully' })
  } catch (error: any) {
    console.error('Revoke error:', error)
    return NextResponse.json({ error: error.message || 'Failed to revoke report' }, { status: 500 })
  }
}
