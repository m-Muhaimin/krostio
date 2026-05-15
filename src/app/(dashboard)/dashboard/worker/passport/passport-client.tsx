'use client'

import { useState, useEffect, useCallback } from 'react'

type PassportData = {
  id?: string
  walletAddress: string
  tokenId: string
  chain: string
  contractAddress: string | null
  currentScore: number
  scoreTier: string
  mintedAt: string | null
  lastAttestedAt: string | null
  attestationCount: number
  isPublic: boolean
}

type Attestation = {
  id?: string
  score: number
  score_tier: string
  tx_hash: string | null
  attested_at: string
}

type Props = {
  passport: PassportData | null
  attestations: Attestation[]
  currentScore: number | null
  currentTier: string | null
  userEmail: string | null
  userId: string
}

const TIER_META: Record<string, { label: string; color: string; min: number }> = {
  elite: { label: 'Elite', color: 'var(--color-deep-green)', min: 750 },
  strong: { label: 'Strong', color: 'var(--color-link-blue)', min: 680 },
  building: { label: 'Building', color: 'var(--color-signal-orange)', min: 580 },
  emerging: { label: 'Emerging', color: 'var(--color-slate-gray)', min: 300 },
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function shortenAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export function PassportClient({ passport, attestations, currentScore, currentTier, userEmail, userId }: Props) {
  const [walletAddress, setWalletAddress] = useState('')
  const [walletError, setWalletError] = useState<string | null>(null)
  const [minting, setMinting] = useState(false)
  const [mintError, setMintError] = useState<string | null>(null)
  const [mintSuccess, setMintSuccess] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [tokenId, setTokenId] = useState('')
  const [txHash, setTxHash] = useState('')
  const [privacyUpdating, setPrivacyUpdating] = useState(false)
  const [isPublic, setIsPublic] = useState(passport?.isPublic ?? true)
  const [scoreUpdateStatus, setScoreUpdateStatus] = useState<string | null>(null)

  // Client-side refresh of passport data after mint
  const refreshPassport = useCallback(async () => {
    const res = await fetch('/api/passport')
    const json = await res.json()
    if (json.passport) {
      setIsPublic(json.passport.isPublic)
    }
  }, [])

  useEffect(() => {
    if (passport) {
      setIsPublic(passport.isPublic)
    }
  }, [passport])

  const validateWallet = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr.trim())
  }

  const handleMint = async () => {
    setMintError(null)
    setMintSuccess(null)
    setConfirming(false)

    const addr = walletAddress.trim()
    if (!validateWallet(addr)) {
      setWalletError('Enter a valid Ethereum wallet address (0x...40 hex chars)')
      return
    }
    setWalletError(null)
    setMinting(true)

    try {
      const res = await fetch('/api/passport/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addr }),
      })
      const json = await res.json()

      if (!res.ok) {
        setMintError(json.error || 'Mint failed')
        return
      }

      setMintSuccess(
        'Passport record created in database. If a deployed contract exists, please execute the on-chain transaction from your wallet, then confirm below.'
      )
    } catch (err: any) {
      setMintError(err?.message || 'Network error')
    } finally {
      setMinting(false)
    }
  }

  const handleConfirm = async () => {
    if (!tokenId.trim() || !txHash.trim()) return
    setConfirming(true)
    try {
      const res = await fetch('/api/passport/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: tokenId.trim(), txHash: txHash.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMintError(json.error || 'Confirmation failed')
      } else {
        setMintSuccess('Passport minted and confirmed on-chain! 🎉')
        setTokenId('')
        setTxHash('')
        await refreshPassport()
        window.location.reload()
      }
    } catch (err: any) {
      setMintError(err?.message || 'Network error')
    } finally {
      setConfirming(false)
    }
  }

  const handleScoreUpdate = async () => {
    setScoreUpdateStatus('Updating…')
    try {
      const res = await fetch('/api/passport/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: null }), // server-side record only
      })
      const json = await res.json()
      if (!res.ok) {
        setScoreUpdateStatus(json.error || 'Update failed')
      } else {
        setScoreUpdateStatus(
          `Score updated: ${json.previousScore} → ${json.newScore} (${json.scoreChange > 0 ? '+' : ''}${json.scoreChange})`
        )
        await refreshPassport()
        window.location.reload()
      }
    } catch (err: any) {
      setScoreUpdateStatus(err?.message || 'Network error')
    }
  }

  const togglePrivacy = async () => {
    setPrivacyUpdating(true)
    try {
      const res = await fetch('/api/passport', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      })
      if (res.ok) {
        setIsPublic(!isPublic)
      }
    } catch { } finally {
      setPrivacyUpdating(false)
    }
  }

  const needsScore = !currentScore || currentScore < 580
  const tierMeta = TIER_META[currentTier || 'emerging'] || TIER_META.emerging

  return (
    <>
      {!passport ? (
        /* --- No passport — mint flow --- */
        <section className="card-stone">
          <div className="grid gap-12 md:grid-cols-[3fr_2fr]">
            <div>
              <p className="text-mono-label text-slate">Mint your Passport</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-ink-black">
                Claim your on-chain identity.
              </h2>
              <p className="mt-3 text-sm text-slate leading-relaxed">
                Your Krost Passport is a soul-bound token permanently recording your verified income
                identity on Base L2. Once minted, you carry it wherever you go — no platform can take
                it away. Gas costs are paid by Krostio (sub-cent on Base).
              </p>

              {/* Eligibility check */}
              <div className="mt-8 rounded-md border border-hairline p-5">
                <p className="text-mono-label text-slate">Eligibility</p>
                <div className="mt-3 flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: needsScore ? 'var(--color-slate-gray)' : tierMeta.color }}
                  >
                    {currentScore || '—'}
                  </div>
                  <div>
                    <p className="font-display text-xl tracking-tight text-ink-black">
                      {currentScore ? `${currentScore} · ${tierMeta.label}` : 'No score yet'}
                    </p>
                    <p className="text-xs text-slate">
                      {needsScore
                        ? currentScore
                          ? `Score ${currentScore} needs to be at least 580 (Building tier)`
                          : 'Connect platforms and generate a Krost Score before minting'
                        : `Score ${currentScore} qualifies for minting`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet input */}
              {!needsScore && (
                <div className="mt-8">
                  <label className="text-mono-label text-slate">Wallet address</label>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => {
                        setWalletAddress(e.target.value)
                        setWalletError(null)
                      }}
                      placeholder="0x… (Ethereum / Base wallet address)"
                      className="flex-1 rounded-full border border-hairline px-5 py-3 text-sm outline-none focus:border-ink-black"
                    />
                    <button
                      onClick={handleMint}
                      disabled={minting || !walletAddress.trim()}
                      className="btn-ink disabled:opacity-40"
                    >
                      {minting ? 'Minting…' : 'Mint Passport'}
                    </button>
                  </div>
                  {walletError && (
                    <p className="mt-2 text-xs" style={{ color: 'var(--color-error-red)' }}>
                      {walletError}
                    </p>
                  )}
                  {mintError && (
                    <p className="mt-2 text-xs" style={{ color: 'var(--color-error-red)' }}>
                      {mintError}
                    </p>
                  )}
                  {mintSuccess && (
                    <p className="mt-2 text-xs text-deep-green">
                      {mintSuccess}
                    </p>
                  )}
                </div>
              )}

              {/* Confirmation fields (after mint endpoint succeeds) */}
              {mintSuccess && !passport && (
                <div className="mt-6 rounded-md border border-hairline p-5">
                  <p className="text-mono-label text-slate">Confirm on-chain mint</p>
                  <p className="mt-2 text-xs text-slate">
                    After executing the on-chain transaction from your wallet, enter the details below.
                  </p>
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      placeholder="Token ID (from contract)"
                      className="w-full rounded-full border border-hairline px-5 py-2.5 text-sm outline-none focus:border-ink-black"
                    />
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Transaction hash (0x...)"
                      className="w-full rounded-full border border-hairline px-5 py-2.5 text-sm outline-none focus:border-ink-black"
                    />
                    <button
                      onClick={handleConfirm}
                      disabled={confirming || !tokenId || !txHash}
                      className="btn-outline text-xs disabled:opacity-40"
                    >
                      {confirming ? 'Confirming…' : 'Confirm mint'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: what the passport looks like */}
            {!needsScore && (
              <div className="hidden md:block">
                <div className="sticky top-24 rounded-md border border-hairline p-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ink-black">
                    <span className="text-3xl text-white">K</span>
                  </div>
                  <p className="mt-4 text-xs text-slate">Your Passport preview</p>
                  <p className="mt-2 font-display text-4xl tracking-tight text-ink-black">
                    {currentScore}
                  </p>
                  <span
                    className="mt-2 inline-block rounded-full px-4 py-1 text-sm text-white"
                    style={{ backgroundColor: tierMeta.color }}
                  >
                    {tierMeta.label}
                  </span>
                  <p className="mt-4 text-xs text-slate">
                    {shortenAddress('0x' + '0'.repeat(40))}
                  </p>
                  <p className="mt-1 text-xs text-slate">Base L2 · Soul-bound</p>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* --- Passport exists — show it --- */
        <>
          {/* Passport card */}
          <section className="card-stone">
            <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
              {/* Left: badge */}
              <div className="text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${tierMeta.color}, ${tierMeta.color}88)`,
                  }}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                    <span className="font-display text-4xl tracking-tight" style={{ color: tierMeta.color }}>
                      {passport.currentScore}
                    </span>
                  </div>
                </div>
                <span
                  className="mt-4 inline-block rounded-full px-5 py-1.5 text-sm font-medium text-white"
                  style={{ backgroundColor: tierMeta.color }}
                >
                  {TIER_META[passport.scoreTier]?.label || passport.scoreTier}
                </span>
                <p className="mt-3 text-xs text-slate">
                  Wallet: {shortenAddress(passport.walletAddress)}
                </p>
                {passport.tokenId && (
                  <p className="text-xs text-slate">
                    Token #{passport.tokenId} · {passport.chain === 'base' ? 'Base L2' : passport.chain}
                  </p>
                )}
              </div>

              {/* Right: details */}
              <div className="space-y-6">
                <div>
                  <p className="text-mono-label text-slate">Passport details</p>
                  <p className="mt-1 text-sm text-ink-black">
                    {userEmail}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Minted', value: formatDate(passport.mintedAt) },
                    { label: 'Last attestation', value: formatDateTime(passport.lastAttestedAt) },
                    { label: 'Total attestations', value: String(passport.attestationCount) },
                    { label: 'Status', value: passport.mintedAt ? 'Minted' : 'Draft' },
                  ].map((d) => (
                    <div key={d.label}>
                      <p className="text-mono-label text-slate text-xs">{d.label}</p>
                      <p className="mt-1 text-sm font-medium text-ink-black">{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-hairline">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate cursor-pointer" htmlFor="privacy-toggle">
                      Public profile
                    </label>
                    <button
                      id="privacy-toggle"
                      onClick={togglePrivacy}
                      disabled={privacyUpdating}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        isPublic ? 'bg-deep-green' : 'bg-hairline'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isPublic ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={handleScoreUpdate}
                    className="btn-outline text-xs"
                  >
                    Sync latest score
                  </button>

                  {passport.contractAddress && (
                    <a
                      href={`https://basescan.org/address/${passport.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-editorial text-xs"
                    >
                      View on BaseScan →
                    </a>
                  )}
                </div>

                {scoreUpdateStatus && (
                  <p className="text-xs text-deep-green">{scoreUpdateStatus}</p>
                )}

                {/* Public passport URL */}
                {isPublic && passport.walletAddress && (
                  <div className="rounded-md bg-soft-stone px-4 py-3">
                    <p className="text-mono-label text-slate text-xs">Public passport URL</p>
                    <p className="mt-1 text-sm font-medium text-ink-black break-all">
                      {typeof window !== 'undefined'
                        ? `${window.location.origin}/passport/${passport.walletAddress}`
                        : `/passport/${passport.walletAddress}`}
                    </p>
                    <p className="mt-1 text-xs text-slate">
                      Share this link for anyone to verify your attested score.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Attestation history */}
          <section>
            <h2 className="mb-6 text-heading-feature text-ink-black">
              Attestation history
            </h2>
            {attestations.length === 0 ? (
              <div className="card-bordered px-8 py-12 text-center">
                <p className="text-mono-label text-slate">No attestations</p>
                <p className="mt-2 text-sm text-slate">
                  Attestations will appear here when your score is synced on-chain.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-hairline">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-soft-stone text-mono-label text-slate">
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium text-right">Score</th>
                      <th className="px-5 py-3 font-medium">Tier</th>
                      <th className="px-5 py-3 font-medium">TX Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {attestations.map((a) => (
                      <tr key={a.id || a.attested_at} className="hover:bg-soft-stone transition-colors">
                        <td className="px-5 py-4 text-ink-black">
                          {formatDateTime(a.attested_at)}
                        </td>
                        <td className="px-5 py-4 text-right font-display text-lg tracking-tight text-ink-black">
                          {a.score}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white"
                            style={{
                              backgroundColor: TIER_META[a.score_tier]?.color || 'var(--color-slate-gray)',
                            }}
                          >
                            {TIER_META[a.score_tier]?.label || a.score_tier}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {a.tx_hash ? (
                            <a
                              href={`https://basescan.org/tx/${a.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-slate underline underline-offset-2 hover:text-ink-black"
                            >
                              {a.tx_hash.slice(0, 10)}…{a.tx_hash.slice(-6)}
                            </a>
                          ) : (
                            <span className="text-xs text-slate">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* FAQ */}
      <section className="border-t border-hairline pt-10">
        <h2 className="mb-6 text-heading-feature text-ink-black">About the Passport</h2>
        <div className="space-y-6 max-w-2xl">
          {[
            {
              q: 'What is a soul-bound token?',
              a: 'A non-transferable NFT permanently linked to your wallet. It cannot be sold, traded, or transferred — it belongs to you forever.',
            },
            {
              q: 'Why Base L2?',
              a: 'Base is an Ethereum L2 built by Coinbase. Gas costs are sub-cent, blocks finalize in seconds, and it has strong institutional backing. Your Passport costs us essentially nothing to mint and update.',
            },
            {
              q: 'Is my wallet required?',
              a: 'Currently yes. We are building email-based wallet creation via ERC-4337 Account Abstraction so anyone can mint a Passport without managing seed phrases.',
            },
            {
              q: 'What lenders can verify my Passport?',
              a: 'Lenders on the Krostio platform can verify your score on-chain. We are expanding the lender directory each month. You control who sees what.',
            },
            {
              q: 'Can I delete my Passport?',
              a: 'The on-chain attestation is permanent by design (blockchain is immutable). However, you can toggle your passport visibility off in settings, which hides it from public queries.',
            },
          ].map((faq) => (
            <div key={faq.q}>
              <p className="text-sm font-medium text-ink-black">{faq.q}</p>
              <p className="mt-1 text-sm text-slate leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
