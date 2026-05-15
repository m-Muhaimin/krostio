'use client'

import { type Hash, type WalletClient, createClient, http, encodeFunctionData, parseAbi } from 'viem'
import { baseSepolia } from 'viem/chains'

// ─── Configuration ──────────────────────────────────────────────

const PIMLICO_API_KEY =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_PIMLICO_API_KEY
    : undefined

const CHAIN = baseSepolia

/** Whether gasless minting via ERC-4337 is available. */
export const isGaslessAvailable = !!PIMLICO_API_KEY

export type GaslessMintParams = {
  contractAddress: `0x${string}`
  /** Score × 100 (e.g. 68000 for a score of 680) */
  score: bigint
  monthlyAvgIncome: bigint
  incomeVolatility: bigint
  tenureMonths: bigint
  platformDiversity: bigint
  reliabilityScore: bigint
}

/**
 * Perform a gasless mint using ERC-4337 Account Abstraction.
 *
 * Requires NEXT_PUBLIC_PIMLICO_API_KEY to be set and a
 * connected WalletClient from wagmi (via useWalletClient).
 *
 * Flow:
 *   1. Create a SimpleAccount (ERC-4337 smart account) owned by the user's EOA
 *   2. Encode createAttestation() as calldata
 *   3. Pimlico paymaster sponsors gas
 *   4. Pimlico bundler submits UserOp
 *   5. Return txHash once mined
 */
export async function sendGaslessMint(
  params: GaslessMintParams,
  walletClient: WalletClient
): Promise<{ txHash: Hash }> {
  if (!PIMLICO_API_KEY) {
    throw new Error('Gasless minting is not configured. Set NEXT_PUBLIC_PIMLICO_API_KEY.')
  }

  const {
    createSmartAccountClient,
  } = await import('permissionless')
  const {
    toSimpleSmartAccount,
  } = await import('permissionless/accounts')
  const {
    pimlicoActions,
  } = await import('permissionless/actions/pimlico')

  const bundlerUrl = `https://api.pimlico.io/v2/base-sepolia/rpc?apikey=${PIMLICO_API_KEY}`

  // ── Bundler client with Pimlico actions ──
  const pimlicoClient = createClient({
    chain: CHAIN,
    transport: http(bundlerUrl),
  }).extend(
    pimlicoActions({
      entryPoint: {
        address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as `0x${string}`,
        version: 'v0.6',
      },
    })
  )

  // ── Encode createAttestation calldata ──
  const mintCalldata = encodeFunctionData({
    abi: parseAbi([
      'function createAttestation(uint256 score, uint256 monthlyAvgIncome, uint256 incomeVolatility, uint256 tenureMonths, uint256 platformDiversity, uint256 reliabilityScore)',
    ]),
    functionName: 'createAttestation',
    args: [
      params.score,
      params.monthlyAvgIncome,
      params.incomeVolatility,
      params.tenureMonths,
      params.platformDiversity,
      params.reliabilityScore,
    ],
  })

  // ── Get signer from wagmi wallet client ──
  const [account] = walletClient.accounts || []
  if (!account) {
    throw new Error('No account found in wallet client')
  }

  // ── Public client for on-chain reads ──
  const publicClient = await import('viem').then(m =>
    m.createPublicClient({ chain: CHAIN, transport: http('https://sepolia.base.org') })
  )

  // ── Smart account (SimpleAccount v0.6) ──
  const simpleAccount = await toSimpleSmartAccount({
    address: account.address,
    signer: walletClient,
    entryPoint: {
      address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as `0x${string}`,
      version: 'v0.6',
    },
    publicClient,
  })

  // ── Smart account client with Pimlico paymaster ──
  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    chain: CHAIN,
    bundlerTransport: http(bundlerUrl),
    paymaster: {
      getPaymasterData: async (txParams) => {
        const result = await pimlicoClient.sponsorUserOperation({
          userOperation: txParams,
          entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as `0x${string}`,
        })
        return result
      },
      getPaymasterStubData: async (txParams) => {
        const result = await pimlicoClient.sponsorUserOperation({
          userOperation: txParams,
          entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as `0x${string}`,
        })
        return result
      },
    },
    userOperation: {
      estimateFeesPerGas: async () => {
        try {
          return await pimlicoClient.getUserOperationGasPrice()
        } catch {
          return undefined
        }
      },
    },
  })

  // ── Execute the UserOp ──
  const txHash = await smartAccountClient.sendTransaction({
    to: params.contractAddress,
    data: mintCalldata,
    value: 0n,
  })

  return { txHash }
}
