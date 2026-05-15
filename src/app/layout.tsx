import type { Metadata } from 'next'
import './globals.css'
import { AnalyticsProvider } from '@/lib/analytics-provider'
import { WalletProvider } from '@/lib/web3-provider'
import { SpeedInsights } from "@vercel/speed-insights/next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://krostio.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Krost — Income verification for the gig economy',
    template: '%s | Krost',
  },
  description:
    'Income verification for gig workers and freelancers. Connect your platforms, get a 0–100 income consistency score, and share a lender-ready report. You own your data.',
  applicationName: 'Krost',
  keywords: [
    'income verification',
    'gig worker income',
    'DoorDash income proof',
    'Uber mortgage',
    '1099 income verification',
    'Instacart shopper income',
    'self-employed income verification',
    'freelancer income proof',
  ],
  openGraph: {
    title: 'Krost — Income verification for the gig economy',
    description:
      'Turn multi-platform earnings into a verified income report lenders trust. Built for the 76 million Americans in the gig economy.',
    type: 'website',
    siteName: 'Krost',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Krost — Income verification for the gig economy',
    description:
      'Turn multi-platform earnings into a verified income report lenders trust.',
    creator: '@krostapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <AnalyticsProvider>
          <WalletProvider>{children}</WalletProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}
