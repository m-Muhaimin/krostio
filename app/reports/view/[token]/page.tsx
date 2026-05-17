'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';

interface ReportData {
  id: string;
  report_type: string;
  score_snapshot: {
    total: number;
    tier: string;
    factors: Record<string, number>;
  } | null;
  ledger_snapshot: {
    total_platforms: number;
    avg_monthly_income: number;
    total_career_earnings: number;
  } | null;
  is_revoked: boolean;
  expires_at: string | null;
  created_at: string;
  viewer_count: number;
}

export default function ReportViewPage() {
  const params = useParams();
  const token = params.token as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailGateDone, setEmailGateDone] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);

  // Fetch report metadata on mount
  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/view/${token}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Report not found');
        }
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [token]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmittingEmail(true);
    try {
      const res = await fetch(`/api/reports/view/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to verify email');
      }
      const data = await res.json();
      setReport(data.report);
      setEmailGateDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-ink/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium mb-2">Report Unavailable</h1>
          <p className="text-ink/60 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <p className="text-ink/60">Report not found.</p>
      </div>
    );
  }

  if (report.is_revoked) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium mb-2">Report Revoked</h1>
          <p className="text-ink/60">This report has been revoked by the owner and is no longer available.</p>
        </div>
      </div>
    );
  }

  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-ink/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium mb-2">Report Expired</h1>
          <p className="text-ink/60">This shareable report has expired. Ask the owner to generate a new one.</p>
        </div>
      </div>
    );
  }

  // Show email gate if not yet done
  if (!emailGateDone) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-ink/5 flex items-center justify-center">
              <svg className="w-7 h-7 text-ink/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-medium mb-2">Verify to View Report</h1>
            <p className="text-ink/60 text-sm leading-relaxed">
              Enter your email to access this Krost Verifier report.
              The report owner will be notified when you view it.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/20 transition-all"
            />
            <button
              type="submit"
              disabled={submittingEmail}
              className="w-full btn-ink py-3 rounded-xl font-medium disabled:opacity-50 transition-all"
            >
              {submittingEmail ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                'View Report'
              )}
            </button>
          </form>

          <p className="text-xs text-ink/40 text-center mt-6">
            Your email will only be shared with the report owner.
          </p>
        </motion.div>
      </div>
    );
  }

  // Report content — shown after email gate
  const score = report.score_snapshot?.total ?? null;
  const tier = report.score_snapshot?.tier ?? null;
  const factors = report.score_snapshot?.factors ?? {};
  const ledger = report.ledger_snapshot;

  function getTierColor(t: string | null): string {
    switch (t) {
      case 'Elite': return 'text-emerald-600 bg-emerald-50';
      case 'Strong': return 'text-blue-600 bg-blue-50';
      case 'Building': return 'text-amber-600 bg-amber-50';
      case 'Emerging': return 'text-slate-600 bg-slate-100';
      default: return 'text-ink/60 bg-ink/5';
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-medium mb-1">Krost Verifier Report</h1>
            <p className="text-ink/50 text-sm">
              Verified income report &middot; Generated {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Score Display */}
          {score !== null && (
            <div className="bg-white rounded-2xl border border-ink/5 p-8 mb-6 text-center">
              <div className="text-6xl font-display font-bold tracking-tight mb-2">{score}</div>
              {tier && (
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getTierColor(tier)}`}>
                  {tier}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          {ledger && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-ink/5 p-4 text-center">
                <div className="text-2xl font-display font-semibold">{ledger.total_platforms}</div>
                <div className="text-xs text-ink/50 mt-1">Platforms</div>
              </div>
              <div className="bg-white rounded-xl border border-ink/5 p-4 text-center">
                <div className="text-2xl font-display font-semibold">
                  ${ledger.avg_monthly_income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-ink/50 mt-1">Avg Monthly</div>
              </div>
              <div className="bg-white rounded-xl border border-ink/5 p-4 text-center">
                <div className="text-2xl font-display font-semibold">
                  ${ledger.total_career_earnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-ink/50 mt-1">Total Earnings</div>
              </div>
            </div>
          )}

          {/* Factors Breakdown */}
          {Object.keys(factors).length > 0 && (
            <div className="bg-white rounded-2xl border border-ink/5 p-6">
              <h3 className="font-display font-medium text-sm mb-4 text-ink/60 uppercase tracking-wider">Score Factors</h3>
              <div className="space-y-3">
                {Object.entries(factors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm text-ink/70 w-40 flex-shrink-0 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className="flex-1 h-2 bg-ink/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ink rounded-full transition-all"
                        style={{ width: `${Math.min(100, (value / 80) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-ink w-8 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-ink/40">
              Powered by Krostio &middot; Financial Identity for the Gig Economy
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
