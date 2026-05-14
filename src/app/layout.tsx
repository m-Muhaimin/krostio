import type { Metadata } from 'next'
import './globals.css'
import { AnalyticsProvider } from '@/lib/analytics-provider'

export const metadata: Metadata = {
  title: 'Krost — Turn Your Gig Income Into Credit',
  description:
    'Alternative credit scoring for gig workers. Connect your platforms, get a verifiable credit score, and share it with lenders — you own your data.',
  openGraph: {
    title: 'Krost',
    description:
      'Your gig income is real. We make lenders see it. Decentralized credit scoring for the 60M Americans banks ignore.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Krost' }],
    type: 'website',
    siteName: 'Krost',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Krost',
    description: 'Decentralized credit scoring for gig workers.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-ink antialiased">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  )
}
