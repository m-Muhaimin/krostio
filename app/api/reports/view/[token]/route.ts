import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const admin = createAdminClient();

  const { data: report, error } = await admin
    .from('reports')
    .select('id, report_type, score_snapshot, ledger_snapshot, is_revoked, expires_at, created_at, viewer_count')
    .eq('share_token', token)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (report.is_revoked) {
    return NextResponse.json({ error: 'This report has been revoked' }, { status: 410 });
  }

  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This report has expired' }, { status: 410 });
  }

  return NextResponse.json({
    id: report.id,
    report_type: report.report_type,
    score_snapshot: report.score_snapshot,
    ledger_snapshot: report.ledger_snapshot,
    is_revoked: report.is_revoked,
    expires_at: report.expires_at,
    created_at: report.created_at,
    viewer_count: report.viewer_count ?? 0,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { email } = await request.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Look up report by share token
  const { data: report, error: reportError } = await admin
    .from('reports')
    .select('id, report_type, score_snapshot, ledger_snapshot, is_revoked, expires_at, created_at, viewer_count')
    .eq('share_token', token)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (report.is_revoked) {
    return NextResponse.json({ error: 'This report has been revoked' }, { status: 410 });
  }

  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This report has expired' }, { status: 410 });
  }

  // Log the view
  const { error: viewError } = await admin
    .from('report_views')
    .insert({
      report_id: report.id,
      viewer_email: email,
      viewer_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

  if (viewError) {
    console.warn('Failed to log report view:', viewError.message);
  }

  // Update viewer count on report
  await admin
    .from('reports')
    .update({
      viewer_count: (report.viewer_count ?? 0) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq('id', report.id);

  return NextResponse.json({
    success: true,
    report: {
      id: report.id,
      report_type: report.report_type,
      score_snapshot: report.score_snapshot,
      ledger_snapshot: report.ledger_snapshot,
      is_revoked: report.is_revoked,
      expires_at: report.expires_at,
      created_at: report.created_at,
      viewer_count: (report.viewer_count ?? 0) + 1,
    },
  });
}
