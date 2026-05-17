import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: report.id,
    report_type: report.report_type,
    score_snapshot: report.score_snapshot,
    ledger_snapshot: report.ledger_snapshot,
    share_token: report.share_token,
    share_url: report.share_token ? `/reports/view/${report.share_token}` : null,
    file_path: report.file_path,
    file_size: report.file_size,
    is_revoked: report.is_revoked,
    viewer_count: report.viewer_count ?? 0,
    last_viewed_at: report.last_viewed_at,
    expires_at: report.expires_at,
    created_at: report.created_at,
  });
}
