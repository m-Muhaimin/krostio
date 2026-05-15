import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

function trajectoryColor(label: string): string {
  const l = (label || '').toLowerCase()
  if (l.includes('growing') || l.includes('up') || l.includes('rising')) return 'var(--color-deep-green)'
  if (l.includes('declining') || l.includes('down') || l.includes('falling')) return 'var(--color-error-red)'
  return 'var(--color-ink-black)'
}

function lenderReadyColor(status: string): string {
  const s = (status || '').toLowerCase()
  if (s.includes('ready') || s.includes('approved') || s.includes('strong')) return 'var(--color-deep-green)'
  if (s.includes('not') || s.includes('weak') || s.includes('reject')) return 'var(--color-error-red)'
  return 'var(--color-ink-black)'
}

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

  // Ring rendering: consistency_score 0-100, map to 0-264 (full circle dasharray)
  const ringPct = typedScore
    ? Math.max(0, Math.min(1, typedScore.consistency_score / 100))
    : 0
  const ringDash = `${ringPct * 264} 264`

  const contractAddress = process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS
  const hasContract = contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000'

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Worker</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Score breakdown.
        </h1>
        <p className="mt-3 text-body text-slate">
          {hasScore
            ? 'How your income consistency breaks down across the factors that matter most.'
            : 'How your income score is calculated. Connect platforms to see your personalized breakdown.'}
        </p>
      </div>

      {/* Overall Score Ring — deep green band */}
      <section
        className="rounded-md p-12"
        style={{ backgroundColor: 'var(--color-deep-green)', color: '#fff' }}
      >
        <div className="grid items-center gap-12 md:grid-cols-[auto_1fr]">
          <div className="relative flex h-44 w-44 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#ff7759"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringDash}
              />
            </svg>
            <div className="absolute text-center">
              <span className="font-display text-5xl text-white">
                {typedScore ? typedScore.consistency_score : '—'}
              </span>
              <p className="text-xs text-white/50">/ 100</p>
            </div>
          </div>
          <div>
            <p className="text-mono-label text-white/50">Consistency score</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-white">
              {typedScore
                ? `$${Math.round(typedScore.annualized_income).toLocaleString()} annualized.`
                : 'Connect platforms to calculate.'}
            </h2>
            {typedScore && (
              <>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: trajectoryColor(typedScore.trajectory_label),
                      color: '#fff',
                    }}
                  >
                    Trajectory: {typedScore.trajectory_label || 'unknown'}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: lenderReadyColor(typedScore.lender_ready_status),
                      color: '#fff',
                    }}
                  >
                    Lender: {typedScore.lender_ready_status || 'pending'}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/70">
                  <span>${typedScore.monthly_avg_income.toLocaleString()}/mo avg</span>
                  <span>{typedScore.tenure_months} mo tenure</span>
                  <span>{typedScore.platform_diversity} platforms</span>
                  <span>Diversity: {typedScore.diversity_score}</span>
                  <span>{Math.round(typedScore.income_volatility * 100)}% volatility</span>
                </div>
              </>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="agent-console-chip">0–40 Poor</span>
              <span className="agent-console-chip">41–60 Fair</span>
              <span className="agent-console-chip">61–80 Good</span>
              <span className="agent-console-chip">81–100 Excellent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Factor Breakdown */}
      <section>
        <h2 className="mb-6 text-heading-feature text-ink-black">Score factors</h2>
        <ul className="divide-y divide-hairline border-t border-hairline">
          {factors.map((factor, idx) => {
            const pctOfTotal = Math.round((Math.abs(factor.weight) / totalWeight) * 100)
            return (
              <li key={`${factor.name}-${idx}`} className="py-6">
                <div className="flex items-baseline justify-between gap-6">
                  <div>
                    <h3 className="text-lg text-ink-black">{factor.name}</h3>
                    <p className="text-mono-label mt-1 text-slate">
                      {factor.impact === 'positive' && '↑ '}
                      {factor.impact === 'negative' && '↓ '}
                      Weight {Math.abs(factor.weight)} pts
                    </p>
                  </div>
                  <span
                    className="font-display text-3xl tracking-tight"
                    style={{
                      color:
                        factor.impact === 'positive'
                          ? 'var(--color-deep-green)'
                          : factor.impact === 'negative'
                            ? 'var(--color-error-red)'
                            : 'var(--color-ink-black)',
                    }}
                  >
                    {factor.weight > 0 ? '+' : ''}
                    {factor.weight}
                  </span>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-hairline">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pctOfTotal}%`,
                      backgroundColor:
                        factor.impact === 'positive'
                          ? 'var(--color-deep-green)'
                          : factor.impact === 'negative'
                            ? 'var(--color-error-red)'
                            : 'var(--color-ink-black)',
                    }}
                  />
                </div>
                <p className="mt-3 max-w-3xl text-sm text-slate">{factor.description}</p>
              </li>
            )
          })}
        </ul>
      </section>

      {/* On-chain attestation */}
      <section className="card-stone">
        <p className="text-mono-label text-slate">Attestation</p>
        <h2 className="mt-3 text-heading-feature text-ink-black">On-chain proof</h2>
        <p className="mt-4 max-w-2xl text-sm text-slate">
          Your income score is attested on Base L2 — you own it, and only you can grant lenders
          permission to view it. Each attestation is cryptographically signed and verifiable
          on-chain.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-md border border-hairline bg-white px-4 py-3">
            <p className="text-mono-label text-slate">Contract</p>
            <p className="mt-1 font-mono text-sm text-ink-black">
              {hasContract
                ? `${contractAddress.slice(0, 6)}…${contractAddress.slice(-4)}`
                : 'Not deployed'}
            </p>
          </div>
          <div className="rounded-md border border-hairline bg-white px-4 py-3">
            <p className="text-mono-label text-slate">Network</p>
            <p className="mt-1 text-sm text-ink-black">Base Sepolia (Testnet)</p>
          </div>
          {typedScore?.attestation_id && (
            <div className="rounded-md border border-hairline bg-white px-4 py-3">
              <p className="text-mono-label text-slate">Attestation ID</p>
              <p className="mt-1 font-mono text-sm text-ink-black">
                {typedScore.attestation_id.slice(0, 10)}…
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
