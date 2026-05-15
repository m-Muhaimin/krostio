import { ReportGateClient } from './report-gate-client'

/**
 * Public page: /r/[shareToken]
 * Lender-facing email gate for shared income verification reports.
 *
 * This page is not behind auth middleware — it's accessible to anyone
 * with the share link. The email must be entered before seeing the PDF.
 */
export default async function ReportGatePage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  const { shareToken } = await params

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-cream p-6">
      <div className="w-full max-w-md">
        {/* Krostio branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-black">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="mt-4 font-display text-2xl tracking-tight text-ink-black">
            Income Verification Report
          </h1>
          <p className="mt-1 text-sm text-slate">
            This report was shared with you securely via Krostio.
            Enter your email to access the document.
          </p>
        </div>

        {/* Email gate form */}
        <ReportGateClient shareToken={shareToken} />

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate">
          Krostio · Gig worker income verification
        </p>
      </div>
    </div>
  )
}
