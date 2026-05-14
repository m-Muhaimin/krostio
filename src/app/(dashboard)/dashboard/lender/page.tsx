import { requireRole } from '@/lib/auth-guard'

export default async function LenderDashboard() {
  await requireRole(['lender'])

  return (
    <div className="space-y-14">
      <div>
        <p className="text-mono-label text-slate">Lender dashboard</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Verify gig-worker income.
        </h1>
        <p className="mt-3 text-body text-slate">
          Look up on-chain attested credit scores in seconds.
        </p>
      </div>

      {/* Stats — rule-separated row, no card chrome */}
      <section className="grid gap-0 border-t border-hairline md:grid-cols-4">
        {[
          { label: 'Verifications this month', value: '0 / 50' },
          { label: 'Pending requests', value: '0' },
          { label: 'Approved', value: '0' },
          { label: 'Avg. credit score', value: '—' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`py-8 ${i < 3 ? 'md:border-r' : ''} border-hairline md:px-8`}
          >
            <p className="text-mono-label text-slate">{stat.label}</p>
            <p className="mt-3 font-display text-4xl font-normal tracking-tight text-ink-black">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Quick verify — dark navy band */}
      <section
        className="rounded-md p-10"
        style={{ backgroundColor: 'var(--color-dark-navy)', color: '#fff' }}
      >
        <p className="text-mono-label text-white/50">Quick verify</p>
        <h2 className="mt-4 font-display text-[32px] leading-tight tracking-tight text-white">
          Look up a worker.
        </h2>
        <p className="mt-3 max-w-lg text-sm text-white/65">
          Enter an email or wallet address. We&apos;ll show you the attested score and verify
          it against the Base L2 chain.
        </p>
        <form className="mt-8 flex max-w-2xl gap-3">
          <input
            type="text"
            placeholder="worker@example.com or 0x71C…dE3a"
            className="flex-1 rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white"
          />
          <button type="submit" className="btn-primary-light">Verify</button>
        </form>
      </section>

      {/* Recent verifications */}
      <section>
        <h2 className="text-heading-feature mb-6 text-ink-black">Recent verifications</h2>
        <div className="card-bordered px-8 py-12 text-center">
          <p className="text-mono-label text-slate">Empty state</p>
          <p className="mt-3 text-sm text-ink">No verifications yet.</p>
          <p className="mt-1 text-sm text-slate">
            Enter a worker ID above to request their credit score.
          </p>
        </div>
      </section>
    </div>
  )
}
