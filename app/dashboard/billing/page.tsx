'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRICING } from '@/lib/stripe';

function BillingContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  useEffect(() => {
    fetch('/api/stripe/status')
      .then(r => r.json())
      .then(d => { if (d.plan) setCurrentPlan(d.plan); })
      .catch(() => {});
  }, []);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 pt-24 lg:pt-10 max-w-6xl">
      <header className="mb-10">
        <h2 className="font-display text-4xl font-medium tracking-tight">Billing</h2>
        <p className="text-ink/60 mt-1">Manage your subscription and upgrade your plan.</p>
      </header>

      {success && (
        <div className="card-cohere p-4 mb-8 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-green-700">Upgrade successful! Your plan has been updated.</p>
        </div>
      )}

      {cancelled && (
        <div className="card-cohere p-4 mb-8 border-l-4 border-l-ink/20">
          <p className="text-sm font-medium text-ink/60">Checkout cancelled. No changes made.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Object.values(PRICING).map((plan) => {
          const isCurrent = currentPlan === plan.id || (currentPlan === 'free' && plan.id === 'free');
          const isFree = plan.id === 'free';

          return (
            <div
              key={plan.id}
              className={`card-cohere p-6 flex flex-col ${isCurrent ? 'ring-2 ring-ink' : ''}`}
            >
              <h3 className="font-display text-xl font-medium">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-medium">${plan.price}</span>
                {plan.price > 0 && <span className="text-ink/40 text-sm">/mo</span>}
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-ink/70 flex items-start gap-2">
                    <span className="mt-0.5 text-green-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="btn-primary w-full text-center mt-6 !bg-ink/10 !text-ink cursor-default">
                  {isFree ? 'Current plan' : 'Active'}
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading !== null}
                  className="btn-primary w-full text-center mt-6 disabled:opacity-50"
                >
                  {loading === plan.id ? 'Processing...' : isFree ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-6 pt-24 lg:pt-10 max-w-6xl"><p className="text-ink/60">Loading billing...</p></div>}>
      <BillingContent />
    </Suspense>
  );
}
