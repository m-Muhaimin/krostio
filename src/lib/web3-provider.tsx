'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { wagmiConfig } from './wagmi'

/**
 * WalletProvider — wraps the app with wagmi's WagmiProvider and React Query.
 *
 * Must be a client component since wagmi uses browser APIs (window.ethereum).
 * Place this high in the tree (root layout) so any page can use wagmi hooks.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 minute before refetch
            retry: 2,
          },
        },
      })
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
