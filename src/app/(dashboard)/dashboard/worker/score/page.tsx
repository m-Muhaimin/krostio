import { requireRole } from '@/lib/auth-guard'

export default async function ScoreBreakdownPage() {
  await requireRole(['gig_worker'])

  const factors = [
    {
      name: 'Income stability',
      weight: '200 pts',
      score: 85,
      desc: 'Based on variance in weekly earnings over the last 6 months. Lower variance = higher score.',
    },
    {
      name: 'Platform diversity',
      weight: '150 pts',
      score: 60,
      desc: 'More income sources = lower risk. 3+ platforms is considered excellent.',
    },
    {
      name: 'Tenure',
      weight: '120 pts',
      score: 45,
      desc: 'Length of gig work history. Longer track record = more predictable income.',
    },
    {
      name: 'Income trajectory',
      weight: '80 pts',
      score: 70,
      desc: 'Are your earnings growing? Upward trend signals increasing creditworthiness.',
    },
    {
      name: 'Consistency',
      weight: '50 pts',
      score: 90,
      desc: 'How regularly you work. Fewer gaps = more reliable income stream.',
    },
    {
      name: 'Debt-to-income',
      weight: '50 pts',
      score: 100,
      desc: 'Lower ratio = better. Based on self-reported liabilities vs earnings.',
    },
  ]

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Worker</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Score breakdown.
        </h1>
        <p className="mt-3 text-body text-slate">
          How your credit score is calculated. Connect platforms to see your personalized breakdown.
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
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#ff7759"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(350 / 550) * 264} 264`}
              />
            </svg>
            <div className="absolute text-center">
              <span className="font-display text-5xl text-white">—</span>
              <p className="text-xs text-white/50">/ 850</p>
            </div>
          </div>
          <div>
            <p className="text-mono-label text-white/50">Attested score</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-white">
              Connect platforms to calculate.
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="agent-console-chip">300–579 Poor</span>
              <span className="agent-console-chip">580–669 Fair</span>
              <span className="agent-console-chip">670–739 Good</span>
              <span className="agent-console-chip">740–850 Excellent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Factor Breakdown — rule-separated list */}
      <section>
        <h2 className="mb-6 text-heading-feature text-ink-black">Score factors</h2>
        <ul className="divide-y divide-hairline border-t border-hairline">
          {factors.map((factor) => (
            <li key={factor.name} className="py-6">
              <div className="flex items-baseline justify-between gap-6">
                <div>
                  <h3 className="text-lg text-ink-black">{factor.name}</h3>
                  <p className="text-mono-label mt-1 text-slate">Weight {factor.weight}</p>
                </div>
                <span className="font-display text-3xl tracking-tight text-ink-black">
                  {factor.score}
                </span>
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-ink-black"
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              <p className="mt-3 max-w-3xl text-sm text-slate">{factor.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* On-chain attestation */}
      <section className="card-stone">
        <p className="text-mono-label text-slate">Attestation</p>
        <h2 className="mt-3 text-heading-feature text-ink-black">On-chain proof</h2>
        <p className="mt-4 max-w-2xl text-sm text-slate">
          Your credit score is attested on Base L2 — you own it, and only you can grant lenders
          permission to view it. Each attestation is cryptographically signed and verifiable
          on-chain.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-md border border-hairline bg-white px-4 py-3">
            <p className="text-mono-label text-slate">Contract</p>
            <p className="mt-1 font-mono text-sm text-ink-black">Not deployed</p>
          </div>
          <div className="rounded-md border border-hairline bg-white px-4 py-3">
            <p className="text-mono-label text-slate">Network</p>
            <p className="mt-1 text-sm text-ink-black">Base Sepolia (Testnet)</p>
          </div>
        </div>
      </section>
    </div>
  )
}
