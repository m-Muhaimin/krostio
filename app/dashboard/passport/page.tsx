
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useKrostData } from '@/hooks/use-krost-data';
import {
  Sparkles,
  Globe,
  Shield,
  BadgeCheck,
  ExternalLink,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Wallet,
} from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-ink/50 hover:text-ink transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function shortenAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** Check if browser has MetaMask or another EIP-1193 provider */
function hasWalletProvider(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
}

/** Connect wallet and return address */
async function connectWallet(): Promise<string> {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error('No wallet found. Install MetaMask or another Web3 wallet.');

  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) throw new Error('No accounts found.');
  return accounts[0];
}

export default function PassportPage() {
  const { passport, score, tier, isLoading, error, refresh } = useKrostData();
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const hasPassport = passport?.id && passport?.status === 'verified';
  const displayScore = score ?? 300;
  const displayTier = tier ?? 'Emerging';
  const meetsRequirement = displayScore >= 580;

  const handleConnectWallet = useCallback(async () => {
    if (!hasWalletProvider()) {
      setWalletError('No wallet detected. Install MetaMask or a Web3-compatible browser wallet.');
      return;
    }
    setWalletConnecting(true);
    setWalletError(null);
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
    } catch (err: any) {
      setWalletError(err.message || 'Failed to connect wallet');
    } finally {
      setWalletConnecting(false);
    }
  }, []);

  const handleMint = async () => {
    if (!walletAddress) {
      setMintError('Please connect your wallet first.');
      return;
    }

    setMinting(true);
    setMintError(null);
    setMintSuccess(null);

    try {
      const res = await fetch('/api/passport/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to mint passport');
      }
      const data = await res.json();
      setMintSuccess(
        data.on_chain
          ? `Passport minted on-chain! Tx: ${data.tx_hash}`
          : 'Passport created successfully! On-chain attestation will be enabled after mainnet launch.'
      );
      refresh();
    } catch (err: any) {
      setMintError(err.message);
    } finally {
      setMinting(false);
    }
  };

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
          <h2 className="font-display text-4xl font-medium tracking-tight">Krost Passport</h2>
          <p className="text-ink/60 mt-1">Mint and manage your on-chain credential. Connect wallet, view attestation history, and control privacy.</p>
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

      {mintError && (
        <div className="card-cohere p-4 mb-6 border-l-4 border-l-coral">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-coral" />
            <p className="text-sm">{mintError}</p>
          </div>
        </div>
      )}

      {mintSuccess && (
        <div className="card-cohere p-4 mb-6 border-l-4 border-l-green-500 bg-green-50/20">
          <p className="text-sm font-medium text-green-700 break-all">{mintSuccess}</p>
        </div>
      )}

      {walletError && (
        <div className="card-cohere p-4 mb-6 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            <p className="text-sm">{walletError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Passport Card */}
        <div className="lg:col-span-2 card-cohere p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Visual */}
            <div className="relative w-40 h-40 flex-shrink-0 mx-auto lg:mx-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-hairline"
              />
              <div className="absolute inset-3 rounded-full bg-soft-stone flex items-center justify-center border border-hairline">
                <div className="text-center">
                  {hasPassport ? (
                    <>
                      <Sparkles size={32} className="mx-auto text-action-blue" />
                      <span className="block text-[10px] font-mono uppercase tracking-widest text-ink/40 mt-1">
                        Issued
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block text-2xl font-display font-medium text-ink">SBT</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
                        Soulbound
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-hairline">
                <Globe size={16} className="text-action-blue" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <BadgeCheck size={20} className={hasPassport ? 'text-green-500' : 'text-ink/20'} />
                <h3 className="font-display text-2xl font-medium tracking-tight">
                  {hasPassport ? 'Verified Passport' : 'Not Minted'}
                </h3>
              </div>

              <p className="text-ink/60 text-sm mb-4">
                {hasPassport
                  ? 'Your on-chain identity credential is active and verified.'
                  : 'Mint your Krost Passport to prove your financial identity on-chain.'}
              </p>

              {/* Score Requirement */}
              {!hasPassport && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-cohere-pill bg-ink/5 text-sm mb-4">
                  <Shield size={14} className="text-ink/40" />
                  <span>
                    Score requirement:{' '}
                    <span className={`font-medium ${displayScore >= 580 ? 'text-green-600' : 'text-coral'}`}>
                      {displayScore} / 580
                    </span>
                  </span>
                </div>
              )}

              {/* Wallet Connect + Mint */}
              {!hasPassport && (
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {/* Connect wallet button */}
                  <button
                    onClick={handleConnectWallet}
                    disabled={walletConnecting}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-cohere-pill border text-sm font-medium transition-all ${
                      walletAddress
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white border-hairline text-ink hover:border-ink/40'
                    } disabled:opacity-50`}
                  >
                    {walletConnecting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting...
                      </>
                    ) : walletAddress ? (
                      <>
                        <Wallet size={16} />
                        {shortenAddress(walletAddress)}
                      </>
                    ) : (
                      <>
                        <Wallet size={16} />
                        Connect Wallet
                      </>
                    )}
                  </button>

                  {/* Mint button */}
                  <button
                    onClick={handleMint}
                    disabled={minting || !meetsRequirement || !walletAddress}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-cohere-pill bg-brand-black text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {minting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Mint Passport
                      </>
                    )}
                  </button>
                </div>
              )}

              {!hasPassport && !meetsRequirement && (
                <p className="text-xs text-ink/40 mt-2">
                  Continue building your score to reach the 580 threshold.
                </p>
              )}

              {hasPassport && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-cohere-pill bg-green-50 text-green-700 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active on {passport?.chain || 'Unknown'}
                  </span>
                  {passport?.contract_address && (
                    <CopyButton text={passport.contract_address} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — Current Score */}
        <div className="card-cohere p-6">
          <p className="text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-ink/40 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            Current Score
          </p>
          <div className="text-center py-4">
            <div className="text-5xl font-display font-medium tracking-tight">{displayScore}</div>
            <span className="inline-block mt-2 px-3 py-1 rounded-cohere-pill bg-coral/10 text-coral text-xs font-mono font-medium">
              {displayTier}
            </span>
            <p className="text-xs text-ink/40 mt-4 leading-relaxed">
              {displayScore >= 750
                ? 'Elite tier — you qualify for the best lending rates.'
                : displayScore >= 680
                  ? 'Strong tier — most lenders will view your profile favorably.'
                  : displayScore >= 580
                    ? 'Building tier — you meet the passport minting threshold.'
                    : 'Emerging tier — keep building to unlock the passport.'}
            </p>
          </div>
        </div>
      </div>

      {/* Passport Details — Only show if minted */}
      {hasPassport && passport && (
        <div className="card-cohere p-6 mt-6">
          <h3 className="font-display text-lg font-medium tracking-tight mb-6">Passport Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailField
              label="Token ID"
              value={passport.token_id || '—'}
              mono
            />
            <DetailField
              label="Contract Address"
              value={passport.contract_address ? shortenAddress(passport.contract_address) : '—'}
              mono
              copyable={passport.contract_address || undefined}
            />
            <DetailField
              label="Chain / Network"
              value={passport.chain || '—'}
            />
            <DetailField
              label="Status"
              value={passport.status || '—'}
              badge={
                passport.status === 'verified' || passport.status === 'active'
                  ? 'green'
                  : 'default'
              }
            />
            <DetailField
              label="Minted At"
              value={passport.minted_at ? new Date(passport.minted_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : '—'}
            />
            <DetailField
              label="Last Updated"
              value={passport.updated_at ? new Date(passport.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : '—'}
            />
          </div>
        </div>
      )}

      {/* No passport — show info about what it does */}
      {!hasPassport && (
        <div className="card-cohere p-6 mt-6">
          <h3 className="font-display text-lg font-medium tracking-tight mb-4">What is Krost Passport?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <Globe size={20} className="text-action-blue mb-2" />
              <h4 className="text-sm font-medium mb-1">On-Chain Identity</h4>
              <p className="text-xs text-ink/50 leading-relaxed">
                A soulbound token (SBT) that&apos;s non-transferable and uniquely tied to your
                verified financial identity.
              </p>
            </div>
            <div className="p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <Shield size={20} className="text-action-blue mb-2" />
              <h4 className="text-sm font-medium mb-1">Privacy First</h4>
              <p className="text-xs text-ink/50 leading-relaxed">
                You control what data is revealed. Lenders only see what you choose to share
                through verification reports.
              </p>
            </div>
            <div className="p-4 rounded-cohere-sm bg-soft-stone border border-hairline">
              <BadgeCheck size={20} className="text-action-blue mb-2" />
              <h4 className="text-sm font-medium mb-1">Universal Verification</h4>
              <p className="text-xs text-ink/50 leading-relaxed">
                Use your passport across any lender in the Krost network without re-verifying
                your identity each time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
  copyable,
  badge,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: string;
  badge?: 'green' | 'default';
}) {
  return (
    <div>
      <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-ink/40 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className={`text-sm ${mono ? 'font-mono' : 'font-medium'}`}>
          {badge === 'green' ? (
            <span className="inline-flex items-center gap-1.5 text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {value}
            </span>
          ) : (
            value
          )}
        </p>
        {copyable && <CopyButton text={copyable} />}
      </div>
    </div>
  );
}
