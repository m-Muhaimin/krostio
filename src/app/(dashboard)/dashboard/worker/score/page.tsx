import Link from 'next/link'
import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ScoreTrendChart } from './score-trend-chart'

type ScoreFactor = {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  weight: number
}

type CreditScore = {
  consistency_score: number
  annualized_income: number
  monthly_avg_income: number
  income_volatility: number
  tenure_months: number
  platform_diversity: number
  diversity_score: number
  trajectory_label: string
  trajectory_slope: number
  lender_ready_status: string
  score_factors: ScoreFactor[]
  calculated_at: string
  expires_at?: string | null
  attestation_id?: string | null
}

const FALLBACK_FACTORS: ScoreFactor[] = [
  {
    name: 'Income stability',
    impact: 'neutral',
    description: 'Based on variance in weekly earnings over the last 6 months. Lower variance = higher score.',
    weight: 30,
  },
  {
    name: 'Platform diversity',
    impact: 'neutral',
    description: 'More income sources = lower risk. 3+ platforms is considered excellent.',
    weight: 20,
  },
  {
    name: 'Tenure',
    impact: 'neutral',
    description: 'Length of gig work history. Longer track record = more predictable income.',
    weight: 20,
  },
  {
    name: 'Income trajectory',
    impact: 'neutral',
    description: 'Are your earnings growing? Upward trend signals increasing creditworthiness.',
    weight: 15,
  },
  {
    name: 'Consistency',
    impact: 'neutral',
    description: 'How regularly you work. Fewer gaps = more reliable income stream.',
    weight: 15,
  },
]

export default async function ScoreBreakdownPage() {
  const { userId } = await requireRole(['gig_worker'])

  const supabase = await createServerSupabaseClient()
  const { data: score } = await supabase
    .from('income_verifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const hasScore = !!score
  const typedScore = score as CreditScore | null
  const factors = typedScore?.score_factors?.length ? typedScore.score_factors : FALLBACK_FACTORS
  const totalWeight = factors.reduce((sum, f) => sum + Math.abs(f.weight), 0) || 1

  const ringPct = typedScore
    ? Math.max(0, Math.min(1, typedScore.consistency_score / 100))
    : 0
  const ringDash = `${ringPct * 264} 264`

  return (
    <div>
      {/* Page Header */}
      <div className="page-header fade-up d0">
        <h1 className="page-title">My Score</h1>
        <p className="page-sub">
          {hasScore
            ? 'How your income consistency breaks down across the factors that matter most.'
            : 'How your income score is calculated. Connect platforms to see your personalized breakdown.'}
        </p>
      </div>

      {/* Content Grid: Chart + Score */}
      <div className="content-grid">
        {/* Chart Card */}
        <div className="card fade-up d1">
          <div className="card-head">
            <p className="card-title">Income History</p>
            <p className="card-sub">Your earnings trend over the last 12 months</p>
          </div>
          <ScoreTrendChart variant="light" noCard />
          <div className="chart-footer">
            <div className="chart-legend-row">
              <div className="leg-item">
                <span className="leg-swatch" style={{ backgroundColor: 'var(--color-chart-accent)' }} />
                <span>Gross income</span>
              </div>
            </div>
            <div className="chart-months">
              {typedScore && (
                <div className="cm-item">
                  <span className="text-muted-slate">Trajectory</span>
                  <span>{typedScore.trajectory_label || '—'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="card fade-up d2">
          <div className="card-head">
            <p className="card-title">Consistency Score</p>
            <p className="card-sub">Overall income reliability rating</p>
          </div>
          <div className="score-body">
            <div className="score-num">{typedScore ? typedScore.consistency_score : '—'}</div>
            {typedScore && (
              <div className="score-grade-pill">{typedScore.lender_ready_status || '—'}</div>
            )}
            <p className="score-desc">
              {typedScore
                ? `$${Math.round(typedScore.annualized_income).toLocaleString()} annualized.`
                : 'Connect platforms to see your score.'}
            </p>
            <div className="arc-wrap">
              <svg className="arc-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none" stroke="var(--color-chart-accent)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={ringDash}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl text-white font-bold">{typedScore ? typedScore.consistency_score : '—'}</span>
                <p className="text-[10px] text-white/40">/ 100</p>
              </div>
            </div>
            {typedScore && (
              <>
                <div className="pb-rows">
                  <div className="pb-row">
                    <span className="pb-name">Monthly avg</span>
                    <div className="pb-track">
                      <div className="pb-fill" style={{ width: `${Math.min(100, (typedScore.monthly_avg_income / 20000) * 100)}%` }} />
                    </div>
                    <span className="pb-pct">${typedScore.monthly_avg_income.toLocaleString()}</span>
                  </div>
                  <div className="pb-row">
                    <span className="pb-name">Tenure</span>
                    <div className="pb-track">
                      <div className="pb-fill" style={{ width: `${Math.min(100, (typedScore.tenure_months / 36) * 100)}%` }} />
                    </div>
                    <span className="pb-pct">{typedScore.tenure_months} mo</span>
                  </div>
                  <div className="pb-row">
                    <span className="pb-name">Platforms</span>
                    <div className="pb-track">
                      <div className="pb-fill" style={{ width: `${Math.min(100, (typedScore.platform_diversity / 5) * 100)}%` }} />
                    </div>
                    <span className="pb-pct">{typedScore.platform_diversity}</span>
                  </div>
                  <div className="pb-row">
                    <span className="pb-name">Volatility</span>
                    <div className="pb-track">
                      <div className="pb-fill" style={{ width: `${(1 - Math.min(1, typedScore.income_volatility)) * 100}%` }} />
                    </div>
                    <span className="pb-pct">{Math.round(typedScore.income_volatility * 100)}%</span>
                  </div>
                </div>
                <div className="trajectory-strip">
                  <span className="traj-dot" />
                  <span className="traj-text">{typedScore.trajectory_label || '—'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Factor Cards */}
      <div className="fade-up d3" style={{ marginBottom: 'var(--spacing-section-mobile)' }}>
        <div className="page-header-eyebrow">
          <span className="page-header-eyebrow-dot" />
          <span className="page-header-eyebrow-label">Factors</span>
        </div>
        <h2 className="text-heading-feature">Score factors</h2>
        <div className="grid-dashboard grid-dashboard-3 fade-up d3">
          {factors.map((factor, idx) => {
            const pctOfTotal = Math.round((Math.abs(factor.weight) / totalWeight) * 100)
            const color =
              factor.impact === 'positive'
                ? 'var(--color-deep-green)'
                : factor.impact === 'negative'
                  ? 'var(--color-error-red)'
                  : 'var(--color-ink-black)'
            return (
              <div key={`${factor.name}-${idx}`} className="card fade-up d4">
                <div className="card-head">
                  <h3 className="card-title">{factor.name}</h3>
                </div>
                <div className="card-body">
                  <div className="pb-row">
                    <span className="pb-name">Weight</span>
                    <div className="pb-track">
                      <div className="pb-fill" style={{ width: `${pctOfTotal}%`, backgroundColor: color }} />
                    </div>
                    <span className="pb-pct" style={{ color }}>
                      {factor.weight > 0 ? '+' : ''}{factor.weight}
                    </span>
                  </div>
                  <p className="score-desc" style={{ padding: 0, border: 'none' }}>{factor.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Card */}
      <div className="card fade-up d7">
        <Link href="/dashboard/worker/statements" className="stmt-row">
          <div className="stmt-icon-wrap">
            <span>📄</span>
          </div>
          <div>
            <p className="stmt-name">Income Reports</p>
            <p className="stmt-date">
              Generate a downloadable PDF with your complete income history, consistency analysis,
              platform breakdown, and verification notes.
            </p>
          </div>
          <div className="stmt-acts">
            <span className="act-btn">→</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
