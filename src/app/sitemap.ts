import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://krostio.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPaths: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/learn', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/learn/doordash-income-proof', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/learn/uber-mortgage', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/learn/1099-income-verification', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/learn/gig-worker-credit', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/learn/instacart-shopper-income', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/register', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/login', priority: 0.4, changeFrequency: 'monthly' },
  ]

  return staticPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
