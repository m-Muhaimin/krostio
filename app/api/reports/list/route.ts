import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('reports')
    .select('id, report_type, score_snapshot, share_token, expires_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    // Table might not exist — return empty
    return NextResponse.json({
      reports: [],
    });
  }

  const reports = (data || []).map((report: any) => ({
    id: report.id,
    type: report.report_type || 'standard_pdf',
    score: report.score_snapshot?.total ?? null,
    tier: report.score_snapshot?.tier ?? null,
    shareToken: report.share_token,
    shareUrl: report.share_token ? `/reports/view/${report.share_token}` : null,
    expiresAt: report.expires_at,
    createdAt: report.created_at,
  }));

  return NextResponse.json({
    reports,
  });
}
