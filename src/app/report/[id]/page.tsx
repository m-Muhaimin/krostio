import { notFound } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceSupabaseClient()

  // 1. Fetch report record
  const { data: report, error } = await supabase
    .from('reports')
    .select('*, profiles(name)')
    .eq('id', id)
    .single()

  if (error || !report) {
    notFound()
  }

  // 2. Check expiry
  const expiresAt = new Date(report.expires_at)
  const isExpired = expiresAt < new Date()

  if (isExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="text-display-section text-ink-black">Report expired.</h1>
        <p className="mt-4 text-body text-slate">
          This income verification report has expired and is no longer available.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Back to Krostio
        </Link>
      </div>
    )
  }

  // 3. Extract snapshots
  const score = report.score_snapshot as any
  const ledger = report.ledger_snapshot as any
  const workerName = (report.profiles as any)?.name || 'Gig Worker'

  return (
    <div className="min-h-screen bg-canvas pb-20">
      {/* Header / Nav Bar */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-ink-black flex items-center justify-center text-white font-display text-xs">K</div>
            <span className="font-display text-xl tracking-tight text-ink-black">Krostio</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-mono-label text-slate">Verified Report</span>
            <a href={`/api/report/share/${id}`} className="btn-primary text-xs py-2 px-4">
              Download PDF
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-12 max-w-4xl px-6">
        {/* Verification Banner */}
        <div className="card-bordered bg-pale-green/30 border-emerald-100 mb-12 flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">Verified Income Report</p>
              <p className="text-xs text-emerald-700">Data sourced via authenticated API connection</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-mono-label text-emerald-800">Date Prepared</p>
            <p className="text-sm font-medium text-emerald-900">{format(new Date(report.created_at), 'MMMM d, yyyy')}</p>
          </div>
        </div>

        {/* Hero Section */}
        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-display-product text-ink-black">{workerName}</h1>
            <p className="mt-4 text-body-lg text-slate">
              {score?.trajectory_label === 'growing' ? 'Earning growth verified over last 12 months.' :
               score?.trajectory_label === 'stable' ? 'Stable income patterns detected across platforms.' :
               'Verified gig economy earnings ledger.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="card-stone py-4 px-6">
                <p className="text-mono-label text-slate">Consistency Score</p>
                <p className="text-heading-section text-ink-black mt-2">{score?.consistency_score || '—'}</p>
              </div>
              <div className="card-stone py-4 px-6">
                <p className="text-mono-label text-slate">Annualized Income</p>
                <p className="text-heading-section text-ink-black mt-2">
                  ${(score?.annualized_income || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="agent-console flex flex-col justify-center">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-mono-label text-white/50">Verification Metadata</span>
                  <span className="agent-console-chip">v2.0 Standard</span>
                </div>
                <div className="rule-hairline opacity-10"></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Platform Diversity</span>
                    <span className="text-white font-medium">{score?.platform_diversity} Platforms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Tenure</span>
                    <span className="text-white font-medium">{score?.tenure_months} Months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Data Freshness</span>
                    <span className="text-white font-medium">Within 24h</span>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Score Factors */}
        <section className="mt-20">
          <h2 className="text-heading-section text-ink-black">Scoring Signals</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {(score?.score_factors || []).map((f: any, idx: number) => (
              <div key={idx} className="card-bordered flex gap-4 p-5">
                <div className={`mt-1 h-2 w-2 rounded-full ${f.impact === 'positive' ? 'bg-emerald-500' : f.impact === 'negative' ? 'bg-coral' : 'bg-slate'}`}></div>
                <div>
                  <h3 className="text-sm font-medium text-ink-black">{f.name}</h3>
                  <p className="mt-1 text-xs text-slate leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ledger Summary */}
        <section className="mt-20">
          <div className="flex items-baseline justify-between">
            <h2 className="text-heading-section text-ink-black">Earnings Ledger</h2>
            <p className="text-mono-label text-slate">Trailing 12 Months</p>
          </div>
          <div className="mt-8 card-bordered overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-soft-stone/50 border-b border-hairline">
                  <th className="px-6 py-4 text-mono-label text-slate">Period</th>
                  <th className="px-6 py-4 text-mono-label text-slate">Platform(s)</th>
                  <th className="px-6 py-4 text-mono-label text-slate text-right">Net Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {(ledger || []).slice(-12).reverse().map((m: any, idx: number) => (
                  <tr key={idx} className="hover:bg-soft-stone/20 transition">
                    <td className="px-6 py-4 text-sm font-medium text-ink-black">{m.month}</td>
                    <td className="px-6 py-4 text-xs text-slate">{m.platforms || 'Gig Platforms'}</td>
                    <td className="px-6 py-4 text-sm font-mono text-ink-black text-right">${m.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Verification Statement */}
        <section className="mt-24 border-t border-hairline pt-12">
          <div className="card-stone">
            <h3 className="text-heading-feature text-ink-black">Verification Statement</h3>
            <p className="mt-4 text-sm text-slate leading-relaxed">
              This report was generated by Krostio on {format(new Date(report.created_at), 'MMMM d, yyyy')}.
              Income data displayed in this report was sourced directly from the gig platform(s) via authenticated
              API connections authorized by the worker. Data is not self-reported.
              <br /><br />
              Krostio is an income verification tool, not a credit reporting agency. This report reflects
              earnings data as of the report date and should be verified for currency by the receiving institution.
              Krostio makes no representation regarding creditworthiness or loan eligibility.
            </p>
            <div className="mt-8 flex items-center gap-8">
              <div>
                <p className="text-mono-label text-slate">Report ID</p>
                <p className="text-xs font-mono text-ink-black mt-1">{report.id}</p>
              </div>
              <div>
                <p className="text-mono-label text-slate">Status</p>
                <p className="text-xs font-medium text-emerald-600 mt-1 uppercase tracking-wider">Active & Verified</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t border-hairline py-12 text-center">
        <p className="text-xs text-slate">
          © 2026 Krostio Platform. All rights reserved.
          <Link href="/privacy" className="ml-4 hover:text-ink-black">Privacy Policy</Link>
          <Link href="/terms" className="ml-4 hover:text-ink-black">Terms of Service</Link>
        </p>
      </footer>
    </div>
  )
}
