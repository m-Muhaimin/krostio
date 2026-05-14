import type { IncomeRecord, CreditScore, ScoreFactor } from '@/types'

/**
 * Krost Scoring Engine
 * Calculates alternative credit scores from gig economy income data.
 * Factors: income stability, tenure, platform diversity, earning trajectory
 */
export function calculateCreditScore(
  incomes: IncomeRecord[],
  userId: string
): Omit<CreditScore, 'id' | 'expires_at' | 'attestation_id'> {
  if (incomes.length === 0) {
    throw new Error('No income records provided')
  }

  const monthlyIncomes = aggregateByMonth(incomes)
  const avgMonthlyIncome = calcAverageMonthlyIncome(monthlyIncomes)
  const volatility = calcIncomeVolatility(monthlyIncomes)
  const tenure = calcTenure(incomes)
  const diversity = calcPlatformDiversity(incomes)
  const reliability = calcReliabilityScore(incomes, volatility)
  const trajectory = calcTrajectory(monthlyIncomes)
  const consistency = calcConsistency(incomes)

  // Base score starts at 500, max 850
  let score = 500

  const factors: ScoreFactor[] = []

  // Income level contribution (up to +80)
  if (avgMonthlyIncome >= 4000) { score += 80; factors.push({ name: 'High monthly income', impact: 'positive', description: `Average monthly income of $${avgMonthlyIncome.toLocaleString()}`, weight: 80 }) }
  else if (avgMonthlyIncome >= 2000) { score += 50; factors.push({ name: 'Moderate income', impact: 'positive', description: `Average monthly income of $${avgMonthlyIncome.toLocaleString()}`, weight: 50 }) }
  else { score += 20; factors.push({ name: 'Low income base', impact: 'neutral', description: `Average monthly income of $${avgMonthlyIncome.toLocaleString()}`, weight: 20 }) }

  // Tenure contribution (up to +70)
  if (tenure >= 24) { score += 70; factors.push({ name: 'Long platform tenure', impact: 'positive', description: `${tenure} months on gig platforms`, weight: 70 }) }
  else if (tenure >= 12) { score += 50; factors.push({ name: 'Established tenure', impact: 'positive', description: `${tenure} months on gig platforms`, weight: 50 }) }
  else if (tenure >= 6) { score += 30; factors.push({ name: 'Growing tenure', impact: 'positive', description: `${tenure} months on gig platforms`, weight: 30 }) }
  else { score += 10; factors.push({ name: 'Short tenure', impact: 'negative', description: `Only ${tenure} months of platform history`, weight: 10 }) }

  // Volatility contribution (up to +60 for low volatility)
  if (volatility < 0.15) { score += 60; factors.push({ name: 'Very stable income', impact: 'positive', description: 'Income varies less than 15% month-to-month', weight: 60 }) }
  else if (volatility < 0.30) { score += 40; factors.push({ name: 'Stable income', impact: 'positive', description: 'Income varies less than 30% month-to-month', weight: 40 }) }
  else if (volatility < 0.50) { score += 20; factors.push({ name: 'Moderate income volatility', impact: 'neutral', description: `Income volatility of ${(volatility * 100).toFixed(0)}%`, weight: 20 }) }
  else { score -= 20; factors.push({ name: 'High income volatility', impact: 'negative', description: `Income volatility of ${(volatility * 100).toFixed(0)}%`, weight: -20 }) }

  // Platform diversity (up to +50)
  if (diversity >= 3) { score += 50; factors.push({ name: 'Multi-platform earner', impact: 'positive', description: `Active on ${diversity} platforms — diversified income`, weight: 50 }) }
  else if (diversity === 2) { score += 30; factors.push({ name: 'Dual-platform earner', impact: 'positive', description: 'Income from 2 platforms reduces risk', weight: 30 }) }
  else { score += 10; factors.push({ name: 'Single platform', impact: 'neutral', description: 'Income from 1 platform — consider diversifying', weight: 10 }) }

  // Reliability/consistency (up to +50)
  if (consistency >= 0.8) { score += 50; factors.push({ name: 'Highly consistent earner', impact: 'positive', description: 'You earn consistently week-over-week', weight: 50 }) }
  else if (consistency >= 0.6) { score += 30; factors.push({ name: 'Consistent earner', impact: 'positive', description: 'Regular earning pattern detected', weight: 30 }) }
  else { score += 10; factors.push({ name: 'Variable earning pattern', impact: 'negative', description: 'Earnings fluctuate significantly week-to-week', weight: 10 }) }

  // Trajectory bonus (up to +40)
  if (trajectory > 0.15) { score += 40; factors.push({ name: 'Strong upward trend', impact: 'positive', description: 'Income growing consistently (+15%+)', weight: 40 }) }
  else if (trajectory > 0.05) { score += 20; factors.push({ name: 'Growing income', impact: 'positive', description: 'Moderate upward income trajectory', weight: 20 }) }
  else if (trajectory < -0.10) { score -= 20; factors.push({ name: 'Declining income trend', impact: 'negative', description: 'Income trending downward over recent months', weight: -20 }) }

  // Clamp score
  const finalScore = Math.min(850, Math.max(300, score))

  return {
    user_id: userId,
    overall_score: finalScore,
    monthly_avg_income: Math.round(avgMonthlyIncome),
    income_volatility: Math.round(volatility * 100) / 100,
    tenure_months: tenure,
    platform_diversity: diversity,
    reliability_score: Math.round(reliability),
    debt_to_income_ratio: 0, // user provides this separately
    score_factors: factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
    calculated_at: new Date().toISOString(),
  }
}

function aggregateByMonth(records: IncomeRecord[]): { month: string; total: number }[] {
  const grouped = new Map<string, number>()
  for (const r of records) {
    const monthKey = r.period_start.slice(0, 7) // YYYY-MM
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

function calcIncomeVolatility(monthly: { month: string; total: number }[]): number {
  if (monthly.length < 2) return 0
  const avg = calcAverageMonthlyIncome(monthly)
  if (avg === 0) return 0
  const variance = monthly.reduce((sum, m) => sum + (m.total - avg) ** 2, 0) / monthly.length
  return Math.sqrt(variance) / avg // coefficient of variation
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

function calcReliabilityScore(records: IncomeRecord[], volatility: number): number {
  // Active days ratio * consistency bonuses
  const weeksWithData = new Set(
    records.map(r => {
      const d = new Date(r.period_start)
      const weekNum = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000))
      return `${d.getFullYear()}-W${weekNum}`
    })
  ).size

  const totalWeeks = 12 // look at 3-month window
  const coverage = Math.min(1, weeksWithData / totalWeeks)

  // Volatility penalizes reliability
  const volatilityPenalty = Math.min(0.5, volatility * 0.5)

  return Math.round(Math.max(0, Math.min(100, (coverage - volatilityPenalty) * 100)))
}

function calcTrajectory(monthly: { month: string; total: number }[]): number {
  if (monthly.length < 3) return 0
  const recent = monthly.slice(-3)
  const firstHalf = recent.slice(0, 2)
  const secondHalf = recent.slice(-2)
  const avgFirst = firstHalf.reduce((s, m) => s + m.total, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((s, m) => s + m.total, 0) / secondHalf.length
  if (avgFirst === 0) return 0
  return (avgSecond - avgFirst) / avgFirst
}

function calcConsistency(records: IncomeRecord[]): number {
  // Ratio of weeks with earnings > 0 vs total weeks in range
  if (records.length === 0) return 0
  const dateRange = Math.max(
    1,
    (new Date(records[records.length - 1].period_end).getTime() -
      new Date(records[0].period_start).getTime()) /
      (1000 * 60 * 60 * 24 * 7)
  )
  return Math.min(1, records.length / (dateRange * 3)) // expect ~3 records per week
}
