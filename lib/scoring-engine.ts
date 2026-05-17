/**
 * Krost Score Calculation Engine v3.0
 * Base Score: 300
 * Max Score: 850
 *
 * 9-Factor Model (per PRD v3.0 Part II):
 * 1. income_score           up to +80
 * 2. tenure_score           up to +70
 * 3. volatility_score       up to +60
 * 4. diversity_score        up to +50
 * 5. consistency_score      up to +50
 * 6. trajectory_score       up to +40
 * 7. tax_compliance         up to +25
 * 8. cross_platform_growth  up to +20
 * 9. ledger_depth           up to +15
 * ─────────────────────────────────
 * Max possible bonus:      +410
 * Base + max bonus = 710, plus scaling gets to 850
 */

// Tier thresholds (matches PRD v3.0)
export type ScoreTier = 'Elite' | 'Strong' | 'Building' | 'Emerging';

export interface ScoringFactors {
  avgMonthlyIncome: number;
  platformTenureMonths: number;
  incomeVolatility: number;       // coefficient of variation (0 = perfectly stable)
  platformDiversity: number;      // number of distinct platforms
  earningConsistency: number;     // 0-1: % of months with positive earnings
  incomeTrajectory: number;       // growth slope (e.g., 0.05 = 5% monthly growth)
  taxCompliance: number;          // 0 or 1 (binary: 1099-K filed?)
  crossPlatformGrowth: number;    // 0-1: platforms added / total months
  ledgerDepth: number;            // months of verified history (capped at 36)
}

export interface ScoreResult {
  total: number;
  tier: ScoreTier;
  factors: {
    income_score: number;
    tenure_score: number;
    volatility_score: number;
    diversity_score: number;
    consistency_score: number;
    trajectory_score: number;
    tax_compliance: number;
    cross_platform_growth: number;
    ledger_depth: number;
  };
}

export function calculateKrostScore(factors: ScoringFactors): ScoreResult {
  let score = 300;

  // 1. Income Score (up to +80) — benchmark $5,000/mo
  const income_score = Math.min(80, (factors.avgMonthlyIncome / 5000) * 80);
  score += income_score;

  // 2. Tenure Score (up to +70) — 36 months = full score
  const tenure_score = Math.min(70, (factors.platformTenureMonths / 36) * 70);
  score += tenure_score;

  // 3. Volatility Score (up to +60) — inverse: lower CV = higher score
  // CV of 0 = 60 pts, CV of 1+ = 0 pts
  const volatility_score = Math.max(0, 60 * (1 - Math.min(1, factors.incomeVolatility)));
  score += volatility_score;

  // 4. Diversity Score (up to +50) — 5+ platforms = full score
  const diversity_score = Math.min(50, (factors.platformDiversity / 5) * 50);
  score += diversity_score;

  // 5. Consistency Score (up to +50) — % of months with positive earnings
  const consistency_score = Math.min(50, factors.earningConsistency * 50);
  score += consistency_score;

  // 6. Trajectory Score (up to +40) — positive growth slope
  // 0.05 (5% monthly) = ~20 pts, 0.10+ = 40 pts
  const trajectory_score = Math.max(0, Math.min(40, factors.incomeTrajectory * 400));
  score += trajectory_score;

  // 7. Tax Compliance (up to +25) — binary: filed 1099-K or equivalent
  const tax_compliance = factors.taxCompliance ? 25 : 0;
  score += tax_compliance;

  // 8. Cross-Platform Growth (up to +20) — rate of adding new platforms
  // 0.2+ (1 new platform per 5 months) = full score
  const cross_platform_growth = Math.min(20, (factors.crossPlatformGrowth / 0.2) * 20);
  score += cross_platform_growth;

  // 9. Ledger Depth (up to +15) — months of verified history
  // 36+ months = full score
  const ledger_depth = Math.min(15, (Math.min(factors.ledgerDepth, 36) / 36) * 15);
  score += ledger_depth;

  // Clamp to range
  const total = Math.min(850, Math.max(300, Math.round(score)));

  return {
    total,
    tier: getScoreTier(total),
    factors: {
      income_score: Math.round(income_score),
      tenure_score: Math.round(tenure_score),
      volatility_score: Math.round(volatility_score),
      diversity_score: Math.round(diversity_score),
      consistency_score: Math.round(consistency_score),
      trajectory_score: Math.round(trajectory_score),
      tax_compliance: Math.round(tax_compliance),
      cross_platform_growth: Math.round(cross_platform_growth),
      ledger_depth: Math.round(ledger_depth),
    },
  };
}

export function getScoreTier(score: number): ScoreTier {
  if (score >= 750) return 'Elite';
  if (score >= 680) return 'Strong';
  if (score >= 580) return 'Building';
  return 'Emerging';
}

/**
 * Generate personalized improvement tips based on score factors
 */
export function generateTips(result: ScoreResult): string[] {
  const tips: string[] = [];
  const f = result.factors;

  if (f.income_score < 40) {
    tips.push('Increase your monthly earnings to boost your income score by up to 80 points.');
  }
  if (f.diversity_score < 30) {
    tips.push('Connect a second gig platform — diversifying can add ~35 points to your score.');
  }
  if (f.tenure_score < 35) {
    tips.push('Longer platform history strengthens your score. Stick with platforms you already use.');
  }
  if (f.consistency_score < 40) {
    tips.push('Work consistently each month to improve your consistency score.');
  }
  if (f.volatility_score < 30) {
    tips.push('Stabilize your monthly earnings to reduce volatility and gain up to 60 points.');
  }
  if (f.tax_compliance === 0) {
    tips.push('Filing your 1099-K (or equivalent) adds 25 points to your Krost Score.');
  }
  if (f.ledger_depth < 10) {
    tips.push('The longer your verified income history, the better. Keep your platforms connected.');
  }
  if (f.trajectory_score < 20) {
    tips.push('Growing your income over time adds trajectory points. Aim for consistent month-over-month growth.');
  }

  return tips;
}
