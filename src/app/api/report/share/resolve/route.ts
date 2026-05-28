import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import { sendEmail, reportSharedEmail } from '@/lib/email'

/**
 * POST /api/report/share/resolve
 *
 * Public endpoint (no auth) called by the /r/[shareToken] email gate page.
 * Resolves a share token to a report ID, logs the viewer email,
 * and returns an access token for the PDF.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceSupabaseClient()
    const body = await request.json()
    const { shareToken, viewer_email } = body

    if (!shareToken) {
      return NextResponse.json({ error: 'Share token is required' }, { status: 400 })
    }

    if (!viewer_email?.trim() || !viewer_email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Look up report by share_token
    const { data: report, error: lookupError } = await supabase
      .from('reports')
      .select('id, user_id, expires_at, is_revoked, viewer_count')
      .eq('share_token', shareToken)
      .single()

    if (lookupError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check expiry
    if (new Date(report.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This report link has expired' }, { status: 410 })
    }

    // Check revocation
    if (report.is_revoked) {
      return NextResponse.json({ error: 'This report has been revoked by the owner' }, { status: 410 })
    }

    // Generate access token
    const viewerToken = crypto.randomUUID()

    // Log view
    const { error: insertError } = await supabase
      .from('report_views')
      .insert({
        report_id: report.id,
        viewer_email: viewer_email.trim(),
        viewer_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        viewer_token: viewerToken,
      })

    if (insertError) {
      console.error('Failed to log report view:', insertError)
      return NextResponse.json({ error: 'Failed to log access' }, { status: 500 })
    }

    // Bump viewer_count
    await supabase
      .from('reports')
      .update({ viewer_count: (report.viewer_count || 0) + 1, last_viewed_at: new Date().toISOString() })
      .eq('id', report.id)

    // Send notification email to viewer
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://krostio.com'
    const pdfUrl = `${appUrl}/api/report/share/${report.id}?vt=${viewerToken}`

    const { data: owner } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', report.user_id)
      .single()

    const viewerName = body.viewer_name || viewer_email.trim().split('@')[0]
    const workerName = owner?.name || 'A worker'
    sendEmail(viewer_email.trim(), `${workerName} shared an income report with you`, reportSharedEmail(viewerName, pdfUrl, workerName))

    return NextResponse.json({ reportId: report.id, accessToken: viewerToken })
  } catch (error: any) {
    console.error('Resolve share error:', error)
    return NextResponse.json({ error: 'Failed to resolve share link' }, { status: 500 })
  }
}
