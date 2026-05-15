/**
 * IncomeAttestation contract ABI & helpers.
 * Matches the deployed IncomeAttestation.sol on Base L2.
 *
 * Functions:
 *   createAttestation(score, monthlyAvgIncome, incomeVolatility,
 *                     tenureMonths, platformDiversity, reliabilityScore)
 *   revokeAttestation(attestationId)
 *   grantLenderAccess(lender, durationSeconds)
 *   revokeLenderAccess(lender)
 *   getLatestAttestation(worker)
 *   getWorkerAttestationIds(worker)
 *   hasAccess(worker, lender)
 */

export const INCOME_ATTESTATION_ABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'attestationCounter',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'createAttestation',
    inputs: [
      { name: 'score', type: 'uint256', internalType: 'uint256' },
      { name: 'monthlyAvgIncome', type: 'uint256', internalType: 'uint256' },
      { name: 'incomeVolatility', type: 'uint256', internalType: 'uint256' },
      { name: 'tenureMonths', type: 'uint256', internalType: 'uint256' },
      { name: 'platformDiversity', type: 'uint256', internalType: 'uint256' },
      { name: 'reliabilityScore', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeAttestation',
    inputs: [
      { name: 'attestationId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'grantLenderAccess',
    inputs: [
      { name: 'lender', type: 'address', internalType: 'address' },
      { name: 'durationSeconds', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeLenderAccess',
    inputs: [
      { name: 'lender', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getLatestAttestation',
    inputs: [
      { name: 'worker', type: 'address', internalType: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IncomeAttestation.Attestation',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'worker', type: 'address' },
          { name: 'score', type: 'uint256' },
          { name: 'monthlyAvgIncome', type: 'uint256' },
          { name: 'incomeVolatility', type: 'uint256' },
          { name: 'tenureMonths', type: 'uint256' },
          { name: 'platformDiversity', type: 'uint256' },
          { name: 'reliabilityScore', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWorkerAttestationIds',
    inputs: [
      { name: 'worker', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'uint256[]', internalType: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasAccess',
    inputs: [
      { name: 'worker', type: 'address', internalType: 'address' },
      { name: 'lender', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AttestationCreated',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'score', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AttestationRevoked',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PermissionGranted',
    inputs: [
      { name: 'worker', type: 'address', indexed: true },
      { name: 'lender', type: 'address', indexed: true },
      { name: 'expiresAt', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PermissionRevoked',
    inputs: [
      { name: 'worker', type: 'address', indexed: true },
      { name: 'lender', type: 'address', indexed: true },
    ],
    anonymous: false,
  },
] as const

/** Get the deployed contract address, with a safety check for the placeholder. */
export function getContractAddress(): `0x${string}` {
  const addr = process.env.NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS
  if (
    !addr ||
    addr === '0x0000000000000000000000000000000000000000' ||
    addr === ''
  ) {
    throw new Error(
      'NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS is not set or still the placeholder. Deploy the contract first.'
    )
  }
  return addr as `0x${string}`
}

/** Scale a Krost Score (300–850) to the contract's expected uint256 (×100). */
export function scaleScoreForContract(score: number): bigint {
  return BigInt(Math.min(850, Math.max(300, Math.round(score)))) * BigInt(100)
}

/** Convert USD amount to cents for the contract. */
export function toCents(amountUsd: number): bigint {
  return BigInt(Math.round(amountUsd * 100))
}

/** Scale income volatility (0–1 CV) to contract scale (0–10000, 4 decimals). */
export function scaleVolatilityForContract(cv: number): bigint {
  return BigInt(Math.min(10000, Math.max(0, Math.round(cv * 10000))))
}
