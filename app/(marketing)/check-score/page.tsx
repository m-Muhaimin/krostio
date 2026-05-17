'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

type StepKey = 'platforms' | 'income' | 'tenure' | 'primary' | 'results';

interface Answers {
  platforms: string[];
  income: string | null;
  tenure: string | null;
  primary: string | null;
}

/* ── Estimation engine ── */
const INCOME_MAP: Record<string, number> = {
  '<$1K': 0,
  '$1K-$3K': 3,
  '$3K-$6K': 6,
  '$6K-$10K': 10,
  '$10K+': 14,
};

const TENURE_MAP: Record<string, number> = {
  '<6mo': 0,
  '6-12mo': 3,
  '1-3yr': 6,
  '3-5yr': 10,
  '5yr+': 14,
};

function calculateEstimate(a: Answers): { score: number; range: string } {
  const base = 500;

  // platform diversity
  const platBonus = Math.min(a.platforms.length * 8, 40);

  // income
  const inc = a.income ? INCOME_MAP[a.income] || 0 : 0;
  const incBonus = inc * 5;

  // tenure
  const ten = a.tenure ? TENURE_MAP[a.tenure] || 0 : 0;
  const tenBonus = ten * 5;

  // deterministic variance based on answers so it's stable across reloads
  const hash = a.platforms.join('').length * 3 + inc * 2 + ten;
  const variance = (hash % 37) - 18; // -18 .. +18

  const raw = base + platBonus + incBonus + tenBonus + variance;
  const score = Math.min(850, Math.max(300, Math.round(raw)));

  const lower = Math.max(300, score - 28 - (hash % 12));
  const upper = Math.min(850, score + 18 + (hash % 8));
  const range = `${lower}–${upper}`;

  return { score, range };
}

/* ── Color band for the gauge ── */
function scoreColor(s: number): string {
  if (s < 580) return 'bg-red-500';
  if (s < 670) return 'bg-amber-500';
  if (s < 740) return 'bg-lime-500';
  return 'bg-emerald-500';
}

/* ── Score letter grade ── */
function scoreGrade(s: number): { letter: string; label: string } {
  if (s < 580) return { letter: 'D', label: 'Building' };
  if (s < 640) return { letter: 'C', label: 'Fair' };
  if (s < 700) return { letter: 'B', label: 'Good' };
  if (s < 760) return { letter: 'A', label: 'Very Good' };
  return { letter: 'A+', label: 'Excellent' };
}

const PLATFORMS = [
  'Uber',
  'Lyft',
  'DoorDash',
  'Instacart',
  'Upwork',
  'Fiverr',
  'Amazon Flex',
  'Other',
];

const INCOME_OPTIONS = [
  { value: '<$1K', label: 'Under $1,000' },
  { value: '$1K-$3K', label: '$1,000 – $3,000' },
  { value: '$3K-$6K', label: '$3,000 – $6,000' },
  { value: '$6K-$10K', label: '$6,000 – $10,000' },
  { value: '$10K+', label: '$10,000+' },
];

const TENURE_OPTIONS = [
  { value: '<6mo', label: 'Less than 6 months' },
  { value: '6-12mo', label: '6 – 12 months' },
  { value: '1-3yr', label: '1 – 3 years' },
  { value: '3-5yr', label: '3 – 5 years' },
  { value: '5yr+', label: '5+ years' },
];

const PRIMARY_OPTIONS = [
  'Uber',
  'Lyft',
  'DoorDash',
  'Instacart',
  'Upwork',
  'Fiverr',
  'Amazon Flex',
  'Other',
];

const STEPS: StepKey[] = ['platforms', 'income', 'tenure', 'primary', 'results'];

const STEP_LABELS: Record<StepKey, string> = {
  platforms: 'Your platforms',
  income: 'Monthly income',
  tenure: 'Gig experience',
  primary: 'Primary platform',
  results: 'Your score',
};

const STORAGE_KEY = 'krostio-check-score-answers';

const defaultAnswers: Answers = {
  platforms: [],
  income: null,
  tenure: null,
  primary: null,
};

export default function CheckScorePage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Answers;
        setAnswers(parsed);
        // Determine how far they got — find last step with a non-empty answer
        if (parsed.primary) setStepIndex(4);
        else if (parsed.tenure) setStepIndex(3);
        else if (parsed.income) setStepIndex(2);
        else if (parsed.platforms.length > 0) setStepIndex(1);
      }
    } catch {
      // ignore corrupt localStorage
    }
  }, []);

  // Persist to localStorage whenever answers change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers, mounted]);

  const currentStep = STEPS[stepIndex];

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setTransitioning(true);
      setTimeout(() => {
        setStepIndex((i) => i + 1);
        setTransitioning(false);
      }, 250);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setTransitioning(true);
      setTimeout(() => {
        setStepIndex((i) => i - 1);
        setTransitioning(false);
      }, 250);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'platforms':
        return answers.platforms.length > 0;
      case 'income':
        return answers.income !== null;
      case 'tenure':
        return answers.tenure !== null;
      case 'primary':
        return answers.primary !== null;
      case 'results':
        return true;
      default:
        return false;
    }
  };

  const togglePlatform = (platform: string) => {
    setAnswers((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const progressPercent = ((stepIndex + 1) / STEPS.length) * 100;

  if (!mounted) {
    // Prevent hydration mismatch — render nothing on server
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-cohere-full border-2 border-ink/20 border-t-coral animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg mx-auto">
        {/* ── Progress bar ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-mono-label text-ink/30 text-xs">
              STEP {stepIndex + 1} OF {STEPS.length}
            </p>
            <p className="text-mono-label text-ink/30 text-xs">
              {STEP_LABELS[currentStep]}
            </p>
          </div>
          <div className="w-full h-1.5 bg-hairline rounded-cohere-full overflow-hidden">
            <div
              className="h-full bg-coral rounded-cohere-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ── Card ── */}
        <div
          className={`card-cohere p-8 md:p-10 transition-all duration-250 ${
            transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Step 1: Platforms */}
          {currentStep === 'platforms' && (
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink mb-2">
                Which platforms do you earn on?
              </h2>
              <p className="text-caption text-ink/50 mb-6">
                Select all that apply.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((platform) => {
                  const selected = answers.platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-4 py-3 rounded-cohere-sm text-sm font-medium border text-left transition-all duration-200 ${
                        selected
                          ? 'bg-brand-black text-white border-brand-black'
                          : 'bg-white text-ink border-hairline hover:border-ink/30'
                      }`}
                    >
                      {selected && (
                        <span className="mr-2 text-coral">✓</span>
                      )}
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Income */}
          {currentStep === 'income' && (
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink mb-2">
                What&rsquo;s your monthly gig income?
              </h2>
              <p className="text-caption text-ink/50 mb-6">
                Average net earnings across all platforms.
              </p>
              <div className="flex flex-col gap-3">
                {INCOME_OPTIONS.map((opt) => {
                  const selected = answers.income === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, income: opt.value }));
                      }}
                      className={`px-5 py-4 rounded-cohere-sm text-sm font-medium border text-left transition-all duration-200 ${
                        selected
                          ? 'bg-brand-black text-white border-brand-black'
                          : 'bg-white text-ink border-hairline hover:border-ink/30'
                      }`}
                    >
                      {selected && (
                        <span className="mr-2 text-coral">✓</span>
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Tenure */}
          {currentStep === 'tenure' && (
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink mb-2">
                How long have you been gig working?
              </h2>
              <p className="text-caption text-ink/50 mb-6">
                Total time earning on gig platforms.
              </p>
              <div className="flex flex-col gap-3">
                {TENURE_OPTIONS.map((opt) => {
                  const selected = answers.tenure === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, tenure: opt.value }));
                      }}
                      className={`px-5 py-4 rounded-cohere-sm text-sm font-medium border text-left transition-all duration-200 ${
                        selected
                          ? 'bg-brand-black text-white border-brand-black'
                          : 'bg-white text-ink border-hairline hover:border-ink/30'
                      }`}
                    >
                      {selected && (
                        <span className="mr-2 text-coral">✓</span>
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Primary platform */}
          {currentStep === 'primary' && (
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink mb-2">
                What&rsquo;s your primary gig platform?
              </h2>
              <p className="text-caption text-ink/50 mb-6">
                The one where you earn the most.
              </p>
              <div className="flex flex-col gap-3">
                {PRIMARY_OPTIONS.map((platform) => {
                  const selected = answers.primary === platform;
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, primary: platform }));
                      }}
                      className={`px-5 py-4 rounded-cohere-sm text-sm font-medium border text-left transition-all duration-200 ${
                        selected
                          ? 'bg-brand-black text-white border-brand-black'
                          : 'bg-white text-ink border-hairline hover:border-ink/30'
                      }`}
                    >
                      {selected && (
                        <span className="mr-2 text-coral">✓</span>
                      )}
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Results — Score Estimate + CTA */}
          {currentStep === 'results' && <ResultsView answers={answers} />}

          {/* ── Navigation buttons ── */}
          <div
            className={`flex items-center gap-3 mt-8 ${
              currentStep === 'results' ? 'hidden' : ''
            }`}
          >
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="btn-pill-outline text-sm flex-1"
              >
                ← Back
              </button>
            ) : (
              <div className="flex-1" />
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className="btn-primary text-sm flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {stepIndex === STEPS.length - 2 ? 'See my results' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Results view: score gauge + summary + CTA ── */
function ResultsView({ answers }: { answers: Answers }) {
  const est = useMemo(() => calculateEstimate(answers), [answers]);
  const grade = scoreGrade(est.score);
  const color = scoreColor(est.score);

  // gauge position: (score - 300) / (850 - 300) * 100
  const gaugePct = ((est.score - 300) / 550) * 100;

  return (
    <div>
      {/* Score number */}
      <div className="text-center mb-6">
        <p className="text-mono-label text-ink/30 text-xs mb-4">YOUR ESTIMATED RANGE</p>
        <div className="relative inline-flex items-center justify-center w-36 h-36 mx-auto">
          {/* Gauge background arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E5E5" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={`${gaugePct * 2.64} 264`}
              strokeLinecap="round"
              className={color.replace('bg-', 'text-')}
            />
          </svg>
          <div className="text-center">
            <span className={`text-3xl font-display font-bold tracking-tight ${color.replace('bg-', 'text-')}`}>
              {est.range}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-cohere-full text-[11px] font-bold text-white ${color}`}>
            {grade.letter}
          </span>
          <span className="text-sm text-ink/60">{grade.label}</span>
        </div>
      </div>

      {/* Score context */}
      <div className="text-center mb-6">
        <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-1">
          Your income power, scored
        </h2>
        <p className="text-caption text-ink/50 text-sm">
          This estimate is based on what you told us. Connect your platforms for your
          real Krost Score — it could be higher.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-soft-stone rounded-cohere-sm p-5 mb-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-ink/50">Platforms</span>
          <span className="font-medium text-ink">{answers.platforms.join(', ')}</span>
        </div>
        <div className="rule-hairline" />
        <div className="flex justify-between">
          <span className="text-ink/50">Monthly income</span>
          <span className="font-medium text-ink">{answers.income}</span>
        </div>
        <div className="rule-hairline" />
        <div className="flex justify-between">
          <span className="text-ink/50">Gig experience</span>
          <span className="font-medium text-ink">{answers.tenure}</span>
        </div>
        <div className="rule-hairline" />
        <div className="flex justify-between">
          <span className="text-ink/50">Primary platform</span>
          <span className="font-medium text-ink">{answers.primary}</span>
        </div>
      </div>

      {/* Score range mini-legend */}
      <div className="flex items-center justify-between gap-1 mb-6">
        {[
          { label: '300', color: 'bg-red-500' },
          { label: '580', color: 'bg-amber-500' },
          { label: '670', color: 'bg-lime-500' },
          { label: '740', color: 'bg-emerald-500' },
          { label: '850', color: 'bg-emerald-600' },
        ].map((t) => (
          <span key={t.label} className="text-[10px] text-ink/30 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-cohere-full ${t.color}`} />
            {t.label}
          </span>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/register?ref=check-score"
        className="btn-primary w-full justify-center text-[15px] !py-4"
      >
        Connect platforms & unlock my full score
      </Link>
      <p className="text-micro text-ink/40 text-center mt-3">
        No credit check. No commitment. Free to start.
      </p>
    </div>
  );
}
