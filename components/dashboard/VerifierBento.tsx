'use client';

import { motion } from 'motion/react';
import { FileText, Download, CheckCircle2, Plus } from 'lucide-react';
import { useKrostData } from '@/hooks/use-krost-data';

export default function VerifierBento() {
  const { reports, score, isLoading } = useKrostData();

  const latestReport = reports.length > 0 ? reports[0] : null;
  const reportCount = reports.length;
  const canGenerate = score !== null && score >= 300;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-cohere flex flex-col justify-between"
    >
      <div>
        <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ink/20" />
          Pillar 03 • Verifier
        </p>
        <h2 className="font-display text-2xl font-medium tracking-tight">Lender Reports</h2>
      </div>

      <div className="my-6 space-y-3">
        {isLoading ? (
          <div className="p-3 rounded-cohere-sm bg-soft-stone border border-hairline animate-pulse h-[52px]" />
        ) : latestReport ? (
          <div className="flex items-center gap-3 p-3 rounded-cohere-sm bg-soft-stone border border-hairline">
            <div className="w-9 h-9 rounded-cohere-sm bg-brand-black/5 flex items-center justify-center text-ink">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-medium leading-none truncate">
                {latestReport.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </h4>
              <span className="text-[10px] text-ink/40 font-mono uppercase tracking-wider mt-1 block">
                {latestReport.tier ? `${latestReport.tier} • ` : ''}
                {new Date(latestReport.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <CheckCircle2 size={14} className="text-[#008000] shrink-0" />
          </div>
        ) : (
          <div className="p-3 rounded-cohere-sm bg-soft-stone border border-hairline text-center">
            <p className="text-[12px] text-ink/40">
              {canGenerate ? 'No reports yet. Generate your first one.' : 'Connect a platform to generate reports.'}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <a
            href={latestReport?.shareUrl || '#'}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-cohere-pill border border-hairline text-[12px] font-medium transition-all ${
              latestReport ? 'hover:bg-black/5' : 'opacity-40 pointer-events-none'
            }`}
          >
            <Download size={14} />
            {latestReport ? 'Fetch' : 'Fetch'}
          </a>
          <button
            onClick={() => window.location.href = '/dashboard/reports'}
            className="flex items-center justify-center gap-2 py-2.5 rounded-cohere-pill bg-brand-black text-white text-[12px] font-medium hover:opacity-90 transition-all"
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-hairline">
        <div className="flex justify-between items-center">
          <div className="flex -space-x-1.5">
            {reports.slice(0, 3).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-soft-stone border-2 border-white flex items-center justify-center text-[10px] font-medium text-ink/40">
                {i + 1}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink/30">{isLoading ? '...' : `${reportCount} Report${reportCount !== 1 ? 's' : ''}`}</span>
        </div>
      </div>
    </motion.div>
  );
}
