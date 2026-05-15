import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

/**
 * wagmi v2 configuration for Krost.
 * Supports Base L2 (production) and Base Sepolia (development/test).
 * Uses injected connector (MetaMask, Coinbase Wallet, etc.).
 *
 * SSR is enabled for Next.js compatibility.
 */
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [base.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL ?? 'https://mainnet.base.org'
    ),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
