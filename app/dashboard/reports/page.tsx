'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';
import { FileText, Copy, Check, ExternalLink, RefreshCw, Plus, AlertCircle } from 'lucide-react';

function formatDate(str: string | null): string {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-ink/50 hover:text-ink transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function ReportsPage() {
  const { reports, score, tier, isLoading, error, refresh } = useKrostData();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  const canGenerate = score !== null && score >= 300;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    setGenSuccess(null);

    try {
      const res = await fetch('/api/reports/generate', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to generate report');
      }
      const data = await res.json();
      setGenSuccess('Report generated successfully!');
      refresh();
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 pt-24 lg:pt-10 max-w-6xl">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-24 lg:pt-10 max-w-6xl">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <h2 className="font-display text-4xl font-medium tracking-tight">Krost Verifier</h2>
          <p className="text-ink/60 mt-1">Generate PDF reports, manage shareable verification links, and track who has viewed your reports.</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 text-sm text-ink/50 hover:text-ink transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="card-cohere p-4 mb-8 border-l-4 border-l-coral">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {genError && (
        <div className="card-cohere p-4 mb-6 border-l-4 border-l-coral">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-coral" />
            <p className="text-sm">{genError}</p>
          </div>
        </div>
      )}

      {genSuccess && (
        <div className="card-cohere p-4 mb-6 border-l-4 border-l-green-500 bg-green-50/20">
          <p className="text-sm font-medium text-green-700">{genSuccess}</p>
        </div>
      )}

      {/* Generate New Report */}
      <div className="card-cohere p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-medium tracking-tight">Generate a New Report</h3>
            <p className="text-ink/60 text-sm mt-1">
              {canGenerate
                ? `Your current score (${score}) qualifies you for a new verification report.`
                : score === null
                  ? 'Connect a platform first to establish your Krost Score.'
                  : 'A minimum score of 300 is required to generate reports.'}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !canGenerate}
            className="flex items-center gap-2 px-6 py-3 rounded-cohere-pill bg-brand-black text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Generate New Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="card-cohere p-6">
        <h3 className="font-display text-xl font-medium tracking-tight mb-6">Your Reports</h3>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center mb-4">
              <FileText size={24} className="text-ink/30" />
            </div>
            <p className="text-ink/60 text-sm">No reports yet.</p>
            <p className="text-ink/40 text-xs mt-1">
              Generate your first report to share your verified income with lenders.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-cohere-sm bg-soft-stone border border-hairline"
              >
                <div className="w-10 h-10 rounded-cohere-sm bg-brand-black/5 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-ink" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h4 className="font-medium text-sm capitalize">
                      {report.type.replace(/_/g, ' ')}
                    </h4>
                    {report.score && (
                      <span className="text-xs font-mono font-medium bg-ink/10 px-2 py-0.5 rounded-cohere-pill">
                        Score: {report.score}
                      </span>
                    )}
                    {report.tier && (
                      <span className="text-xs font-mono font-medium bg-coral/10 text-coral px-2 py-0.5 rounded-cohere-pill">
                        {report.tier}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-ink/50">
                    <span>Created {formatDate(report.createdAt)}</span>
                    {report.expiresAt && (
                      <span>Expires {formatDate(report.expiresAt)}</span>
                    )}
                  </div>

                  {report.shareToken && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-xs bg-white px-2 py-0.5 rounded border border-hairline font-mono text-ink/60 truncate max-w-[200px] sm:max-w-[280px] block">
                        {report.shareToken}
                      </code>
                      <CopyButton text={report.shareToken} />
                      {report.shareUrl && (
                        <a
                          href={report.shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-action-blue hover:underline"
                        >
                          <ExternalLink size={12} />
                          Open
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {report.shareUrl && (
                  <a
                    href={report.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-cohere-pill border border-hairline text-xs font-medium hover:bg-black/5 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    <ExternalLink size={14} />
                    View Report
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
