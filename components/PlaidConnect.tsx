'use client';

import { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidConnectProps {
  onSuccess?: (platform: string, entriesImported: number) => void;
  buttonLabel?: string;
  className?: string;
  variant?: 'onboarding' | 'inline';
}

export default function PlaidConnect({
  onSuccess,
  buttonLabel = 'Connect Bank or Gig Account',
  className = '',
  variant = 'inline',
}: PlaidConnectProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch link token when user interacts
  const fetchLinkToken = useCallback(async () => {
    if (linkToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plaid/link-token', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get link token');
      setLinkToken(data.linkToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [linkToken]);

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/plaid/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicToken,
            institutionId: metadata.institution?.institution_id,
            institutionName: metadata.institution?.name,
            accountId: metadata.accounts?.[0]?.id,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Exchange failed');

        if (onSuccess) {
          onSuccess(data.platform, data.entriesImported);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => onPlaidSuccess(publicToken, metadata),
    onExit: () => setLoading(false),
  });

  const handleClick = async () => {
    if (!linkToken) {
      await fetchLinkToken();
    }
    if (ready) {
      open();
    }
  };

  if (variant === 'onboarding') {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <div className="w-16 h-16 bg-ink rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-canvas" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-[28px] font-[500] tracking-[-0.02em] mb-2">Connect Your Income</h2>
          <p className="text-[#141413]/60 max-w-sm mx-auto">
            Link your bank account or gig platform to verify your earnings. Your data is encrypted and never shared without your permission.
          </p>
        </div>

        <button
          onClick={handleClick}
          disabled={loading}
          className="btn-ink inline-flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {buttonLabel}
            </>
          )}
        </button>

        {error && (
          <p className="mt-4 text-[#CF4500] text-sm">{error}</p>
        )}

        <p className="mt-6 text-xs text-[#141413]/40">
          Powered by Plaid. Securely connect 12,000+ financial institutions.
        </p>
      </div>
    );
  }

  // Inline variant
  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading || !linkToken}
        className={`btn-outline inline-flex items-center gap-2 ${className}`}
      >
        {loading ? 'Connecting...' : buttonLabel}
      </button>
      {error && <p className="mt-2 text-[#CF4500] text-sm">{error}</p>}
    </div>
  );
}
