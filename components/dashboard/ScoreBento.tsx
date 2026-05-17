'use client';

import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';
import { TrendingUp } from 'lucide-react';

const FACTOR_LABELS: Record<string, string> = {
  income_score: 'Income Level',
  tenure_score: 'Gig Tenure',
  volatility_score: 'Earning Stability',
  diversity_score: 'Platform Diversity',
  consistency_score: 'Earning Consistency',
  trajectory_score: 'Income Trajectory',
  tax_compliance: 'Tax Compliance',
  cross_platform_growth: 'Cross-Platform Growth',
  ledger_depth: 'Ledger Depth',
};

export default function ScoreBento() {
  const { score, tier, factors, scoreChange, isLoading, scoreHistory } = useKrostData();

  const displayScore = score ?? 300;
  const displayTier = tier ?? 'Emerging';

  // Build factor bars from real data (top 3 by weight)
  const factorEntries = factors
    ? Object.entries(factors)
        .filter(([, v]) => typeof v === 'number')
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([key, value]) => ({
          label: FACTOR_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          value,
          max: key === 'income_score' ? 80
            : key === 'tenure_score' ? 70
            : key === 'volatility_score' ? 60
            : key === 'diversity_score' ? 50
            : key === 'consistency_score' ? 50
            : key === 'trajectory_score' ? 40
            : key === 'tax_compliance' ? 25
            : key === 'cross_platform_growth' ? 20
            : 15,
        }))
    : [];

  // Show a meaningful sign for score change
  const hasHistory = scoreHistory.length >= 2;
  const previousScore = hasHistory ? (scoreHistory[0]?.score ?? 0) : 0;
  const currentScore = score ?? 0;
  const pointDiff = hasHistory ? currentScore - previousScore : 0;
  const diffDisplay = pointDiff >= 0 ? `+${pointDiff} pts` : `${pointDiff} pts`;
  const diffColor = pointDiff >= 0 ? '#008000' : '#c73a3a';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-cohere md:col-span-2 md:row-span-2 lg:col-span-12 flex flex-col justify-between overflow-hidden relative group"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            Pillar 01 • Financial Identity
          </p>
          <h2 className="font-display text-4xl font-medium tracking-tight leading-[1.1]">Krost Score</h2>
        </div>
        <div className="bg-brand-black text-white px-4 py-1.5 rounded-cohere-pill text-[12px] font-medium uppercase tracking-widest">
          {isLoading ? '...' : displayTier}
        </div>
      </div>

      <div className="mt-8 flex items-baseline gap-6">
        <span className="font-display text-[120px] font-normal tracking-tighter leading-[0.8] tabular-nums">
          {isLoading ? '---' : displayScore}
        </span>
        <div className="flex flex-col gap-1.5">
          {hasHistory && (
            <div className="flex items-center gap-1 font-medium text-[14px]" style={{ color: diffColor }}>
              <TrendingUp size={16} />
              {isLoading ? '--' : diffDisplay}
            </div>
          )}
          <span className="text-ink/40 text-[12px] font-medium uppercase tracking-wider">
            {hasHistory ? 'since first record' : 'vs last month'}
          </span>
        </div>
      </div>

      {score === null && !isLoading && (
        <div className="mt-6 p-4 bg-soft-stone/50 rounded-cohere-lg">
          <p className="text-sm text-ink/60">
            Connect a gig platform to start building your Krost Score.
          </p>
        </div>
      )}

      {factorEntries.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-hairline pt-8">
          {factorEntries.map((f) => (
            <div key={f.label} className="flex flex-col gap-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink/40">{f.label}</span>
              <div className="h-1 w-full bg-soft-stone rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isLoading ? '0%' : `${Math.round((f.value / f.max) * 100)}%` }}
                  className="h-full bg-ink"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decorative Orbits */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-ink/[0.03] pointer-events-none" />
      <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border border-ink/[0.05] pointer-events-none" />
    </motion.div>
  );
}
