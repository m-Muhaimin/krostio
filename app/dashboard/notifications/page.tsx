'use client';

import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';
import { Bell, BellOff, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const { isLoading, error, refresh } = useKrostData();

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
          <h2 className="font-display text-4xl font-medium tracking-tight">Notifications</h2>
          <p className="text-ink/60 mt-1">Stay updated on score changes, report views, and new lender requests.</p>
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

      <div className="card-cohere p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center max-w-sm mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-ink/5 flex items-center justify-center mb-6">
            <BellOff size={36} className="text-ink/20" />
          </div>

          <h3 className="font-display text-2xl font-medium tracking-tight mb-2">No Notifications Yet</h3>
          <p className="text-ink/60 text-sm leading-relaxed mb-8">
            Notifications aren&apos;t implemented yet but will appear here. You&apos;ll be
            notified about score changes, report views, lender requests, and platform
            connection updates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <Bell size={18} className="text-ink/30 mx-auto mb-2" />
              <p className="text-xs font-medium">Score Changes</p>
              <p className="text-[10px] text-ink/40 mt-1">
                When your score goes up or down
              </p>
            </div>
            <div className="p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <Bell size={18} className="text-ink/30 mx-auto mb-2" />
              <p className="text-xs font-medium">Report Views</p>
              <p className="text-[10px] text-ink/40 mt-1">
                When a lender views your report
              </p>
            </div>
            <div className="p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <Bell size={18} className="text-ink/30 mx-auto mb-2" />
              <p className="text-xs font-medium">Lender Offers</p>
              <p className="text-[10px] text-ink/40 mt-1">
                New lending opportunities
              </p>
            </div>
          </div>

          <p className="text-xs text-ink/30 mt-8 font-mono uppercase tracking-widest">
            Coming Soon
          </p>
        </motion.div>
      </div>
    </div>
  );
}
