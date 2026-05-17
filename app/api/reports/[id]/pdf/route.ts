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

  if (report.is_revoked) {
    return NextResponse.json({ error: 'Report has been revoked' }, { status: 410 });
  }

  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Report has expired' }, { status: 410 });
  }

  if (!report.file_path) {
    return NextResponse.json({ error: 'PDF file not available' }, { status: 404 });
  }

  // Download from Supabase Storage
  const admin = createAdminClient();
  const { data: fileData, error: downloadError } = await admin.storage
    .from('reports')
    .download(report.file_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'PDF file not found in storage' }, { status: 404 });
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="krost-report-${id.slice(0, 8)}.pdf"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}
