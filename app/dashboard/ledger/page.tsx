'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { useKrostData } from '@/hooks/use-krost-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  DollarSign,
  Layers,
  TrendingUp,
  Wallet,
} from 'lucide-react';

/* ---------- helpers ---------- */

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMonth(monthStr: string) {
  // month comes as 'YYYY-MM' from the API
  const [y, m] = monthStr.split('-');
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/* ---------- platform icons (simple label badges) ---------- */

const PLATFORM_COLORS: Record<string, string> = {
  stripe: '#635bff',
  plaid: '#6d4c41',
  uber: '#000000',
  lyft: '#ff00bf',
  doordash: '#ff3008',
  grubhub: '#ff6500',
  upwork: '#15a800',
  fiverr: '#1dbf73',
  instacart: '#ff9800',
};

function platformBadgeColor(platform: string) {
  const key = platform.toLowerCase();
  for (const [k, v] of Object.entries(PLATFORM_COLORS)) {
    if (key.includes(k)) return v;
  }
  return '#17171c';
}

/* ============================================================= */

export default function LedgerPage() {
  const {
    summary,
    entries,
    platformPercentages,
    isLoading,
    error,
    refresh,
  } = useKrostData();

  const monthlyData = summary?.monthly_breakdown ?? [];
  const chartData = [...monthlyData]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      month: formatMonth(m.month),
      gross: m.gross_total,
      net: m.net_total ?? m.gross_total,
      count: m.payment_count,
    }));

  const recentEntries = (entries ?? []).slice(0, 50);

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/ledger/export');
      if (!res.ok) {
        alert('CSV export is not ready yet. The /api/ledger/export endpoint will be available in a future update.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'krost-ledger-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export unavailable. Please try again later.');
    } finally {
      setExporting(false);
    }
  };

  /* ---------- loading ---------- */

  if (isLoading) {
    return (
      <div className="p-6 pt-24 lg:pt-10 max-w-6xl">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /* ---------- render ---------- */

  return (
    <div className="p-6 pt-24 lg:pt-10 max-w-6xl">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-action-blue" />
            Pillar 02
          </p>
          <h2 className="font-display text-4xl font-medium tracking-tight">Krost Ledger</h2>
          <p className="text-ink/60 mt-1">
            Your unified earnings history across all connected platforms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="flex items-center gap-2 text-sm text-ink/50 hover:text-ink transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </header>

      {error && (
        <div className="card-cohere p-4 mb-8 border-l-4 border-l-coral">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ---------- summary cards ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-cohere p-5">
          <div className="flex items-center gap-2 mb-2 text-ink/40">
            <DollarSign size={16} />
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
              Avg Monthly
            </span>
          </div>
          <p className="font-display text-2xl font-medium tracking-tight">
            {summary ? formatCurrency(summary.avg_monthly_income) : '—'}
          </p>
        </div>

        <div className="card-cohere p-5">
          <div className="flex items-center gap-2 mb-2 text-ink/40">
            <Wallet size={16} />
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
              Total Earnings
            </span>
          </div>
          <p className="font-display text-2xl font-medium tracking-tight">
            {summary ? formatCurrency(summary.total_career_earnings) : '—'}
          </p>
        </div>

        <div className="card-cohere p-5">
          <div className="flex items-center gap-2 mb-2 text-ink/40">
            <Layers size={16} />
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
              Platforms
            </span>
          </div>
          <p className="font-display text-2xl font-medium tracking-tight">
            {summary ? summary.total_platforms : '—'}
          </p>
        </div>

        <div className="card-cohere p-5">
          <div className="flex items-center gap-2 mb-2 text-ink/40">
            <TrendingUp size={16} />
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
              Transactions
            </span>
          </div>
          <p className="font-display text-2xl font-medium tracking-tight">
            {summary ? summary.total_entries : '—'}
          </p>
        </div>
      </div>

      {/* ---------- chart + platform breakdown ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly income chart */}
        <div className="lg:col-span-2 card-cohere p-6">
          <h3 className="font-display text-lg font-medium tracking-tight mb-4">
            Monthly Income
          </h3>
          {chartData.length >= 2 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9d9dd" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    stroke="#17171c40"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#17171c40"
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), undefined]}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="gross"
                    fill="#17171c"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-ink/40">
              <p>Connect a platform to see your monthly income breakdown.</p>
            </div>
          )}
        </div>

        {/* Platform breakdown */}
        <div className="card-cohere p-6">
          <h3 className="font-display text-lg font-medium tracking-tight mb-4">
            Platform Split
          </h3>
          {platformPercentages.length > 0 ? (
            <div className="space-y-4">
              {platformPercentages.map((p) => (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: platformBadgeColor(p.name) }}
                      />
                      <span className="font-medium capitalize">{p.name}</span>
                    </div>
                    <span className="font-mono text-xs text-ink/50">
                      {formatCurrency(p.earnings)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-ink/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.value}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: platformBadgeColor(p.name) }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-ink/40 w-8 text-right">
                      {p.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-ink/40">
              <p>No platforms connected yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ---------- recent entries timeline ---------- */}
      <div className="card-cohere p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-medium tracking-tight">
            Recent Transactions
          </h3>
          <span className="text-xs text-ink/40 font-mono">
            {recentEntries.length} entry{recentEntries.length !== 1 ? 's' : ''}
          </span>
        </div>

        {recentEntries.length > 0 ? (
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-mono font-medium uppercase tracking-wider text-ink/30">
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Platform</div>
              <div className="col-span-3">Period</div>
              <div className="col-span-2 text-right">Gross</div>
              <div className="col-span-2 text-right">Net</div>
            </div>

            {/* Entries */}
            {recentEntries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.25 }}
                className="grid grid-cols-12 gap-3 px-4 py-3 rounded-cohere-sm hover:bg-ink/[0.02] transition-colors items-center"
              >
                <div className="col-span-2 text-sm text-ink/60">
                  {formatDate(entry.period_start)}
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: platformBadgeColor(entry.platform) }}
                  />
                  <span className="text-sm font-medium capitalize">
                    {entry.platform}
                  </span>
                </div>
                <div className="col-span-3 text-sm text-ink/50">
                  {formatDate(entry.period_start)} – {formatDate(entry.period_end)}
                </div>
                <div className="col-span-2 text-sm font-mono text-right font-medium">
                  {formatCurrency(entry.gross_amount)}
                </div>
                <div className="col-span-2 text-sm font-mono text-right text-ink/60">
                  {entry.net_amount != null
                    ? formatCurrency(entry.net_amount)
                    : '—'}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-ink/40 gap-3">
            <Layers size={32} strokeWidth={1.5} />
            <p>No transactions recorded yet. Connect a platform to start populating your ledger.</p>
          </div>
        )}
      </div>

      {/* ---------- monthly summary table ---------- */}
      {monthlyData.length >= 2 && (
        <div className="card-cohere p-6 mt-6">
          <h3 className="font-display text-lg font-medium tracking-tight mb-5">
            Monthly Rollup
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-[11px] font-mono font-medium uppercase tracking-wider text-ink/30">
                  <th className="text-left py-2 pr-4">Month</th>
                  <th className="text-right py-2 px-4">Gross</th>
                  <th className="text-right py-2 px-4">Net</th>
                  <th className="text-right py-2 pl-4">Payments</th>
                </tr>
              </thead>
              <tbody>
                {[...monthlyData]
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map((m) => (
                    <tr
                      key={m.month}
                      className="border-b border-hairline/40 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium">
                        {formatMonth(m.month)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatCurrency(m.gross_total)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-ink/60">
                        {m.net_total != null ? formatCurrency(m.net_total) : '—'}
                      </td>
                      <td className="py-3 pl-4 text-right font-mono text-ink/50">
                        {m.payment_count}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
