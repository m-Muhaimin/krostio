import type { MetadataRoute } from 'next'
import { createServiceSupabaseClient } from '@/lib/supabase-service'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://krostio.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPaths: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/lenders', priority: 0.9, changeFrequency: 'daily' },
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

  const entries: MetadataRoute.Sitemap = staticPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  // Dynamic lender slugs
  try {
    const service = createServiceSupabaseClient()
    const { data } = await service
      .from('lender_profiles')
      .select('slug, updated_at')
      .eq('active', true)
    for (const row of (data ?? []) as Array<{ slug: string; updated_at: string }>) {
      entries.push({
        url: `${SITE_URL}/lenders/${row.slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    // Sitemap should not fail the build if DB is unreachable
  }

  return entries
}
