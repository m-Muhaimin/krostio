import { requireRole } from '@/lib/auth-guard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceSupabaseClient } from '@/lib/supabase-service'
import { GenerateReportButton } from '../generate-report-button'
import { RevokeButton } from '../revoke-button'
import { ReportViewsSection } from './report-views'

type Report = {
  id: string
  created_at: string
  expires_at: string
  viewer_count: number | null
  is_expired: boolean
}

type ReportView = {
  id: string
  report_id: string
  viewer_email: string | null
  viewed_at: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function ReportsPage() {
  await requireRole(['gig_worker'])
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user has a Krost Score (300-850) — required to generate reports
  const { data: krostScore } = await supabase
    .from('krost_scores')
    .select('score, tier')
    .eq('user_id', user!.id)
    .maybeSingle()

  const hasScore = !!krostScore
  const score = krostScore?.score ?? null
  const scoreTier = krostScore?.tier ?? null

  // Fetch reports
  let reports: Report[] = []
  try {
    const service = createServiceSupabaseClient()
    const { data } = await service
      .from('reports')
      .select('id, created_at, expires_at, viewer_count')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50)
    reports = (data ?? []).map((r) => ({
      ...r,
      is_expired: new Date(r.expires_at).getTime() < Date.now(),
    }))
  } catch {
    // Fallback to server client
    const { data } = await supabase
      .from('reports')
      .select('id, created_at, expires_at, viewer_count')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50)
    reports = (data ?? []).map((r) => ({
      ...r,
      is_expired: new Date(r.expires_at).getTime() < Date.now(),
    }))
  }

  const activeReports = reports.filter((r) => !r.is_expired)
  const expiredReports = reports.filter((r) => r.is_expired)
  const totalViews = reports.reduce((sum, r) => sum + (r.viewer_count ?? 0), 0)

  // Fetch report views for access log
  let reportViews: ReportView[] = []
  if (reports.length > 0) {
    try {
      const service = createServiceSupabaseClient()
      const reportIds = reports.map((r) => r.id)
      const { data: views } = await service
        .from('report_views')
        .select('id, report_id, viewer_email, viewed_at')
        .in('report_id', reportIds)
        .order('viewed_at', { ascending: false })
        .limit(50)
      reportViews = views ?? []
    } catch {
      // Views not available — skip silently
    }
  }

  return (
    <div className="space-y-14">
      {/* Header */}
      <div>
        <p className="text-mono-label text-slate">Worker</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Reports.
        </h1>
        <p className="mt-3 text-body text-slate">
          Generate lender-ready income reports and manage your shareable links.
        </p>
      </div>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card-stone p-6">
          <p className="text-mono-label text-slate">Total reports</p>
          <p className="mt-2 font-display text-3xl tracking-tight text-ink-black">
            {reports.length}
          </p>
        </div>
        <div className="card-stone p-6">
          <p className="text-mono-label text-slate">Active links</p>
          <p className="mt-2 font-display text-3xl tracking-tight text-deep-green">
            {activeReports.length}
          </p>
        </div>
        <div className="card-stone p-6">
          <p className="text-mono-label text-slate">Total views</p>
          <p className="mt-2 font-display text-3xl tracking-tight text-ink-black">
            {totalViews}
          </p>
        </div>
      </section>

      {/* Generate report */}
      {hasScore && (
        <section className="card-stone p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-lg">
              <p className="font-display text-xl text-ink-black">Generate new report</p>
              <p className="mt-2 text-sm text-slate">
                Create a lender-ready PDF with your income summary, Krost Score, and platform
                profile. Each report is timestamped and shareable via a unique link.
                {reports.length === 0 ? ' Your first report is free.' : ''}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="font-display text-2xl text-ink-black">{score}</span>
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  scoreTier === 'elite' ? 'bg-green-100 text-green-800' :
                  scoreTier === 'strong' ? 'bg-blue-100 text-blue-800' :
                  scoreTier === 'building' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {scoreTier}
                </span>
              </div>
            </div>
            <GenerateReportButton hasReports={reports.length > 0} />
          </div>
        </section>
      )}

      {/* Active reports */}
      {activeReports.length > 0 && (
        <section>
          <h2 className="mb-6 text-heading-feature text-ink-black">Active reports</h2>
          <div className="space-y-3">
            {activeReports.map((report) => (
              <div key={report.id} className="card-bordered flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-black">
                    Report · {formatDate(report.created_at)}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    Expires {formatDate(report.expires_at)}
                    {' · '}
                    {report.viewer_count ?? 0} view{(report.viewer_count ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-mono-label text-xs text-deep-green">Active</span>
                  <RevokeButton reportId={report.id} />
                  <a
                    href={`/api/report/share/${report.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-editorial text-sm"
                  >
                    Download PDF →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Expired reports */}
      {expiredReports.length > 0 && (
        <section>
          <h2 className="mb-6 text-heading-feature text-ink-black">Expired reports</h2>
          <div className="space-y-2">
            {expiredReports.map((report) => (
              <div key={report.id} className="card-bordered flex items-center justify-between gap-4 p-5 opacity-60">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-black">
                    Report · {formatDate(report.created_at)}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    Expired {formatDate(report.expires_at)}
                    {' · '}
                    {report.viewer_count ?? 0} view{(report.viewer_count ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="text-mono-label text-xs text-slate">Expired</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Access log — who viewed your reports */}
      {reportViews.length > 0 && (
        <section>
          <h2 className="mb-6 text-heading-feature text-ink-black">Recent views</h2>
          <p className="mt-1 mb-6 text-sm text-slate">
            Lenders who have accessed your shared reports. Viewers are logged when they enter
            their email through the share link gate.
          </p>
          <ReportViewsSection views={reportViews} reports={reports} />
        </section>
      )}

      {/* Empty state */}
      {reports.length === 0 && (
        <section className="card-stone p-12 text-center">
          <p className="font-display text-xl text-ink-black">No reports yet</p>
          <p className="mt-2 text-sm text-slate">
            {hasScore
              ? 'Click "Generate report" above to create your first income report.'
              : 'Connect platforms and calculate your score first, then generate reports.'}
          </p>
          {!hasScore && (
            <a
              href="/dashboard/worker/connections"
              className="btn-ink mt-6 inline-flex items-center gap-2 text-sm"
            >
              Connect platforms →
            </a>
          )}
        </section>
      )}
    </div>
  )
}
