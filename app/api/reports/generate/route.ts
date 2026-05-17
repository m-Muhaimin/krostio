import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { renderToStream } from '@react-pdf/renderer';
import { KrostReport } from '@/lib/report-generator';
import { calculateKrostScore, getScoreTier } from '@/lib/scoring-engine';
import React from 'react';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportType, expiryDays } = await request.json();

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch ledger summary
  const { data: entries } = await supabase
    .from('income_verifications')
    .select('gross_amount, net_amount, period_start, platform')
    .eq('user_id', user.id)
    .order('period_start', { ascending: false });

  const ledgerEntries = entries || [];

  // Compute score from real data
  const platforms = new Set(ledgerEntries.map((e: any) => e.platform));
  const months = new Set(ledgerEntries.map((e: any) => e.period_start?.substring(0, 7)));
  const totalMonths = months.size;

  // Monthly breakdown
  const monthlyMap = new Map<string, { gross: number; net: number; count: number }>();
  for (const e of ledgerEntries) {
    const m = e.period_start?.substring(0, 7) || 'unknown';
    const existing = monthlyMap.get(m) || { gross: 0, net: 0, count: 0 };
    existing.gross += Number(e.gross_amount) || 0;
    existing.net += Number(e.net_amount) || 0;
    existing.count += 1;
    monthlyMap.set(m, existing);
  }

  const monthlyBreakdown = Array.from(monthlyMap.entries())
    .map(([month, d]) => ({
      month: month + '-01',
      gross_total: d.gross,
      net_total: d.net,
      payment_count: d.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const totalEarnings = ledgerEntries.reduce((sum: number, e: any) => sum + (Number(e.gross_amount) || 0), 0);
  const avgMonthly = totalMonths > 0 ? totalEarnings / totalMonths : 0;

  // Calculate volatility
  const monthlyValues = monthlyBreakdown.map(m => m.gross_total);
  const mean = monthlyValues.reduce((a, b) => a + b, 0) / (monthlyValues.length || 1);
  const variance = monthlyValues.reduce((sq, v) => sq + (v - mean) ** 2, 0) / (monthlyValues.length || 1);
  const volatility = mean > 0 ? Math.sqrt(variance) / mean : 0;

  const scoreResult = calculateKrostScore({
    avgMonthlyIncome: avgMonthly,
    platformTenureMonths: totalMonths,
    incomeVolatility: Math.min(1, volatility),
    platformDiversity: platforms.size,
    earningConsistency: monthlyBreakdown.filter(m => m.gross_total > 0).length / (monthlyBreakdown.length || 1),
    incomeTrajectory: 0.05, // approximating — would need month-over-month calc
    taxCompliance: 0,
    crossPlatformGrowth: platforms.size / Math.max(1, totalMonths),
    ledgerDepth: totalMonths,
  });

  // Store score
  const admin = createAdminClient();
  await admin.from('krost_scores').insert({
    user_id: user.id,
    score: scoreResult.total,
    score_tier: scoreResult.tier,
    factors: scoreResult.factors as any,
    income_snapshot: { avgMonthlyIncome: avgMonthly, platformTenureMonths: totalMonths, platformDiversity: platforms.size } as any,
  });

  // Generate PDF
  const reportData = {
    workerName: profile?.full_name || '',
    workerEmail: user.email || '',
    score: scoreResult.total,
    scoreTier: scoreResult.tier,
    factors: scoreResult.factors,
    avgMonthlyIncome: avgMonthly,
    totalPlatforms: platforms.size,
    tenureMonths: totalMonths,
    totalEarnings,
    monthlyBreakdown,
    generatedAt: new Date().toISOString().split('T')[0],
  };

  const pdfStream = await renderToStream(React.createElement(KrostReport, { data: reportData }) as any);
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
    pdfStream.on('error', reject);
  });

  // Upload to Supabase Storage
  const reportId = crypto.randomUUID();
  const fileName = `${user.id}/reports/${reportId}.pdf`;

  const { error: uploadError } = await admin.storage
    .from('reports')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    // Bucket may not exist — store without PDF path
    console.warn('Storage upload failed:', uploadError.message);
  }

  // Create report record
  const shareToken = Buffer.from(crypto.randomUUID()).toString('base64url').slice(0, 32);
  const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 86400000).toISOString() : null;

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      user_id: user.id,
      report_type: reportType || 'standard_pdf',
      score_snapshot: scoreResult as any,
      ledger_snapshot: {
        total_platforms: platforms.size,
        avg_monthly_income: avgMonthly,
        total_career_earnings: totalEarnings,
        monthly_breakdown: monthlyBreakdown,
      } as any,
      file_path: uploadError ? null : fileName,
      share_token: shareToken,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    reportId: report.id,
    shareUrl: `/reports/view/${report.share_token}`,
    score: scoreResult.total,
    tier: scoreResult.tier,
  }, { status: 201 });
}
