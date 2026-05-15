import type {
  IncomeRecord, IncomeVerification, ScoreFactor, TrajectoryLabel, LenderReadyStatus,
  KrostScoreInput, KrostScoreResult, KrostScoreFactorDetail, KrostScoreTier
} from '@/types'

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
 *
 * Also exports calculateKrostScore() — the 300–850 income verification
 * metric for the Krostio platform v2 (PRD Part III).
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

// ─── Krost Score v2: 300–850 income verification metric ─────────────

/**
 * Calculate Krost Score — a 300–850 income verification metric for gig workers.
 *
 * Nine-factor model:
 *   6 base factors (from PRD Appendix A) + 3 v2 platform factors
 *
 * Score = 300 (base) + sum(factor contributions), capped at 850.
 *
 * Tier mapping:
 *   750–850  → elite    (prime borrower equivalent)
 *   680–749  → strong   (non-QM eligible)
 *   580–679  → building (secured/small loans)
 *   300–579  → emerging (microloans, credit-builder)
 */
export function calculateKrostScore(input: KrostScoreInput): KrostScoreResult {
  const factors: KrostScoreFactorDetail[] = []
  const breakdown = { base: 300, incomeScore: 0, tenureScore: 0, volatilityScore: 0, diversityScore: 0, consistencyScore: 0, trajectoryScore: 0, taxComplianceScore: 0, crossPlatformGrowthScore: 0, ledgerDepthScore: 0 }

  // 1 — Average Monthly Income (up to +80)
  // Benchmark: $5K/mo = full points. Linear scale from $0.
  const incomeScore = Math.min(80, Math.round((input.avgMonthlyIncome / 5000) * 80))
  breakdown.incomeScore = incomeScore
  factors.push({
    name: 'avg_monthly_income',
    label: 'Average Monthly Income',
    points: incomeScore,
    maxPoints: 80,
    impact: incomeScore >= 40 ? 'positive' : incomeScore > 0 ? 'neutral' : 'negative',
    description: input.avgMonthlyIncome >= 5000
      ? `$${input.avgMonthlyIncome.toLocaleString()}/mo — strong earning level`
      : input.avgMonthlyIncome >= 2500
        ? `$${input.avgMonthlyIncome.toLocaleString()}/mo — solid base`
        : `$${input.avgMonthlyIncome.toLocaleString()}/mo — below benchmark`,
  })

  // 2 — Platform Tenure (up to +70)
  // 36+ months = full points.
  const tenureScore = Math.min(70, Math.round((input.platformTenureMonths / 36) * 70))
  breakdown.tenureScore = tenureScore
  factors.push({
    name: 'platform_tenure',
    label: 'Platform Tenure',
    points: tenureScore,
    maxPoints: 70,
    impact: tenureScore >= 35 ? 'positive' : tenureScore > 0 ? 'neutral' : 'negative',
    description: `${input.platformTenureMonths} months of gig work history`,
  })

  // 3 — Income Volatility (up to +60, inverse)
  // Lower CV = higher score. CV < 0.3 = full points, CV > 1.0 = 0.
  const cvNormalized = Math.min(1, Math.max(0, input.incomeVolatility))
  const volatilityScore = Math.round((1 - cvNormalized) * 60)
  breakdown.volatilityScore = volatilityScore
  factors.push({
    name: 'income_volatility',
    label: 'Income Stability',
    points: volatilityScore,
    maxPoints: 60,
    impact: volatilityScore >= 40 ? 'positive' : volatilityScore >= 20 ? 'neutral' : 'negative',
    description: volatilityScore >= 40
      ? 'Very stable income month-to-month'
      : volatilityScore >= 20
        ? 'Moderate income variability'
        : 'High income variability',
  })

  // 4 — Platform Diversity (up to +50)
  // 5+ platforms = full points.
  const diversityScore = Math.min(50, Math.round((input.platformDiversity / 5) * 50))
  breakdown.diversityScore = diversityScore
  factors.push({
    name: 'platform_diversity',
    label: 'Platform Diversity',
    points: diversityScore,
    maxPoints: 50,
    impact: diversityScore >= 30 ? 'positive' : diversityScore >= 10 ? 'neutral' : 'negative',
    description: input.platformDiversity >= 3
      ? `Income from ${input.platformDiversity} platforms — well diversified`
      : input.platformDiversity === 2
        ? 'Income from 2 platforms — some diversification'
        : 'Single platform — consider adding another income source',
  })

  // 5 — Earning Consistency (up to +50)
  // % of months with positive earnings. 95%+ = full points.
  const consistencyScore = Math.min(50, Math.round((input.earningConsistency / 95) * 50))
  breakdown.consistencyScore = consistencyScore
  factors.push({
    name: 'earning_consistency',
    label: 'Earning Consistency',
    points: consistencyScore,
    maxPoints: 50,
    impact: consistencyScore >= 35 ? 'positive' : consistencyScore >= 15 ? 'neutral' : 'negative',
    description: `${input.earningConsistency}% of months with positive earnings`,
  })

  // 6 — Income Trajectory (up to +40)
  // Positive slope = growth. Negative slope = penalty.
  // Max points at +5%/mo slope
  let trajectoryScore = 0
  if (input.incomeTrajectory > 0.03) {
    trajectoryScore = Math.min(40, Math.round((input.incomeTrajectory / 0.05) * 40))
  } else if (input.incomeTrajectory < -0.03) {
    trajectoryScore = Math.max(-20, Math.round((input.incomeTrajectory / 0.05) * 20))
  }
  breakdown.trajectoryScore = trajectoryScore
  factors.push({
    name: 'income_trajectory',
    label: 'Income Trajectory',
    points: trajectoryScore,
    maxPoints: 40,
    impact: trajectoryScore > 0 ? 'positive' : trajectoryScore < 0 ? 'negative' : 'neutral',
    description: trajectoryScore > 0
      ? `Growing at ${(input.incomeTrajectory * 100).toFixed(1)}%/month`
      : trajectoryScore < 0
        ? `Declining at ${(Math.abs(input.incomeTrajectory) * 100).toFixed(1)}%/month`
        : 'Stable earnings trajectory',
  })

  // 7 — Tax Compliance (up to +25, boolean)
  const taxComplianceScore = input.taxCompliance ? 25 : 0
  breakdown.taxComplianceScore = taxComplianceScore
  factors.push({
    name: 'tax_compliance',
    label: 'Tax Compliance',
    points: taxComplianceScore,
    maxPoints: 25,
    impact: input.taxCompliance ? 'positive' : 'neutral',
    description: input.taxCompliance
      ? '1099-K or tax return on file — verified income reporting'
      : 'No tax documents yet — connect tax records to boost score',
  })

  // 8 — Cross-Platform Growth (up to +20)
  // New platforms adopted in last 12 months. 3+ = full points.
  const growthScore = Math.min(20, Math.round((input.crossPlatformGrowth / 3) * 20))
  breakdown.crossPlatformGrowthScore = growthScore
  factors.push({
    name: 'cross_platform_growth',
    label: 'Platform Growth',
    points: growthScore,
    maxPoints: 20,
    impact: growthScore >= 10 ? 'positive' : 'neutral',
    description: input.crossPlatformGrowth >= 2
      ? `Added ${input.crossPlatformGrowth} new platforms — expanding income streams`
      : input.crossPlatformGrowth === 1
        ? 'Added 1 new platform recently'
        : 'No new platforms in last 12 months',
  })

  // 9 — Ledger Depth (up to +15)
  // Months of verified ledger history. 36+ months = full points.
  const ledgerScore = Math.min(15, Math.round((input.ledgerDepth / 36) * 15))
  breakdown.ledgerDepthScore = ledgerScore
  factors.push({
    name: 'ledger_depth',
    label: 'Ledger History',
    points: ledgerScore,
    maxPoints: 15,
    impact: ledgerScore >= 8 ? 'positive' : 'neutral',
    description: input.ledgerDepth >= 24
      ? `${input.ledgerDepth} months of verified history — deep track record`
      : input.ledgerDepth >= 12
        ? `${input.ledgerDepth} months of verified history — established record`
        : `${input.ledgerDepth} months of verified history — building record`,
  })

  // Sum all contributions
  const contributions =
    breakdown.incomeScore +
    breakdown.tenureScore +
    breakdown.volatilityScore +
    breakdown.diversityScore +
    breakdown.consistencyScore +
    breakdown.trajectoryScore +
    breakdown.taxComplianceScore +
    breakdown.crossPlatformGrowthScore +
    breakdown.ledgerDepthScore

  const rawScore = breakdown.base + contributions
  const score = Math.min(850, Math.max(300, rawScore))

  // Tier assignment
  const tier: KrostScoreTier =
    score >= 750 ? 'elite' :
    score >= 680 ? 'strong' :
    score >= 580 ? 'building' :
    'emerging'

  return {
    score,
    tier,
    factors: factors.sort((a, b) => Math.abs(b.points) - Math.abs(a.points)),
    breakdown,
    calculatedAt: new Date().toISOString(),
  }
}
