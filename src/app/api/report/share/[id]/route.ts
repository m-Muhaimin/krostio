import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-service'

/**
 * GET /api/report/share/[id]
 * Serves a shared income verification report PDF.
 * Returns 404 if expired or not found.
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

    // Get the file from storage
    const { data: file, error: fileError } = await supabase.storage
      .from('reports')
      .download(report.file_path)

    if (fileError || !file) {
      return NextResponse.json({ error: 'Report file not found' }, { status: 404 })
    }

    // Track view (fire and forget)
    supabase
      .from('reports')
      .update({
        viewer_count: (report.viewer_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .then()

    // Return PDF
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="income-verification-${id.slice(0, 8)}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error('Share link error:', error)
    return NextResponse.json({ error: 'Failed to load report' }, { status: 500 })
  }
}
