'use client';

import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';

export default function MilestoneBento() {
  const { milestone, isLoading } = useKrostData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card-cohere bg-brand-black text-white flex flex-col justify-between overflow-hidden relative min-h-[200px] group transition-transform hover:scale-[1.01] duration-500"
    >
      <div className="z-10">
        <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] opacity-40 mb-2">Upcoming Milestone</p>
        <h3 className="font-display text-2xl font-medium tracking-tight">
          {isLoading ? '...' : milestone.title}
        </h3>
        <p className="mt-2 text-[13px] opacity-60 leading-relaxed max-w-[200px]">
          {isLoading ? 'Loading...' : milestone.description}
        </p>
      </div>
      <div className="mt-6 z-10">
        <div className="flex justify-between items-end mb-2.5">
          <span className="font-display text-4xl font-medium tracking-tighter tabular-nums">
            {isLoading ? '--' : `${milestone.progress}%`}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Progress</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000 ease-out"
            style={{ width: isLoading ? '0%' : `${milestone.progress}%` }}
          />
        </div>
      </div>
      {/* Design Spec Orbits */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/[0.05] group-hover:scale-110 transition-transform duration-700" />
    </motion.div>
  );
}
