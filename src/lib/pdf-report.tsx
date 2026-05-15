import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import type { IncomeVerification, IncomeRecord, ScoreFactor } from '@/types'

// Register font (built-in Helvetica is fine on server)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  // ... rest of styles
  header: { marginBottom: 24, borderBottomWidth: 2, borderBottomColor: '#18181b', paddingBottom: 16 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#18181b', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#52525b', marginBottom: 2 },
  metaRow: { flexDirection: 'row', gap: 24, marginTop: 8, fontSize: 9, color: '#71717a' },
  
  seal: { position: 'absolute', top: 40, right: 40, width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#18181b', alignItems: 'center', justifyContent: 'center' },
  sealText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#18181b' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#18181b', borderBottomWidth: 1, borderBottomColor: '#e4e4e7', paddingBottom: 4, marginBottom: 10 },

  // Score card
  scoreRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  scoreCard: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 8 },
  scoreNumber: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#18181b' },
  scoreLabel: { fontSize: 9, color: '#52525b', marginTop: 2 },

  // Status badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 9, fontFamily: 'Helvetica-Bold', alignSelf: 'flex-start', marginTop: 4 },
  green: { backgroundColor: '#dcfce7', color: '#166534' },
  yellow: { backgroundColor: '#fef9c3', color: '#854d0e' },
  red: { backgroundColor: '#fce4ec', color: '#c62828' },

  // Table
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f4f4f5', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f4f4f5' },
  col: { flex: 1, fontSize: 9 },
  colRight: { flex: 1, fontSize: 9, textAlign: 'right' },
  colCenter: { flex: 1, fontSize: 9, textAlign: 'center' },

  // Factors
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  factorBullet: { width: 6, height: 6, borderRadius: 3 },
  factorPositive: { backgroundColor: '#16a34a' },
  factorNegative: { backgroundColor: '#dc2626' },
  factorNeutral: { backgroundColor: '#a1a1aa' },
  factorName: { fontSize: 9, fontFamily: 'Helvetica-Bold', flex: 1 },
  factorDesc: { fontSize: 8, color: '#52525b', flex: 2 },

  // Footer
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#e4e4e7', paddingTop: 8, fontSize: 7, color: '#a1a1aa', textAlign: 'center' },

  // Verification statement box
  verificationBox: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 6, padding: 12, marginTop: 16 },
  verificationText: { fontSize: 8, color: '#52525b', lineHeight: 1.5 },
})

type ReportProps = {
  workerName: string | null
  reportDate: string
  reportId: string
  verification: IncomeVerification
  records: IncomeRecord[]
  monthlyData: { month: string; total: number }[]
}

function StatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, { bg: string; fg: string }> = {
    green: { bg: '#dcfce7', fg: '#166534' },
    yellow: { bg: '#fef9c3', fg: '#854d0e' },
    red: { bg: '#fce4ec', fg: '#c62828' },
    growing: { bg: '#dcfce7', fg: '#166534' },
    stable: { bg: '#fef9c3', fg: '#854d0e' },
    declining: { bg: '#fce4ec', fg: '#c62828' },
  }
  const s = styleMap[status] || { bg: '#f4f4f5', fg: '#52525b' }
  return (
    <Text style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 9, fontFamily: 'Helvetica-Bold', backgroundColor: s.bg, color: s.fg, alignSelf: 'flex-start', marginTop: 4 }}>
      {status.toUpperCase()}
    </Text>
  )
}

function FactorDot({ impact }: { impact: string }) {
  const color = impact === 'positive' ? '#16a34a' : impact === 'negative' ? '#dc2626' : '#a1a1aa'
  return <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginRight: 6 }} />
}

export function IncomeReport({ workerName, reportDate, reportId, verification, records, monthlyData }: ReportProps) {
  const name = workerName || 'Gig Worker'
  const hasInsufficientData = records.length < 6

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.seal}>
            <Text style={styles.sealText}>KROST</Text>
          </View>
          <Text style={styles.title}>Income Verification Report</Text>
          <Text style={styles.subtitle}>Prepared by Krost</Text>
          <View style={styles.metaRow}>
            <Text>Report ID: {reportId.slice(0, 8)}…</Text>
            <Text>Prepared for: {name}</Text>
            <Text>Report Date: {reportDate}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income Summary</Text>

          <View style={styles.scoreRow}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>{verification.consistency_score}</Text>
              <Text style={styles.scoreLabel}>Consistency Score (0-100)</Text>
              <StatusBadge status={verification.lender_ready_status} />
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>${(verification.annualized_income / 1000).toFixed(1)}k</Text>
              <Text style={styles.scoreLabel}>Annualized Income</Text>
              <Text style={{ fontSize: 8, color: '#71717a', marginTop: 2 }}>Trailing 12-month avg × 12</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>${verification.monthly_avg_income.toLocaleString()}</Text>
              <Text style={styles.scoreLabel}>Monthly Average</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>{verification.platform_diversity}</Text>
              <Text style={styles.scoreLabel}>Platforms Connected</Text>
            </View>
          </View>

          {/* Trajectory & Diversity */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1, padding: 8, backgroundColor: '#fafafa', borderRadius: 6 }}>
              <Text style={{ fontSize: 8, color: '#71717a' }}>Income Trajectory</Text>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2, textTransform: 'capitalize' }}>
                {verification.trajectory_label}
                {verification.trajectory_slope !== 0 && (
                  <Text style={{ fontSize: 9, color: '#71717a' }}> ({(verification.trajectory_slope * 100).toFixed(1)}%/mo)</Text>
                )}
              </Text>
              <StatusBadge status={verification.trajectory_label} />
            </View>
            <View style={{ flex: 1, padding: 8, backgroundColor: '#fafafa', borderRadius: 6 }}>
              <Text style={{ fontSize: 8, color: '#71717a' }}>Platform Diversity</Text>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>{verification.diversity_score}/100</Text>
              <Text style={{ fontSize: 8, color: '#71717a', marginTop: 2 }}>
                {verification.platform_diversity} platform{verification.platform_diversity !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={{ flex: 1, padding: 8, backgroundColor: '#fafafa', borderRadius: 6 }}>
              <Text style={{ fontSize: 8, color: '#71717a' }}>Tenure</Text>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>{verification.tenure_months} months</Text>
              <Text style={{ fontSize: 8, color: '#71717a', marginTop: 2 }}>Gig work history</Text>
            </View>
          </View>
        </View>

        {/* Score Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Factors</Text>
          {verification.score_factors.map((f, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FactorDot impact={f.impact} />
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', flex: 1 }}>{f.name}</Text>
              <Text style={{ fontSize: 8, color: '#52525b', flex: 2 }}>{f.description}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Earnings Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Monthly Earnings History {hasInsufficientData ? '(Preliminary — Insufficient History)' : ''}
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col}>Month</Text>
              <Text style={styles.colRight}>Platforms</Text>
              <Text style={styles.colRight}>Gross Earnings</Text>
              <Text style={styles.colRight}>Net Earnings</Text>
            </View>
            {monthlyData.slice(-12).map((m, i) => {
              const monthRecords = records.filter(
                r => r.period_start.slice(0, 7) === m.month
              )
              const platforms = [...new Set(monthRecords.map(r => r.platform))].join(', ')
              const gross = monthRecords.reduce((s, r) => s + r.gross_earnings, 0)
              return (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.col}>{m.month}</Text>
                  <Text style={{ ...styles.col, fontSize: 7 }}>{platforms}</Text>
                  <Text style={styles.colRight}>${gross.toLocaleString()}</Text>
                  <Text style={styles.colRight}>${m.total.toLocaleString()}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Platform Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Profile</Text>
          {(() => {
            const platformMap = new Map<string, { records: IncomeRecord[] }>()
            for (const r of records) {
              if (!platformMap.has(r.platform)) platformMap.set(r.platform, { records: [] })
              platformMap.get(r.platform)!.records.push(r)
            }
            const sorted = Array.from(platformMap.entries()).sort((a, b) => b[1].records.length - a[1].records.length)
            return sorted.map(([platform, data]) => {
              const total = data.records.reduce((s, r) => s + r.net_earnings, 0)
              const dates = data.records.map(r => new Date(r.period_start))
              const start = new Date(Math.min(...dates.map(d => d.getTime()))).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              return (
                <View key={platform} style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
                  <Text style={{ flex: 1, fontSize: 9, textTransform: 'capitalize' }}>{platform}</Text>
                  <Text style={{ flex: 1, fontSize: 9, color: '#52525b' }}>Since {start}</Text>
                  <Text style={{ flex: 1, fontSize: 9, textAlign: 'right' }}>${total.toLocaleString()} total</Text>
                  <Text style={{ flex: 0.5, fontSize: 9, textAlign: 'center' }}>{data.records.length} records</Text>
                </View>
              )
            })
          })()}
        </View>

        {/* Trajectory Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income Trajectory Assessment</Text>
          <Text style={{ fontSize: 9, color: '#52525b', lineHeight: 1.5 }}>
            {verification.trajectory_label === 'growing'
              ? `${name}'s income is growing at approximately ${(verification.trajectory_slope * 100).toFixed(1)}% per month over the trailing period, indicating a positive earnings trajectory.`
              : verification.trajectory_label === 'declining'
              ? `${name}'s income shows a declining trend of ${(Math.abs(verification.trajectory_slope) * 100).toFixed(1)}% per month. This may warrant closer review of current gig activity levels.`
              : `${name}'s income is stable, with no significant upward or downward trend detected. Consistent earning pattern.`}
          </Text>
          <Text style={{ fontSize: 8, color: '#71717a', marginTop: 4 }}>
            {hasInsufficientData
              ? 'Preliminary estimate based on limited data history. Increase confidence with 6+ months of connected data.'
              : `Based on ${records.length} income records spanning ${verification.tenure_months} months across ${verification.platform_diversity} platform(s).`}
          </Text>
        </View>

        {/* Verification Statement */}
        <View style={styles.verificationBox}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#18181b', marginBottom: 4 }}>Verification Statement</Text>
          <Text style={styles.verificationText}>
            This report was generated by Krost on {reportDate}. Income data displayed in this report was sourced directly from
            the gig platform(s) via authenticated API connections authorized by the worker. Data is not self-reported.
            {'\n\n'}
            Krost is an income verification tool, not a credit reporting agency. This report reflects earnings data as of the report
            date and should be verified for currency by the receiving institution. Krost makes no representation regarding
            creditworthiness or loan eligibility.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Krost — Income Verification Report — Report ID: {reportId} — Page 1 of 1
        </Text>
      </Page>
    </Document>
  )
}
