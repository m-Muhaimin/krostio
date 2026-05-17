'use client';

import { motion } from 'motion/react';
import { ExternalLink, Globe, Sparkles } from 'lucide-react';
import { useKrostData } from '@/hooks/use-krost-data';

export default function PassportBento() {
  const { passport, isLoading } = useKrostData();

  const hasPassport = passport?.id && passport?.status === 'verified';
  const statusLabel = hasPassport ? 'Verified' : 'Not Minted';
  const statusColor = hasPassport ? '#008000' : '#a0a0a0';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-cohere flex flex-col justify-between group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={20} className="text-ink/20" />
      </div>

      <div>
        <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-action-blue" />
          Pillar 02 • Passport
        </p>
        <h2 className="font-display text-2xl font-medium tracking-tight">On-Chain Identity</h2>
      </div>

      <div className="my-6 flex justify-center">
        <div className="relative w-32 h-32">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-hairline" 
          />
          <div className="absolute inset-3 rounded-full bg-soft-stone flex items-center justify-center border border-hairline">
            <div className="text-center">
              {hasPassport ? (
                <>
                  <Sparkles size={24} className="mx-auto text-action-blue" />
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-ink/40 mt-1">Issued</span>
                </>
              ) : (
                <>
                  <span className="block text-xl font-display font-medium text-ink">SBT</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">Soulbound</span>
                </>
              )}
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-hairline">
            <Globe size={14} className="text-action-blue" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-[11px] font-mono uppercase tracking-widest">
          <span className="text-ink/40">Identity Status</span>
          <span className="font-medium flex items-center gap-2" style={{ color: statusColor }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
            {isLoading ? '...' : statusLabel}
          </span>
        </div>
        {hasPassport && passport?.chain && (
          <div className="flex justify-between items-center text-[11px] font-mono uppercase tracking-widest">
            <span className="text-ink/40">Network</span>
            <span className="text-ink font-medium">{passport.chain}</span>
          </div>
        )}
        <button className="w-full py-2.5 rounded-cohere-pill bg-brand-black text-white text-[12px] font-medium hover:opacity-90">
          {hasPassport ? 'View Passport' : 'Mint Passport'}
        </button>
      </div>
    </motion.div>
  );
}
