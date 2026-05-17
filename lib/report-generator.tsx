import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#141413' },
  header: { fontSize: 24, marginBottom: 4, fontWeight: 700 },
  subtitle: { fontSize: 12, color: '#666', marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#666' },
  value: { fontWeight: 700 },
  table: { marginTop: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#ddd', paddingVertical: 4 },
  tableHeader: { flex: 1, fontWeight: 700, fontSize: 8, color: '#999', textTransform: 'uppercase' },
  tableCell: { flex: 1, fontSize: 9 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#999', textAlign: 'center' },
  badge: { backgroundColor: '#141413', color: 'white', paddingHorizontal: 8, paddingVertical: 3, fontSize: 10, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  scoreDisplay: { fontSize: 48, fontWeight: 700, marginVertical: 8 },
  tierLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  factorRow: { flexDirection: 'row', marginBottom: 2 },
  factorLabel: { width: 180, color: '#666' },
  factorBar: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  factorFill: { height: 8, backgroundColor: '#141413', borderRadius: 4 },
  factorScore: { width: 30, textAlign: 'right', fontWeight: 700 },
});

interface ReportData {
  workerName: string;
  workerEmail: string;
  score: number;
  scoreTier: string;
  factors: Record<string, number>;
  avgMonthlyIncome: number;
  totalPlatforms: number;
  tenureMonths: number;
  totalEarnings: number;
  monthlyBreakdown: Array<{ month: string; gross_total: number; net_total: number; payment_count: number }>;
  generatedAt: string;
}

export function KrostReport({ data }: { data: ReportData }) {
  const factorEntries = Object.entries(data.factors || {}).filter(([, v]) => v !== undefined);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cover Section */}
        <View style={styles.section}>
          <Text style={styles.header}>Krost Income Verification Report</Text>
          <Text style={styles.subtitle}>Powered by Krostio — Financial Identity for the Gig Economy</Text>
        </View>

        {/* Worker Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worker Identity</Text>
          <View style={styles.row}><Text style={styles.label}>Name</Text><Text style={styles.value}>{data.workerName || 'Not provided'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>{data.workerEmail}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Report Generated</Text><Text style={styles.value}>{data.generatedAt}</Text></View>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.badge}><Text>{data.scoreTier} Tier</Text></View>
          <Text style={styles.scoreDisplay}>{data.score}</Text>
          <Text style={styles.tierLabel}>Krost Score (300–850)</Text>

          <View style={{ marginTop: 12 }}>
            <View style={styles.row}><Text style={styles.label}>Annualized Income</Text><Text style={styles.value}>${Math.round(data.avgMonthlyIncome * 12).toLocaleString()}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Active Platforms</Text><Text style={styles.value}>{data.totalPlatforms}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Career Tenure</Text><Text style={styles.value}>{data.tenureMonths} months</Text></View>
            <View style={styles.row}><Text style={styles.label}>Total Verified Earnings</Text><Text style={styles.value}>${Math.round(data.totalEarnings).toLocaleString()}</Text></View>
          </View>
        </View>

        {/* Score Factor Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Factor Breakdown</Text>
          {factorEntries.map(([key, value]) => (
            <View key={key} style={styles.factorRow}>
              <Text style={styles.factorLabel}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
              <View style={styles.factorBar}>
                <View style={[styles.factorFill, { width: `${Math.min(100, (value / 80) * 100)}%` }]} />
              </View>
              <Text style={styles.factorScore}>+{value}</Text>
            </View>
          ))}
        </View>

        {/* Income History Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income History (Monthly)</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Month</Text>
              <Text style={styles.tableHeader}>Gross</Text>
              <Text style={styles.tableHeader}>Net</Text>
              <Text style={styles.tableHeader}>Payments</Text>
            </View>
            {(data.monthlyBreakdown || []).slice(0, 12).map((m, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{m.month}</Text>
                <Text style={styles.tableCell}>${m.gross_total.toLocaleString()}</Text>
                <Text style={styles.tableCell}>${(m.net_total || m.gross_total).toLocaleString()}</Text>
                <Text style={styles.tableCell}>{m.payment_count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disclaimer</Text>
          <Text style={{ fontSize: 8, color: '#999', lineHeight: 1.5 }}>
            This report is generated based on income data provided by the worker through connected gig platforms.
            Krostio does not verify the accuracy of platform-reported earnings. This report is not a credit score
            or credit report as defined by the Fair Credit Reporting Act. Lenders should conduct their own due diligence.
          </Text>
        </View>

        <Text style={styles.footer}>Krostio — krostio.app — Report ID: {data.generatedAt.replace(/[^0-9]/g, '')}</Text>
      </Page>
    </Document>
  );
}
