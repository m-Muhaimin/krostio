import { requireRole } from '@/lib/auth-guard'

export default async function WorkerDashboard() {
  await requireRole(['gig_worker'])

  return <WorkerDashboardUI />
}

function WorkerDashboardUI() {
  return (
    <div className="space-y-14">
      {/* Header */}
      <div>
        <p className="text-mono-label text-slate">Worker dashboard</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          My score.
        </h1>
        <p className="mt-3 text-body text-slate">
          Connect your gig platforms to generate an on-chain credit score.
        </p>
      </div>

      {/* Score overview — dark feature band on white canvas */}
      <section
        className="rounded-md p-10"
        style={{ backgroundColor: 'var(--color-deep-green)', color: '#fff' }}
      >
        <div className="grid gap-12 md:grid-cols-[2fr_1fr] md:items-end">
          <div>
            <p className="text-mono-label text-white/50">Attested credit score</p>
            <div className="mt-6 flex items-end gap-6">
              <span className="font-display text-[96px] leading-none tracking-tight text-white">
                —
              </span>
              <div className="mb-3">
                <p className="text-sm text-white/65">Connect platforms to calculate</p>
                <p className="text-xs text-white/40">Score range 300–850</p>
              </div>
            </div>
            <div className="mt-8 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-coral" style={{ width: '0%' }} />
            </div>
          </div>

          <div className="space-y-4 border-l border-white/10 pl-8">
            <div>
              <p className="text-mono-label text-white/40">Connected platforms</p>
              <p className="mt-2 text-3xl font-normal text-white">0</p>
            </div>
            <div>
              <p className="text-mono-label text-white/40">Last attestation</p>
              <p className="mt-2 text-sm text-white/65">Not yet attested</p>
            </div>
          </div>
        </div>
      </section>

      {/* Connect platforms */}
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-heading-feature text-ink-black">Connect your platforms</h2>
          <p className="text-mono-label text-slate">6 supported</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Uber', initial: 'U' },
            { name: 'Lyft', initial: 'L' },
            { name: 'DoorDash', initial: 'D' },
            { name: 'Fiverr', initial: 'F' },
            { name: 'Upwork', initial: 'U' },
            { name: 'Instacart', initial: 'I' },
          ].map((platform) => (
            <button
              key={platform.name}
              className="card-bordered flex items-center gap-4 p-5 text-left transition hover:border-ink-black"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-ink-black text-sm font-medium text-white">
                {platform.initial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-black">{platform.name}</p>
                <p className="text-xs text-slate">Not connected</p>
              </div>
              <span className="link-editorial text-sm">Connect →</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-heading-feature mb-6 text-ink-black">Recent activity</h2>
        <div className="card-bordered px-8 py-12 text-center">
          <p className="text-mono-label text-slate">Empty state</p>
          <p className="mt-3 text-sm text-ink">No activity yet.</p>
          <p className="mt-1 text-sm text-slate">
            Connect a platform to start building your credit history.
          </p>
        </div>
      </section>
    </div>
  )
}
