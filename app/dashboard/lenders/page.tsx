'use client';

import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';
import { Building2, Sparkles, Scale, RefreshCw, ArrowRight } from 'lucide-react';

const LOAN_TYPES: Record<string, { label: string; description: string; icon: string }[]> = {
  Elite: [
    { label: 'Mortgage — Premium', description: 'Rates from 5.9% APR for qualified borrowers', icon: '🏠' },
    { label: 'Auto Loan — Prime', description: 'Rates from 4.9% APR on new and used vehicles', icon: '🚗' },
    { label: 'Personal Loan — Signature', description: 'Up to $100K unsecured, rates from 7.9% APR', icon: '💰' },
    { label: 'Business Loan — Growth', description: 'Up to $250K for gig economy entrepreneurs', icon: '📈' },
  ],
  Strong: [
    { label: 'Mortgage — Standard', description: 'Rates from 6.9% APR', icon: '🏠' },
    { label: 'Auto Loan — Standard', description: 'Rates from 6.9% APR', icon: '🚗' },
    { label: 'Personal Loan — Plus', description: 'Up to $50K unsecured, rates from 9.9% APR', icon: '💰' },
    { label: 'Equipment Financing', description: 'Finance work equipment at competitive rates', icon: '🔧' },
  ],
  Building: [
    { label: 'Auto Loan — Starter', description: 'Rates from 9.9% APR', icon: '🚗' },
    { label: 'Personal Loan — Starter', description: 'Up to $15K, rates from 11.9% APR', icon: '💰' },
    { label: 'Credit Builder', description: 'Small loan to build your credit history', icon: '📊' },
  ],
  Emerging: [
    { label: 'Credit Builder Loan', description: 'Start building credit from $500', icon: '📊' },
    { label: 'Small Personal Loan', description: 'Up to $3K, rates from 14.9% APR', icon: '💰' },
  ],
};

const TIER_ELIGIBILITY = [
  { tier: 'Elite', range: '750–850', color: 'text-emerald-600 bg-emerald-50' },
  { tier: 'Strong', range: '680–749', color: 'text-blue-600 bg-blue-50' },
  { tier: 'Building', range: '580–679', color: 'text-amber-600 bg-amber-50' },
  { tier: 'Emerging', range: '300–579', color: 'text-slate-600 bg-slate-100' },
];

export default function LendersPage() {
  const { score, tier, isLoading, error, refresh } = useKrostData();
  const displayTier = (tier || 'Emerging') as keyof typeof LOAN_TYPES;
  const availableLoans = LOAN_TYPES[displayTier] || LOAN_TYPES.Emerging;

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
          <h2 className="font-display text-4xl font-medium tracking-tight">Lender Marketplace</h2>
          <p className="text-ink/60 mt-1">Connect with mortgage, auto, and personal loan providers who understand gig economy income.</p>
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

      {/* Coming Soon Banner */}
      <div className="card-cohere p-6 mb-8 border-l-4 border-l-action-blue bg-action-blue/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-action-blue/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-action-blue" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium tracking-tight">Lender Portal — Coming Soon</h3>
            <p className="text-ink/60 text-sm mt-1 leading-relaxed">
              We&apos;re building a curated marketplace of lenders who understand gig economy income.
              You&apos;ll be able to apply for loans, compare rates, and share your Krost Verifier
              reports — all in one place. In the meantime, here&apos;s a preview of what&apos;s
              available based on your current score tier.
            </p>
          </div>
        </div>
      </div>

      {/* Score Tier Eligibility */}
      <div className="card-cohere p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Scale size={18} className="text-ink/40" />
          <h3 className="font-display text-lg font-medium tracking-tight">Tier Eligibility</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TIER_ELIGIBILITY.map((t) => {
            const isActive = t.tier === displayTier;
            return (
              <div
                key={t.tier}
                className={`p-4 rounded-cohere-sm border text-center transition-all ${
                  isActive
                    ? 'border-ink bg-ink/5 ring-1 ring-ink/10'
                    : 'border-hairline bg-soft-stone opacity-60'
                }`}
              >
                <p className={`text-xs font-mono font-medium uppercase tracking-wider ${t.color.split(' ')[0]} ${t.color.split(' ')[1]} inline-block px-2 py-0.5 rounded-cohere-pill mb-2`}>
                  {t.tier}
                </p>
                <p className="text-sm font-medium">{t.range}</p>
                {isActive && (
                  <p className="text-[10px] text-ink/40 mt-1 font-mono uppercase tracking-widest">
                    Your Tier
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Loans */}
      <div className="card-cohere p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 size={18} className="text-ink/40" />
          <h3 className="font-display text-lg font-medium tracking-tight">
            Available for {displayTier} Tier
          </h3>
        </div>

        {!score ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center mb-4">
              <Building2 size={24} className="text-ink/30" />
            </div>
            <p className="text-ink/60 text-sm">Connect a platform to see available loan options.</p>
            <p className="text-ink/40 text-xs mt-1">
              Your score tier determines what lending products you can access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableLoans.map((loan, idx) => (
              <motion.div
                key={loan.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-4 p-4 rounded-cohere-sm bg-soft-stone border border-hairline group hover:border-ink/20 transition-all cursor-default"
              >
                <span className="text-2xl flex-shrink-0">{loan.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">{loan.label}</h4>
                  <p className="text-xs text-ink/50 mt-1 leading-relaxed">{loan.description}</p>
                </div>
                <ArrowRight size={16} className="text-ink/20 mt-1 flex-shrink-0 group-hover:text-ink/50 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom info */}
        <div className="mt-8 pt-6 border-t border-hairline">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Ready to apply?</p>
              <p className="text-xs text-ink/40 mt-0.5">
                Generate a Krost Verifier report to share with lenders when the marketplace launches.
              </p>
            </div>
            <a
              href="/dashboard/reports"
              className="flex items-center gap-2 px-5 py-2.5 rounded-cohere-pill bg-brand-black text-white text-xs font-medium hover:opacity-90 transition-all whitespace-nowrap"
            >
              <Sparkles size={14} />
              Generate Report
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
