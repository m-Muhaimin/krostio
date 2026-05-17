'use client';

import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';
import { TrendingUp, TrendingDown, Lightbulb, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const FACTOR_LABELS: Record<string, { label: string; desc: string; max: number }> = {
  income_score: { label: 'Income Level', desc: 'Monthly earnings volume', max: 80 },
  tenure_score: { label: 'Gig Tenure', desc: 'Months in gig economy', max: 70 },
  volatility_score: { label: 'Earning Stability', desc: 'Month-over-month consistency', max: 60 },
  diversity_score: { label: 'Platform Diversity', desc: 'Number of platforms used', max: 50 },
  consistency_score: { label: 'Earning Consistency', desc: 'Regular work patterns', max: 50 },
  trajectory_score: { label: 'Income Trajectory', desc: 'Growth trend over time', max: 40 },
  tax_compliance: { label: 'Tax Compliance', desc: '1099-K filing status', max: 25 },
  cross_platform_growth: { label: 'Cross-Platform Growth', desc: 'Platform expansion over time', max: 20 },
  ledger_depth: { label: 'Ledger Depth', desc: 'Months of verified history', max: 15 },
};

// Color per factor max bucket
const factorBarColor = (pct: number) =>
  pct >= 70 ? '#17171c' : pct >= 40 ? '#1863dc' : '#ff7759';

export default function ScorePage() {
  const {
    score,
    tier,
    factors,
    scoreHistory,
    scoreChange,
    milestone,
    isLoading,
    error,
    refresh,
  } = useKrostData();

  const displayScore = score ?? 300;
  const displayTier = tier ?? 'Emerging';

  // Factor bars sorted by max weight descending
  const factorEntries = factors
    ? Object.entries(FACTOR_LABELS)
        .map(([key, meta]) => ({
          key,
          label: meta.label,
          desc: meta.desc,
          value: (factors as Record<string, number>)[key] ?? 0,
          max: meta.max,
          pct: Math.round((((factors as Record<string, number>)[key] ?? 0) / meta.max) * 100),
        }))
        .sort((a, b) => b.max - a.max)
    : [];

  // History chart data – chronological order
  const historyData = (scoreHistory || [])
    .filter(h => h.score != null)
    .reverse()
    .map(h => ({
      date: new Date(h.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      score: h.score,
    }));

  // Tier description
  const tierMeta = (): { label: string; description: string } => {
    const s = displayScore;
    if (s >= 750) return { label: 'Elite', description: 'Exceptional financial health. You qualify for premium lending rates.' };
    if (s >= 680) return { label: 'Strong', description: 'Strong profile. Most lenders will view your application favorably.' };
    if (s >= 580) return { label: 'Building', description: 'Building momentum. Consistent earnings will push your score higher.' };
    return { label: 'Emerging', description: 'Starting your journey. Connect platforms to establish your financial identity.' };
  };

  // Generate actionable tips based on factor gaps
  const generateTips = (): string[] => {
    const tips: string[] = [];
    if (!factors) return ['Connect a gig platform to start building your Krost Score.'];
    const f = factors as Record<string, number>;
    if ((f.diversity_score ?? 0) < 30) tips.push('Connect a second platform — diversifying can add ~35 points to your score.');
    if ((f.consistency_score ?? 0) < 40) tips.push('Work consistently each month to improve your Earning Consistency score.');
    if ((f.tenure_score ?? 0) < 35) tips.push('Longer gig history builds trust. Keep at it — your tenure score grows with time.');
    if ((f.volatility_score ?? 0) < 30) tips.push('Stable monthly earnings boost your score. Try to maintain regular working hours.');
    if ((f.income_score ?? 0) < 40) tips.push('Increasing your monthly income directly impacts your score. Consider adding another platform.');
    if (tips.length === 0) tips.push('Great work! Your score factors are well-balanced. Keep maintaining your current patterns.');
    return tips;
  };

  const tips = generateTips();
  const tierInfo = tierMeta();

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
          <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            Pillar 01
          </p>
          <h2 className="font-display text-4xl font-medium tracking-tight">Krost Score</h2>
          <p className="text-ink/60 mt-1">Your 9-factor creditworthiness breakdown.</p>
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

      {/* Score Hero */}
      <div className="card-cohere p-8 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-ink to-ink/60 flex items-center justify-center">
                <span className="font-display text-6xl font-normal tracking-tighter text-white">
                  {displayScore}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 bg-coral text-white text-[11px] font-mono font-medium uppercase tracking-widest px-3 py-1 rounded-cohere-pill">
                {displayTier}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl font-medium tracking-tight mb-2">
              {tierInfo.label} Tier
            </h3>
            <p className="text-ink/60 max-w-lg">{tierInfo.description}</p>
            {!score && (
              <Link href="/dashboard" className="btn-primary inline-block mt-4 text-sm">
                Connect a Platform
              </Link>
            )}

            {/* Score change indicator */}
            {scoreChange !== null && (
              <div
                className={`flex items-center gap-2 mt-4 text-sm font-medium ${
                  scoreChange >= 0 ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {scoreChange >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                {scoreChange >= 0 ? '+' : ''}
                {scoreChange} points over {scoreHistory.length} snapshot
                {scoreHistory.length !== 1 ? 's' : ''}
              </div>
            )}

            {/* Milestone progress */}
            {milestone && (
              <div className="mt-6 space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-ink/80">{milestone.title}</span>
                  <span className="text-ink/40 font-mono text-xs">{milestone.progress}%</span>
                </div>
                <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${milestone.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-ink"
                  />
                </div>
                <p className="text-xs text-ink/40">{milestone.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Score History Chart */}
        <div className="lg:col-span-2 card-cohere p-6">
          <h3 className="font-display text-lg font-medium tracking-tight mb-4">Score History</h3>
          {historyData.length >= 2 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#17171c" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#17171c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9d9dd" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#17171c40" />
                  <YAxis domain={[300, 850]} tick={{ fontSize: 12 }} stroke="#17171c40" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#17171c"
                    fill="url(#scoreGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-ink/40">
              <p>Not enough data yet. Keep using the platform to build your history.</p>
            </div>
          )}
        </div>

        {/* Improvement Tips */}
        <div className="card-cohere p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-coral" />
            <h3 className="font-display text-lg font-medium tracking-tight">Improvement Tips</h3>
          </div>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink/70">
                <span className="w-5 h-5 rounded-full bg-ink/5 flex items-center justify-center flex-shrink-0 text-[11px] font-medium">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="card-cohere p-6">
        <h3 className="font-display text-lg font-medium tracking-tight mb-6">Factor Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {factorEntries.length > 0 ? (
            factorEntries.map((factor) => (
              <div key={factor.key} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <div>
                    <p className="font-medium text-sm">{factor.label}</p>
                    <p className="text-[11px] text-ink/40">{factor.desc}</p>
                  </div>
                  <span className="font-mono text-sm font-medium">
                    {factor.value}/{factor.max}
                  </span>
                </div>
                <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: factorBarColor(factor.pct) }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-ink/40 text-sm col-span-full">
              No factor data available yet. Connect a platform to see your breakdown.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
