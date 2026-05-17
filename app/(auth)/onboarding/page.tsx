'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PlaidConnect from '@/components/PlaidConnect';

export default function OnboardingPage() {
  const router = useRouter();
  const [connected, setConnected] = useState<string | null>(null);
  const [showSkip, setShowSkip] = useState(false);

  const handlePlaidSuccess = (platform: string, entriesImported: number) => {
    setConnected(platform);
    // Navigate to dashboard after brief success display
    setTimeout(() => router.push('/dashboard'), 800);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {connected ? (
          <div className="text-center py-12 animate-fadeIn">
            <div className="w-16 h-16 bg-ink rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-canvas" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[28px] font-[500] tracking-[-0.02em] mb-2">Connected!</h2>
            <p className="text-[#141413]/60">
              {connected} linked — taking you to your dashboard...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="text-[32px] font-[500] tracking-[-0.02em]">Connect your income</h1>
              <p className="text-[#141413]/60 mt-3 text-sm max-w-md mx-auto">
                Link your bank or gig account to verify your earnings and unlock your Krost Score.
              </p>
            </div>

            <PlaidConnect
              onSuccess={handlePlaidSuccess}
              variant="onboarding"
              buttonLabel="Connect bank or gig account"
            />

            <div className="mt-10 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#141413]/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-canvas px-4 text-[#141413]/40">or connect a platform directly</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-6">
              {[
                { id: 'uber', name: 'Uber', icon: '🚗' },
                { id: 'doordash', name: 'DoorDash', icon: '🛵' },
                { id: 'lyft', name: 'Lyft', icon: '🚙' },
                { id: 'instacart', name: 'Instacart', icon: '🛒' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={async () => {
                    await fetch('/api/platform/connect', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ platform: p.id, connection_status: 'active', provider: 'manual' }),
                    });
                    setConnected(p.id);
                    setTimeout(() => router.push('/dashboard'), 600);
                  }}
                  className="bg-white rounded-[40px] p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all cursor-pointer"
                >
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs font-[500]">{p.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-[#141413]/60 hover:text-ink underline underline-offset-4"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
