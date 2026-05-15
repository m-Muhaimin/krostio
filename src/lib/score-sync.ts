import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia, base } from 'viem/chains'
import { INCOME_ATTESTATION_ABI, getContractAddress, scaleScoreForContract, toCents, scaleVolatilityForContract } from './contract'

// ─── Types ───────────────────────────────────────────────────────

export interface SyncInput {
  workerAddress: `0x${string}`
  score: number            // 300–850
  monthlyAvgIncome: number // USD
  incomeVolatility: number // 0–1 CV
  tenureMonths: number
  platformDiversity: number
  reliabilityScore: number // 0–100
}

export interface SyncResult {
  success: boolean
  txHash?: `0x${string}`
  blockNumber?: number
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────

function getChain() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
  if (rpcUrl?.includes('sepolia')) return baseSepolia
  return base
}

// ─── Main sync function ──────────────────────────────────────────

export async function syncOnChainAttestation(input: SyncInput): Promise<SyncResult> {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey || privateKey === '0000000000000000000000000000000000000000000000000000000000000000') {
    return { success: false, error: 'PRIVATE_KEY not configured or still placeholder' }
  }

  let contractAddress: `0x${string}`
  try {
    contractAddress = getContractAddress()
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }

  const chain = getChain()
  const account = privateKeyToAccount(privateKey as `0x${string}`)

  const publicClient = createPublicClient({
    chain,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL),
  })

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL),
  })

  // Scale params for the contract
  const scoreScaled = scaleScoreForContract(input.score)
  const monthlyCents = toCents(input.monthlyAvgIncome)
  const volatilityScaled = scaleVolatilityForContract(input.incomeVolatility)
  const tenure = BigInt(Math.max(1, input.tenureMonths))
  const diversity = BigInt(Math.max(1, input.platformDiversity))
  const reliability = BigInt(Math.min(100, Math.max(0, Math.round(input.reliabilityScore))))

  try {
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: INCOME_ATTESTATION_ABI,
      functionName: 'attestForWorker',
      args: [
        input.workerAddress,
        scoreScaled,
        monthlyCents,
        volatilityScaled,
        tenure,
        diversity,
        reliability,
      ],
    })

    // Wait for confirmations
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

    return {
      success: true,
      txHash,
      blockNumber: Number(receipt.blockNumber),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}
