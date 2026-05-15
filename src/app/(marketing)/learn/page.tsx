import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Learn — Guides for gig workers, freelancers, and 1099 contractors',
  description:
    'Practical guides on proving gig income for mortgages, car loans, rentals, and credit. Written for DoorDash drivers, Uber drivers, Instacart shoppers, and 1099 contractors.',
  alternates: { canonical: '/learn' },
  openGraph: {
    title: 'Learn — Krost guides for gig workers',
    description:
      'Practical guides on proving income when you don\'t get a W-2. From DoorDash to Uber to Instacart, written for the 76 million Americans in the gig economy.',
    type: 'website',
    url: '/learn',
  },
}

type Article = {
  href: string
  eyebrow: string
  title: string
  excerpt: string
  readTime: string
}

const articles: Article[] = [
  {
    href: '/learn/doordash-income-proof',
    eyebrow: 'DoorDash',
    title: 'How to prove income as a DoorDash driver.',
    excerpt:
      'A practical guide for Dashers on proving income to landlords, lenders, and underwriters — what counts as proof, what doesn\'t, and how to put a verified report in their hands.',
    readTime: '9 min read',
  },
  {
    href: '/learn/uber-mortgage',
    eyebrow: 'Uber',
    title: 'Can Uber drivers get a mortgage in 2026?',
    excerpt:
      'Yes — but the documentation rules are different from W-2 buyers. A clear-eyed walkthrough of conventional, FHA, and non-QM paths, plus the qualifying-income trap that catches most rideshare applicants.',
    readTime: '10 min read',
  },
  {
    href: '/learn/1099-income-verification',
    eyebrow: 'Auto loans',
    title: '1099 income verification for car loans.',
    excerpt:
      'How auto lenders verify income for 1099 contractors, freelancers, and gig workers — which documents work, which don\'t, and how to walk into a dealership prepared.',
    readTime: '8 min read',
  },
  {
    href: '/learn/gig-worker-credit',
    eyebrow: 'The gig economy',
    title: 'Why gig workers get denied credit (and how to fix it).',
    excerpt:
      'The structural reasons the gig economy is underbanked — and the practical, sequenced steps that change the outcome. With 76 million Americans now working gig jobs, this is the long-form essay on what to do about it.',
    readTime: '11 min read',
  },
  {
    href: '/learn/instacart-shopper-income',
    eyebrow: 'Instacart',
    title: 'Instacart shopper income verification guide.',
    excerpt:
      'A full guide for Instacart full-service shoppers on documenting income for landlords, lenders, and underwriters — the documents that work, the pitfalls to avoid, and what to do about mileage deductions.',
    readTime: '9 min read',
  },
  {
    href: '/learn/gig-workers-denied-loans',
    eyebrow: 'Credit & loans',
    title: 'Your gig income is real. Here\'s why banks don\'t see it.',
    excerpt:
      'Traditional credit scores penalize gig workers. A new model based on actual platform earnings is changing that.',
    readTime: '10 min read',
  },
  {
    href: '/learn/income-verification-fails',
    eyebrow: 'For lenders',
    title: 'Why traditional income verification fails gig workers.',
    excerpt:
      '64M gig workers earn $1T+ annually. Most lenders can\'t serve them. Here\'s the fix — and the $1T opportunity.',
    readTime: '8 min read',
  },
  {
    href: '/learn/income-volatility-myth',
    eyebrow: 'Scoring',
    title: 'Why income volatility is the wrong proxy for creditworthiness.',
    excerpt:
      'Credit models treat income variability as risk. For gig workers, this misreads a feature as a bug.',
    readTime: '9 min read',
  },
]

export default function LearnIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <header className="border-b border-hairline pb-12">
        <p className="text-mono-label text-slate">
          <span className="eyebrow-dot" />
          Krost Learn
        </p>
        <h1 className="text-display-hero mt-6 max-w-4xl">
          Field guides for the 76 million Americans who don&rsquo;t get a W-2.
        </h1>
        <p className="mt-8 max-w-2xl text-body-lg text-slate">
          Practical, non-fluffy writing on proving gig income for mortgages, car loans, rentals, and
          credit. Written by people who&rsquo;ve read the Fannie Mae Selling Guide so you don&rsquo;t
          have to.
        </p>
      </header>

      <ul className="mt-12 divide-y divide-hairline">
        {articles.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group grid gap-6 py-10 transition md:grid-cols-[160px_1fr_auto] md:items-baseline"
            >
              <span className="chip-coral-outline w-fit">{a.eyebrow}</span>
              <div>
                <h2 className="font-display text-[28px] leading-tight tracking-tight text-ink-black transition group-hover:text-coral">
                  {a.title}
                </h2>
                <p className="mt-3 max-w-2xl text-body text-slate">{a.excerpt}</p>
                <p className="mt-4 text-mono-label text-slate">{a.readTime}</p>
              </div>
              <span className="link-editorial whitespace-nowrap text-sm">Read →</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-20 card-stone">
        <p className="text-mono-label text-slate">Get started</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink-black">
          Turn your gig income into a verified report.
        </h2>
        <p className="mt-4 max-w-xl text-body text-slate">
          Connect your platforms, get a 0–100 income consistency score, and share a lender-ready
          report. Three minutes. No credit card.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link href="/register" className="btn-primary">
            Get started free
          </Link>
          <Link href="/pricing" className="link-editorial text-sm">
            See pricing →
          </Link>
        </div>
      </section>
    </div>
  )
}
