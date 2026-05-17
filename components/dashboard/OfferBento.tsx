'use client';

import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';

export default function OfferBento() {
  const { tier, offers, isLoading } = useKrostData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="card-cohere flex flex-col justify-between min-h-[200px] bg-white"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-2">Lender Network</p>
          <h3 className="font-display text-2xl font-medium tracking-tight">Active Offers</h3>
          <p className="mt-1 text-[13px] text-ink/40">
            {isLoading ? 'Loading...' : `Matched at ${tier || 'Emerging'} tier.`}
          </p>
        </div>
        <a
          href="/dashboard/lenders"
          className="text-[10px] font-mono font-medium uppercase tracking-widest bg-brand-black text-white px-4 py-2 rounded-cohere-pill hover:opacity-90 transition-opacity"
        >
          View All
        </a>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="flex -space-x-2">
          {isLoading ? (
            <>
              <div className="w-10 h-10 rounded-full bg-soft-stone border-2 border-white animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-soft-stone border-2 border-white animate-pulse" />
            </>
          ) : (
            offers.items.slice(0, 4).map((offer, i) => (
              <div
                key={offer.name}
                className="w-10 h-10 rounded-full bg-soft-stone border-2 border-white flex items-center justify-center overflow-hidden relative shadow-sm"
              >
                <span className="text-[8px] font-mono font-bold text-ink/60">
                  {offer.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
                </span>
              </div>
            ))
          )}
        </div>
        <div>
          <p className="text-[13px] font-medium text-ink">
            {isLoading ? '...' : `${offers.count} Lenders`}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#008000]">
            {isLoading ? '...' : 'Pre-Approved'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
