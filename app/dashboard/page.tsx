'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ScoreBento from '@/components/dashboard/ScoreBento';
import LedgerBento from '@/components/dashboard/LedgerBento';
import PassportBento from '@/components/dashboard/PassportBento';
import VerifierBento from '@/components/dashboard/VerifierBento';
import BottomNav from '@/components/dashboard/BottomNav';
import ProfileSection from '@/components/dashboard/ProfileSection';
import InsightsBento from '@/components/dashboard/InsightsBento';
import MilestoneBento from '@/components/dashboard/MilestoneBento';
import OfferBento from '@/components/dashboard/OfferBento';

export default function DashboardPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="p-6 pt-24 lg:pt-10 max-w-6xl">
      <header className="mb-10">
        <h2 className="font-display text-4xl font-medium tracking-tight">Overview</h2>
        <p className="text-ink/60 mt-1">Your financial identity at a glance.</p>
      </header>

      <ProfileSection isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        <div className="md:col-span-3 lg:col-span-8">
          <ScoreBento />
        </div>

        <div className="md:col-span-3 lg:col-span-4">
          <VerifierBento />
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          <PassportBento />
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          <InsightsBento />
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          <MilestoneBento />
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          <OfferBento />
        </div>

        <div className="col-span-full">
          <LedgerBento />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
