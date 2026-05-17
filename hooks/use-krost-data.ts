'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  LedgerEntry,
  LedgerSummary,
  PassportData,
  ReportItem,
  ScoreHistoryPoint,
} from '@/lib/types';

export function useKrostData() {
  const [score, setScore] = useState<number | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [factors, setFactors] = useState<Record<string, number> | null>(null);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);

      const fetches = [
        fetch('/api/score/current').then(r => r.ok ? r.json() : null),
        fetch('/api/ledger/summary').then(r => r.ok ? r.json() : null),
        fetch('/api/ledger/entries?limit=20').then(r => r.ok ? r.json() : null),
        fetch('/api/passport/current').then(r => r.ok ? r.json() : null),
        fetch('/api/reports/list').then(r => r.ok ? r.json() : null),
        fetch('/api/score/history?limit=5').then(r => r.ok ? r.json() : null),
      ];

      const [
        scoreData,
        summaryData,
        entriesData,
        passportData,
        reportsData,
        historyData,
      ] = await Promise.all(fetches);

      if (scoreData) {
        setScore(scoreData.score);
        setTier(scoreData.tier);
        setFactors(scoreData.factors);
      }

      if (summaryData) {
        setSummary(summaryData);
      }

      if (entriesData?.entries) {
        setEntries(entriesData.entries);
      }

      if (passportData?.passport) {
        setPassport(passportData.passport);
      } else {
        setPassport(null);
      }

      if (reportsData?.reports) {
        setReports(reportsData.reports);
      }

      if (historyData?.history) {
        setScoreHistory(historyData.history);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Compute derived values

  // Score change: latest minus earliest from history
  const scoreChange = scoreHistory.length >= 2
    ? (scoreHistory[scoreHistory.length - 1].score ?? 0) - (scoreHistory[0].score ?? 0)
    : null;

  // Monthly income by platform (from ledger entries)
  const platformBreakdown = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.platform] = (acc[e.platform] || 0) + Number(e.gross_amount || 0);
    return acc;
  }, {});

  // Total per platform as percentage
  const totalEarningsFromEntries = Object.values(platformBreakdown).reduce((a, b) => a + b, 0);
  const platformPercentages = Object.entries(platformBreakdown)
    .map(([name, value]) => ({
      name,
      value: totalEarningsFromEntries > 0 ? Math.round((value / totalEarningsFromEntries) * 100) : 0,
      earnings: value,
    }))
    .sort((a, b) => b.earnings - a.earnings);

  // Next milestone computation from score
  const computeMilestone = (currentScore: number | null, currentTier: string | null) => {
    if (!currentScore) {
      return {
        title: 'Connect a Platform',
        description: 'Link your first gig account to get your Krost Score.',
        progress: 0,
        target: 300,
      };
    }

    const thresholds = [
      { min: 300, max: 579, tier: 'Emerging', target: 580, nextTier: 'Building', label: 'Building Tier' },
      { min: 580, max: 679, tier: 'Building', target: 680, nextTier: 'Strong', label: 'Strong Tier' },
      { min: 680, max: 749, tier: 'Strong', target: 750, nextTier: 'Elite', label: 'Elite Tier' },
      { min: 750, max: 850, tier: 'Elite', target: 850, nextTier: null, label: 'Max Score' },
    ];

    const current = thresholds.find(t => currentScore >= t.min && currentScore <= t.max);
    if (!current) {
      return { title: 'Emerging Tier', description: 'Start building your score to unlock benefits.', progress: 0, target: 580 };
    }

    if (current.nextTier === null) {
      return {
        title: 'You\'re Elite!',
        description: 'You\'ve reached the highest tier. Maintain your score to keep premium benefits.',
        progress: 100,
        target: 850,
      };
    }

    const range = current.target - current.min;
    const progress = Math.min(99, Math.round(((currentScore - current.min) / range) * 100));

    return {
      title: `Reach ${current.nextTier} Tier`,
      description: `Grow your score to ${current.target}+ to unlock ${current.nextTier.toLowerCase()}-tier benefits and higher lending limits.`,
      progress,
      target: current.target,
    };
  };

  // Offers based on score tier
  const computeOffers = (currentTier: string | null) => {
    const offersByTier: Record<string, { count: number; items: Array<{ name: string; rate: string }> }> = {
      Elite: { count: 8, items: [{ name: 'First Lend', rate: '6.9% APR' }, { name: 'Spring Finance', rate: '7.5% APR' }] },
      Strong: { count: 5, items: [{ name: 'First Lend', rate: '8.9% APR' }, { name: 'Quick Capital', rate: '9.5% APR' }] },
      Building: { count: 3, items: [{ name: 'FairPath', rate: '11.9% APR' }] },
      Emerging: { count: 1, items: [{ name: 'Krost Starter', rate: '14.9% APR' }] },
    };
    const tier = currentTier || 'Emerging';
    return offersByTier[tier] || offersByTier.Emerging;
  };

  const milestone = computeMilestone(score, tier);
  const offers = computeOffers(tier);

  return {
    // Raw data
    score,
    tier,
    factors,
    summary,
    entries,
    passport,
    reports,
    scoreHistory,
    isLoading,
    error,
    // Derived
    scoreChange,
    platformPercentages,
    milestone,
    offers,
    // Refresh
    refresh: fetchAll,
  };
}
