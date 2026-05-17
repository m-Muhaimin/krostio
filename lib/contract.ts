import { createWalletClient, createPublicClient, http, parseAbi, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

/**
 * IncomeAttestation contract ABI (Base L2)
 * Covers core functions: createAttestation, revoke, grant/revoke lender access
 */
export const ATTESTATION_ABI = parseAbi([
  'function createAttestation(uint256 score, uint256 monthlyAvgIncome, uint256 incomeVolatility, uint256 tenureMonths, uint256 platformDiversity, uint256 reliabilityScore) external',
  'function revokeAttestation(uint256 attestationId) external',
  'function grantLenderAccess(address lender, uint256 durationSeconds) external',
  'function revokeLenderAccess(address lender) external',
  'function getLatestAttestation(address worker) external view returns (uint256 id, address worker_, uint256 score, uint256 monthlyAvgIncome, uint256 incomeVolatility, uint256 tenureMonths, uint256 platformDiversity, uint256 reliabilityScore, uint256 timestamp, bool isActive)',
  'function getWorkerAttestationIds(address worker) external view returns (uint256[])',
  'function hasAccess(address worker, address lender) external view returns (bool)',
  'event AttestationCreated(uint256 indexed id, address indexed worker, uint256 score, uint256 timestamp)',
  'event AttestationRevoked(uint256 indexed id)',
]);

/** Get the contract address from environment */
export function getContractAddress(): `0x${string}` {
  const addr = process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS;
  if (!addr || addr === '0x') {
    throw new Error('NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS not configured');
  }
  return addr as `0x${string}`;
}

/** Get RPC URL from environment */
export function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
}

/**
 * Creates an on-chain attestation using the server's private key.
 * Returns the attestation ID on success.
 * NOTE: Requires a real PRIVATE_KEY in .env — the current placeholder 0x0... will fail.
 * Falls back gracefully when key is not configured.
 */
export async function mintOnChainAttestation(params: {
  score: number;              // 300-850
  monthlyAvgIncome: number;   // in cents USD
  incomeVolatility: number;   // 0-10000 (4 decimals)
  tenureMonths: number;
  platformDiversity: number;
  reliabilityScore: number;   // 0-100
}): Promise<{ attestationId: number; txHash: string } | null> {
  const pk = process.env.PRIVATE_KEY;
  if (!pk || pk === '0000000000000000000000000000000000000000000000000000000000000000') {
    console.warn('[contract] PRIVATE_KEY not configured — skipping on-chain attestation');
    return null;
  }

  try {
    const account = privateKeyToAccount(`0x${pk.startsWith('0x') ? pk.slice(2) : pk}`);
    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(getRpcUrl()),
    }).extend(publicActions);

    const { request } = await client.simulateContract({
      address: getContractAddress(),
      abi: ATTESTATION_ABI,
      functionName: 'createAttestation',
      args: [
        BigInt(Math.min(85000, Math.max(30000, params.score * 100))), // score * 100
        BigInt(Math.round(params.monthlyAvgIncome)),
        BigInt(Math.min(10000, Math.max(0, Math.round(params.incomeVolatility)))),
        BigInt(Math.max(1, params.tenureMonths)),
        BigInt(Math.max(1, params.platformDiversity)),
        BigInt(Math.min(100, Math.max(0, params.reliabilityScore))),
      ],
    });

    const txHash = await client.writeContract(request);
    return { attestationId: 0, txHash }; // ID not returned from write — we'll read it from event
  } catch (err) {
    console.error('[contract] On-chain attestation failed:', err);
    return null;
  }
}

/**
 * Fetch latest attestation for a wallet address from the chain.
 * Returns null if none found or contract not configured.
 */
export async function getOnChainAttestation(workerAddress: `0x${string}`) {
  const addr = process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS;
  if (!addr || addr === '0x') return null;

  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(getRpcUrl()),
    });

    const result = await client.readContract({
      address: addr as `0x${string}`,
      abi: ATTESTATION_ABI,
      functionName: 'getLatestAttestation',
      args: [workerAddress],
    });

    return result;
  } catch {
    return null;
  }
}
