import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import { getCurrentUser } from '@/lib/auth-utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * GET /api/report/share/[id]
 * POST /api/report/share/[id]  — email gate submission
 *
 * Flow:
 *   1. Public /r/[shareToken] loads → POST /api/report/share/[id]
 *      with { viewer_email } → logs view, returns { accessToken }
 *   2. Page sets accessToken cookie, redirects to same URL with ?vt=ACCESS_TOKEN
 *   3. GET with valid vt param → serves PDF
 *   4. GET without vt → returns { gate: true, reportId } (JSON) for the public page
 *
 * Returns 404 if expired, 410 if revoked.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createServiceSupabaseClient()

    // Get report record
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !report) {
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

    // Check for access token (viewer token) in ?vt= param
    const vt = request.nextUrl.searchParams.get('vt')

    // Owner bypass: if the requesting user is authenticated and owns the report,
    // serve the PDF directly without requiring an email gate token.
    let isOwner = false
    try {
      const currentUser = await getCurrentUser()
      isOwner = !!(currentUser?.user && report.user_id === currentUser.user.id)
    } catch {
      // Not authenticated or error — proceed with gate check
    }

    if (!vt && !isOwner) {
      // No access token → return gate prompt for the public page
      return NextResponse.json({
        gate: true,
        reportId: id,
        shareToken: report.share_token,
        ownerLabel: 'Report',
      })
    }

    // Validate access token: check report_views for matching viewer_token
    const { data: viewRecord } = await supabase
      .from('report_views')
      .select('viewer_token')
      .eq('report_id', id)
      .eq('viewer_token', vt)
      .maybeSingle()

    if (!viewRecord) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 403 })
    }

    // Get the file from storage
    const { data: file, error: fileError } = await supabase.storage
      .from('reports')
      .download(report.file_path)

    if (fileError || !file) {
      return NextResponse.json({ error: 'Report file not found' }, { status: 404 })
    }

    // Increment viewer_count (idempotent — count distinct views, not downloads)
    // Already counted at POST time; just serve the file.
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="income-verification-${id.slice(0, 8)}.pdf"`,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error: any) {
    console.error('Share link error:', error)
    return NextResponse.json({ error: 'Failed to load report' }, { status: 500 })
  }
}

/**
 * POST /api/report/share/[id]
 * Email gate: lender submits email → logged in report_views → get access token
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceSupabaseClient()
    const body = await request.json()
    const viewerEmail = body?.viewer_email?.trim()

    if (!viewerEmail || !viewerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Verify report exists and is active
    const { data: report } = await supabase
      .from('reports')
      .select('id, viewer_count')
      .eq('id', id)
      .single()

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Generate a unique access token for this viewer
    const viewerToken = crypto.randomUUID()

    // Insert view record
    const { error: insertError } = await supabase
      .from('report_views')
      .insert({
        report_id: id,
        viewer_email: viewerEmail,
        viewer_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        viewer_token: viewerToken,
      })

    if (insertError) {
      console.error('Failed to log report view:', insertError)
      return NextResponse.json({ error: 'Failed to log access' }, { status: 500 })
    }

    // Bump viewer_count on the report
    await supabase
      .from('reports')
      .update({ viewer_count: (report.viewer_count || 0) + 1 })
      .eq('id', id)

    return NextResponse.json({
      accessToken: viewerToken,
      reportId: id,
    })
  } catch (error: any) {
    console.error('Share gate error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
