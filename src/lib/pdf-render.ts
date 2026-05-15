import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import { calculateCreditScore } from '@/lib/scoring-engine'
import { IncomeReport } from './pdf-report'
import type { IncomeRecord, IncomeVerification } from '@/types'

const REPORT_EXPIRY_DAYS = 30

export interface GenerateReportResult {
  reportId: string
  downloadUrl: string
  shareUrl: string
  expiresAt: string
}

/**
 * Generate a PDF income verification report for the current user.
 * Fetches income data, calculates score, renders PDF, uploads to storage,
 * and creates a report record with expiring share link.
 */
export async function generateReport(userId: string): Promise<GenerateReportResult> {
  const supabase = await createServerSupabaseClient()

  // 1. Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()

  if (!profile) throw new Error('User profile not found')

  // 2. Fetch income records
  const { data: records } = await supabase
    .from('income_records')
    .select('*')
    .eq('user_id', userId)
    .order('period_start', { ascending: true })

  if (!records || records.length === 0) {
    throw new Error('No income data found. Connect a gig platform first.')
  }

  // 3. Calculate score
  const verification = calculateCreditScore(records as IncomeRecord[], userId)

  // 4. Build monthly aggregation
  const monthlyMap = new Map<string, number>()
  for (const r of records) {
    const key = r.period_start.slice(0, 7)
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + r.net_earnings)
  }
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const reportId = crypto.randomUUID()
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // 5. Render PDF
  const pdfBuffer = await renderToBuffer(
    React.createElement(IncomeReport, {
      workerName: profile.name,
      reportDate,
      reportId,
      verification: verification as IncomeVerification,
      records: records as IncomeRecord[],
      monthlyData,
    }) as any
  )

  // 6. Upload to Supabase Storage
  const serviceClient = createServiceSupabaseClient()
  const filePath = `${userId}/${reportId}.pdf`

  const { error: uploadError } = await serviceClient.storage
    .from('reports')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    // Try creating bucket
    const { error: bucketError } = await serviceClient.storage.createBucket('reports', {
      public: false,
    })
    if (bucketError) throw new Error(`Storage error: ${bucketError.message}`)

    // Retry upload
    const { error: retryError } = await serviceClient.storage
      .from('reports')
      .upload(filePath, pdfBuffer, { contentType: 'application/pdf' })
    if (retryError) throw new Error(`Upload failed: ${retryError.message}`)
  }

  // 7. Create signed URL (expires at the report's expiry)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REPORT_EXPIRY_DAYS)

  const { data: signedUrl, error: signError } = await serviceClient.storage
    .from('reports')
    .createSignedUrl(filePath, REPORT_EXPIRY_DAYS * 24 * 60)

  if (signError) throw new Error(`Signed URL error: ${signError.message}`)

  // 8. Insert report record
  const { data: report, error: insertError } = await serviceClient
    .from('reports')
    .insert({
      id: reportId,
      user_id: userId,
      file_path: filePath,
      file_size: pdfBuffer.length,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (insertError) throw new Error(`Report record error: ${insertError.message}`)

  return {
    reportId,
    downloadUrl: signedUrl.signedUrl,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/report/${reportId}`,
    expiresAt: expiresAt.toISOString(),
  }
}
