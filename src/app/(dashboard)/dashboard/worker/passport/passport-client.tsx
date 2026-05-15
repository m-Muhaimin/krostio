'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useWalletClient } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { INCOME_ATTESTATION_ABI } from '@/lib/contract'
import { isGaslessAvailable } from '@/lib/erc4337'

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

type GaslessMode = 'standard' | 'gasless'

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
  if (!addr || addr.length < 10) return addr
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export function PassportClient({ passport, attestations, currentScore, currentTier, userEmail, userId }: Props) {
  // ─── Existing state ───
  const [confirming, setConfirming] = useState(false)
  const [tokenId, setTokenId] = useState('')
  const [txHash, setTxHash] = useState('')
  const [walletError, setWalletError] = useState<string | null>(null)
  const [mintError, setMintError] = useState<string | null>(null)
  const [mintSuccess, setMintSuccess] = useState<string | null>(null)
  const [privacyUpdating, setPrivacyUpdating] = useState(false)
  const [isPublic, setIsPublic] = useState(passport?.isPublic ?? true)
  const [scoreUpdateStatus, setScoreUpdateStatus] = useState<string | null>(null)
  const [minting, setMinting] = useState(false)
  const [gaslessMode, setGaslessMode] = useState<GaslessMode>('standard')

  // ─── Wagmi hooks ───
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()

  // ─── Contract write ───
  const { data: writeHash, isPending: txPending, writeContract } = useWriteContract()
  const { isLoading: txConfirming, isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: writeHash,
  })

  // Auto-confirm after tx confirmed
  useEffect(() => {
    if (txConfirmed && writeHash && !confirming) {
      handleConfirmTx(writeHash)
    }
  }, [txConfirmed, writeHash])

  const [mintPayload, setMintPayload] = useState<any>(null)

  useEffect(() => {
    if (passport) {
      setIsPublic(passport.isPublic)
    }
  }, [passport])

  const refreshPassport = useCallback(async () => {
    const res = await fetch('/api/passport')
    const json = await res.json()
    if (json.passport) {
      setIsPublic(json.passport.isPublic)
    }
  }, [])

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  /** Step 1: Call API to create passport draft, then execute on-chain tx */
  const handleMint = async () => {
    if (!address) {
      setWalletError('Connect your wallet first')
      return
    }
    setMintError(null)
    setMintSuccess(null)
    setMinting(true)

    try {
      // 1. Create passport record in DB
      const res = await fetch('/api/passport/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      })
      const json = await res.json()

      if (!res.ok) {
        setMintError(json.error || 'Mint failed')
        return
      }

      setMintPayload(json.mintPayload)

      if (!json.mintPayload) {
        // No contract deployed — DB-only mode
        setMintSuccess('Passport record created. (Contract not deployed yet.)')
        return
      }

      const params = json.mintPayload.params

      // 2. Execute on-chain transaction
      if (gaslessMode === 'gasless') {
        // Gasless via ERC-4337
        try {
          if (!walletClient) {
            throw new Error('Wallet client not available. Reconnect your wallet.')
          }
          const { sendGaslessMint } = await import('@/lib/erc4337')
          const contractAddress = json.mintPayload.contractAddress as `0x${string}`
          const result = await sendGaslessMint(
            {
              contractAddress,
              score: BigInt(params.score),
              monthlyAvgIncome: BigInt(params.monthlyAvgIncome),
              incomeVolatility: BigInt(params.incomeVolatility),
              tenureMonths: BigInt(params.tenureMonths),
              platformDiversity: BigInt(params.platformDiversity),
              reliabilityScore: BigInt(params.reliabilityScore),
            },
            walletClient
          )
          // On success, confirm the mint
          await handleConfirmTx(result.txHash)
        } catch (err: any) {
          setMintError(err?.message || 'Gasless mint failed. Try standard mode.')
        }
      } else {
        // Standard: use wagmi writeContract
        const contractAddr = json.mintPayload.contractAddress as `0x${string}`
        writeContract({
          address: contractAddr,
          abi: INCOME_ATTESTATION_ABI,
          functionName: 'createAttestation',
          args: [
            BigInt(params.score),
            BigInt(params.monthlyAvgIncome),
            BigInt(params.incomeVolatility),
            BigInt(params.tenureMonths),
            BigInt(params.platformDiversity),
            BigInt(params.reliabilityScore),
          ],
        })
        // useEffect will handle confirmation when txConfirmed fires
      }
    } catch (err: any) {
      setMintError(err?.message || 'Network error')
    } finally {
      setMinting(false)
    }
  }

  /** Step 2: Confirm the on-chain mint in the DB */
  const handleConfirmTx = async (hash: `0x${string}`) => {
    setConfirming(true)
    try {
      const res = await fetch('/api/passport/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: tokenId || null, txHash: hash }),
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
        body: JSON.stringify({ txHash: null }),
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

  // Determine tx status message
  const txStatusMessage = txPending
    ? 'Waiting for wallet confirmation…'
    : txConfirming
      ? 'Transaction submitted. Waiting for confirmation…'
      : txConfirmed
        ? 'Transaction confirmed! Finalizing…'
        : null

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
                it away. Gas costs are minimal on Base (sub-cent).
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

              {/* Wallet connection + mint */}
              {!needsScore && (
                <div className="mt-8 space-y-4">
                  {/* Wallet status */}
                  <div className="rounded-md border border-hairline p-4">
                    <p className="text-mono-label text-slate">Wallet</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isConnected ? (
                          <>
                            <span className="inline-flex h-3 w-3 rounded-full bg-deep-green" />
                            <span className="text-sm font-medium text-ink-black">
                              {shortenAddress(address || '')}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex h-3 w-3 rounded-full bg-slate" />
                            <span className="text-sm text-slate">Not connected</span>
                          </>
                        )}
                      </div>
                      {isConnected ? (
                        <button onClick={() => disconnect()} className="text-xs text-slate underline underline-offset-2 hover:text-ink-black">
                          Disconnect
                        </button>
                      ) : (
                        <button onClick={handleConnect} className="btn-ink text-xs">
                          Connect Wallet
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gasless toggle */}
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={gaslessMode === 'gasless'}
                        onChange={(e) => setGaslessMode(e.target.checked ? 'gasless' : 'standard')}
                      />
                      <span className="h-5 w-9 rounded-full bg-hairline after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-deep-green peer-checked:after:translate-x-4" />
                    </label>
                    <span className="text-xs text-slate">
                      Gasless mint{gaslessMode === 'gasless' ? ' (sponsored by Krost)' : ''}
                    </span>
                  </div>

                  {/* Mint button */}
                  {isConnected && (
                    <button
                      onClick={handleMint}
                      disabled={minting || txPending || txConfirming}
                      className="btn-signal disabled:opacity-40"
                    >
                      {minting ? 'Creating passport…' :
                       txPending ? 'Confirm in wallet…' :
                       txConfirming ? 'Confirming transaction…' :
                       'Mint Passport'}
                    </button>
                  )}

                  {/* Transaction status */}
                  {txStatusMessage && (
                    <p className="text-xs text-link-blue">{txStatusMessage}</p>
                  )}

                  {/* Errors */}
                  {walletError && (
                    <p className="text-xs" style={{ color: 'var(--color-error-red)' }}>{walletError}</p>
                  )}
                  {mintError && (
                    <p className="text-xs" style={{ color: 'var(--color-error-red)' }}>{mintError}</p>
                  )}

                  {/* Success */}
                  {mintSuccess && (
                    <p className="text-xs text-deep-green">{mintSuccess}</p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
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
                    {isConnected ? shortenAddress(address || '') : '0x…'}
                  </p>
                  <p className="mt-1 text-xs text-slate">Base L2 · Soul-bound</p>
                  {isConnected && (
                    <p className="mt-3 text-[10px] text-deep-green">✓ Wallet connected</p>
                  )}
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
                              className="font-mono text-xs text-link-blue underline underline-offset-2"
                            >
                              {shortenAddress(a.tx_hash)}
                            </a>
                          ) : (
                            <span className="text-xs text-slate">—</span>
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
    </>
  )
}
