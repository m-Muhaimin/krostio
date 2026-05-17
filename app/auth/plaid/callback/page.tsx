'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const publicToken = searchParams.get('public_token') ||
      searchParams.get('oauth_state_complete') || null;

    if (!publicToken) {
      setStatus('No token received. You may close this window.');
      setTimeout(() => router.push('/dashboard'), 2000);
      return;
    }

    setStatus('Reconnecting to your account...');
    setTimeout(() => router.push('/dashboard'), 1500);
  }, [router, searchParams]);

  return (
    <div className="text-center">
      <div className="w-12 h-12 border-2 border-ink/20 border-t-ink rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-[#141413]/60">{status}</p>
    </div>
  );
}

export default function PlaidCallbackPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-ink/20 border-t-ink rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#141413]/60">Loading...</p>
        </div>
      }>
        <CallbackInner />
      </Suspense>
    </div>
  );
}
