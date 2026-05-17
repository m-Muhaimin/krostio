'use client';

import { motion } from 'motion/react';
import { Command, Search, Settings } from 'lucide-react';
import Image from 'next/image';

interface DashboardHeaderProps {
  onProfileClick: () => void;
}

export default function DashboardHeader({ onProfileClick }: DashboardHeaderProps) {
  return (
    <header className="w-full pt-12 pb-8 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-4">
        <div 
          className="relative w-16 h-16 group cursor-pointer"
          onClick={onProfileClick}
        >
          <div className="absolute inset-0 rounded-full border-2 border-ink group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-1 rounded-full overflow-hidden">
            <Image 
              src="https://picsum.photos/seed/krostio/200/200" 
              alt="Profile" 
              width={64} 
              height={64} 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Satellite Satellite CTAs as per DESIGN.md */}
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-ink text-canvas rounded-full flex items-center justify-center shadow-lg border-2 border-canvas cursor-pointer"
          >
            <Settings size={10} />
          </motion.div>
        </div>
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Krostio</h1>
          <div className="flex items-center gap-2 text-ink/40 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs uppercase tracking-widest text-[#141413]">Active Session</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20 group-hover:text-ink/40 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search Ledger..." 
            className="bg-ink/5 border-none rounded-full pl-12 pr-6 py-3 w-64 md:w-80 focus:ring-1 focus:ring-ink/20 transition-all text-sm font-medium"
          />
        </div>
        <button className="p-3 rounded-full bg-white border border-ink/5 text-ink/40 hover:text-ink hover:bg-canvas transition-all shadow-sm">
          <Command size={20} />
        </button>
      </div>
    </header>
  );
}
