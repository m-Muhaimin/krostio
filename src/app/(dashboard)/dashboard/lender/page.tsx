import Link from 'next/link'
import { requireRole } from '@/lib/auth-guard'
import { checkLenderQuota } from '@/lib/lender-quota'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const PLAN_LABEL: Record<'free' | 'pro' | 'scale', string> = {
  free: 'Free',
  pro: 'Lender Pro',
  scale: 'Lender Scale',
}

export default async function LenderDashboard() {
  const { userId: lenderId } = await requireRole(['lender'])

  const supabase = await createServerSupabaseClient()

  const quota = await checkLenderQuota(lenderId)

  // Pending / approved counts (best effort — non-fatal if RLS hides any)
  let pending = 0
  let approved = 0
  {
    const { count: pendingCount } = await supabase
      .from('lender_requests')
      .select('id', { count: 'exact', head: true })
      .eq('lender_id', lenderId)
      .eq('status', 'pending')
    pending = pendingCount ?? 0

    const { count: approvedCount } = await supabase
      .from('lender_requests')
      .select('id', { count: 'exact', head: true })
      .eq('lender_id', lenderId)
      .eq('status', 'approved')
    approved = approvedCount ?? 0
  }

  const pct = quota.limit > 0 ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0
  const planLabel = PLAN_LABEL[quota.plan]
  const showUpgrade = quota.plan !== 'scale'

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

      {/* Verification quota — primary usage card */}
      <section className="card-stone">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-mono-label text-slate">Verifications this month</p>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-5xl font-normal tracking-tight text-ink-black">
                {quota.used}
              </span>
              <span className="text-sm text-slate">/ {quota.limit} used</span>
            </div>
            <p className="mt-2 text-sm text-slate">
              Plan: <span className="font-medium text-ink-black">{planLabel}</span>
              {quota.remaining > 0 ? (
                <> · {quota.remaining} remaining</>
              ) : (
                <> · <span style={{ color: 'var(--color-coral)' }}>quota reached</span></>
              )}
            </p>

            <div className="mt-5 h-2 w-full max-w-md overflow-hidden rounded-full bg-hairline">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor:
                    pct >= 100
                      ? 'var(--color-coral)'
                      : pct >= 80
                        ? 'var(--color-coral)'
                        : 'var(--color-deep-green)',
                }}
              />
            </div>
          </div>

          {showUpgrade && (
            <div className="flex flex-col items-end gap-3">
              <Link href="/dashboard/billing" className="btn-primary">
                Upgrade →
              </Link>
              <Link href="/dashboard/billing" className="link-editorial text-sm">
                See plans
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats — rule-separated row, no card chrome */}
      <section className="grid gap-0 border-t border-hairline md:grid-cols-3">
        {[
          { label: 'Pending requests', value: String(pending) },
          { label: 'Approved', value: String(approved) },
          { label: 'Plan', value: planLabel },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`py-8 ${i < 2 ? 'md:border-r' : ''} border-hairline md:px-8`}
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
        <form action="/dashboard/lender/search" className="mt-8 flex max-w-2xl gap-3">
          <input
            type="text"
            name="q"
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
