import type { IncomeRecord, IncomeVerification, ScoreFactor, TrajectoryLabel, LenderReadyStatus } from '@/types'

/**
 * Krost Income Verification Engine
 *
 * PRD-compliant. Computes:
 *  - Annualized Income Estimate
 *  - Income Consistency Score (0–100)
 *  - Income Trajectory (Growing / Stable / Declining)
 *  - Platform Diversity Score
 *  - Lender-Ready Status (Green / Yellow / Red)
 *
 * NOT a credit score. Do not call it one (FCRA liability).
 */
export function calculateCreditScore(
  incomes: IncomeRecord[],
  userId: string
): Omit<IncomeVerification, 'id' | 'expires_at' | 'attestation_id'> {
  if (incomes.length === 0) {
    throw new Error('No income records provided')
  }

  const monthly = aggregateByMonth(incomes)
  const avgMonthly = calcAverageMonthlyIncome(monthly)
  const annualized = avgMonthly * 12
  const cv = calcCoefficientOfVariation(monthly) // income volatility
  const tenure = calcTenure(incomes)
  const platforms = calcPlatformDiversity(incomes)
  const trajectorySlope = calcTrajectorySlope(monthly)
  const trajectoryLabel = classifyTrajectory(trajectorySlope)

  // Income Consistency Score (0–100) per PRD §7.2: max(0, 100 - (cv × 100))
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - cv * 100)))

  // Diversity Score per PRD §7.4: min(100, num_active_platforms / 4 × 100)
  const diversityScore = Math.min(100, Math.round((platforms / 4) * 100))

  // Lender-Ready Status
  const lenderReadyStatus = classifyLenderReady(consistencyScore, platforms, avgMonthly)

  const factors: ScoreFactor[] = []

  // Consistency factor
  if (consistencyScore >= 80) {
    factors.push({ name: 'Income consistency', impact: 'positive', description: `Excellent consistency score of ${consistencyScore}/100 — very stable income stream`, weight: 30 })
  } else if (consistencyScore >= 60) {
    factors.push({ name: 'Income consistency', impact: 'positive', description: `Good consistency score of ${consistencyScore}/100 — moderate income stability`, weight: 20 })
  } else {
    factors.push({ name: 'Income consistency', impact: 'negative', description: `High income volatility — consistency score of ${consistencyScore}/100`, weight: -10 })
  }

  // Annualized income factor
  if (annualized >= 80000) {
    factors.push({ name: 'Annualized income', impact: 'positive', description: `Annualized income of $${annualized.toLocaleString()} — strong earning level`, weight: 25 })
  } else if (annualized >= 40000) {
    factors.push({ name: 'Annualized income', impact: 'positive', description: `Annualized income of $${annualized.toLocaleString()} — solid base`, weight: 15 })
  } else {
    factors.push({ name: 'Annualized income', impact: 'neutral', description: `Annualized income of $${annualized.toLocaleString()} — below-average earnings`, weight: 5 })
  }

  // Tenure factor
  if (tenure >= 24) {
    factors.push({ name: 'Platform tenure', impact: 'positive', description: `${tenure} months of gig work history — strong track record`, weight: 20 })
  } else if (tenure >= 12) {
    factors.push({ name: 'Platform tenure', impact: 'positive', description: `${tenure} months of gig work history — established record`, weight: 15 })
  } else {
    factors.push({ name: 'Platform tenure', impact: 'neutral', description: `Only ${tenure} months of history — building track record`, weight: 5 })
  }

  // Diversity factor
  if (platforms >= 4) {
    factors.push({ name: 'Platform diversity', impact: 'positive', description: `Income from ${platforms} platforms — excellent diversification`, weight: 15 })
  } else if (platforms >= 2) {
    factors.push({ name: 'Platform diversity', impact: 'positive', description: `Income from ${platforms} platforms — diversified`, weight: 10 })
  } else {
    factors.push({ name: 'Platform diversity', impact: 'neutral', description: `Single platform — consider adding another income source`, weight: 0 })
  }

  // Trajectory factor
  if (trajectoryLabel === 'growing') {
    factors.push({ name: 'Income trajectory', impact: 'positive', description: `Income growing at ${(trajectorySlope * 100).toFixed(1)}%/month — positive trend`, weight: 15 })
  } else if (trajectoryLabel === 'declining') {
    factors.push({ name: 'Income trajectory', impact: 'negative', description: `Income declining at ${(Math.abs(trajectorySlope) * 100).toFixed(1)}%/month`, weight: -15 })
  }

  return {
    user_id: userId,
    consistency_score: consistencyScore,
    annualized_income: Math.round(annualized),
    monthly_avg_income: Math.round(avgMonthly),
    income_volatility: Math.round(cv * 10000) / 10000,
    tenure_months: tenure,
    platform_diversity: platforms,
    diversity_score: diversityScore,
    trajectory_label: trajectoryLabel,
    trajectory_slope: Math.round(trajectorySlope * 10000) / 10000,
    lender_ready_status: lenderReadyStatus,
    score_factors: factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
    calculated_at: new Date().toISOString(),
  }
}

// ─── Helpers ──────────────────────────────────────────────

function aggregateByMonth(records: IncomeRecord[]): { month: string; total: number }[] {
  const grouped = new Map<string, number>()
  for (const r of records) {
    const monthKey = r.period_start.slice(0, 7)
    grouped.set(monthKey, (grouped.get(monthKey) || 0) + r.net_earnings)
  }
  return Array.from(grouped.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function calcAverageMonthlyIncome(monthly: { month: string; total: number }[]): number {
  if (monthly.length === 0) return 0
  return monthly.reduce((sum, m) => sum + m.total, 0) / monthly.length
}

function calcCoefficientOfVariation(monthly: { month: string; total: number }[]): number {
  if (monthly.length < 2) return 0
  const avg = calcAverageMonthlyIncome(monthly)
  if (avg === 0) return 0
  const variance = monthly.reduce((sum, m) => sum + (m.total - avg) ** 2, 0) / monthly.length
  return Math.sqrt(variance) / avg
}

function calcTenure(records: IncomeRecord[]): number {
  const dates = records.map(r => new Date(r.period_start))
  const min = new Date(Math.min(...dates.map(d => d.getTime())))
  const max = new Date(Math.max(...dates.map(d => d.getTime())))
  return Math.max(1, Math.round((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24 * 30)))
}

function calcPlatformDiversity(records: IncomeRecord[]): number {
  return new Set(records.map(r => r.platform)).size
}

function calcTrajectorySlope(monthly: { month: string; total: number }[]): number {
  if (monthly.length < 3) return 0
  // Simple linear regression on last 12 months (or all available)
  const slice = monthly.slice(-12)
  const n = slice.length
  const indices = slice.map((_, i) => i)
  const totals = slice.map(m => m.total)
  const sumX = indices.reduce((a, b) => a + b, 0)
  const sumY = totals.reduce((a, b) => a + b, 0)
  const sumXY = indices.reduce((s, i) => s + i * totals[i], 0)
  const sumX2 = indices.reduce((s, i) => s + i * i, 0)
  if (n * sumX2 - sumX * sumX === 0) return 0
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const meanY = sumY / n
  if (meanY === 0) return 0
  return slope / meanY // relative slope
}

function classifyTrajectory(slope: number): TrajectoryLabel {
  if (slope > 0.03) return 'growing'
  if (slope < -0.03) return 'declining'
  return 'stable'
}

function classifyLenderReady(
  consistency: number,
  platforms: number,
  avgMonthly: number
): LenderReadyStatus {
  if (consistency >= 70 && platforms >= 2 && avgMonthly >= 2000) return 'green'
  if (consistency >= 40 && platforms >= 1 && avgMonthly >= 1000) return 'yellow'
  return 'red'
}
