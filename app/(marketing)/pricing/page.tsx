'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, HelpCircle, ChevronDown } from 'lucide-react';

/* ── Tier data ── */
const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mo',
    tagline: 'Get started with the basics',
    features: [
      '1 platform connection',
      'Summary-only earnings view',
      'Basic Krost Score preview',
      'Community support',
    ],
    disabled: ['PDF reports', 'Shareable verification links', 'Passport minting', 'Priority support'],
    cta: 'Get started free',
    href: '/register?ref=pricing-free',
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9',
    period: '/mo',
    tagline: 'For gig workers building their financial profile',
    popular: true,
    features: [
      '1 platform connection',
      '1 PDF report per month',
      '12-month earnings history',
      '7-day shareable verification links',
      'Full Krost Score & tracking',
      'Email support',
    ],
    cta: 'Start free trial',
    href: '/register?ref=pricing-starter',
    highlighted: true,
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    price: '$19',
    period: '/mo',
    tagline: 'For serious multi-platform earners',
    features: [
      'Up to 5 platform connections',
      'Unlimited PDF reports',
      '24-month earnings history',
      '30-day shareable verification links',
      'Krost Passport minting (on-chain)',
      'Priority email support',
    ],
    cta: 'Start free trial',
    href: '/register?ref=pricing-pro',
    highlighted: false,
  },
  {
    id: 'pro-annual',
    name: 'Pro Annual',
    price: '$190',
    period: '/yr',
    tagline: 'Best value — save 2 months vs. monthly',
    badge: 'Best value',
    saveText: 'Save $38',
    features: [
      'Everything in Pro Monthly',
      '2 months free ($38 savings)',
      'Priority support — 4hr response',
      'Early access to new features',
    ],
    cta: 'Start free trial',
    href: '/register?ref=pricing-annual',
    highlighted: false,
  },
];

/* ── Comparison features ── */
const COMPARISON_ROWS = [
  { label: 'Platform connections', free: '1', starter: '1', pro: 'Up to 5', annual: 'Up to 5' },
  { label: 'Earnings summary', free: '✓', starter: '✓', pro: '✓', annual: '✓' },
  { label: 'Krost Score', free: 'Preview', starter: 'Full', pro: 'Full', annual: 'Full' },
  { label: 'PDF reports', free: '—', starter: '1/mo', pro: 'Unlimited', annual: 'Unlimited' },
  { label: 'Earnings history', free: '—', starter: '12 months', pro: '24 months', annual: '24 months' },
  { label: 'Shareable links', free: '—', starter: '7 days', pro: '30 days', annual: '30 days' },
  { label: 'Krost Passport minting', free: '—', starter: '—', pro: '✓', annual: '✓' },
  { label: 'On-chain attestation', free: '—', starter: '—', pro: '✓', annual: '✓' },
  { label: 'Priority support', free: '—', starter: 'Email', pro: 'Priority email', annual: '4hr response' },
];

/* ── FAQ data ── */
const FAQ_ITEMS = [
  {
    q: 'Can I change plans later?',
    a: 'Yes — you can upgrade or downgrade at any time. If you upgrade mid-cycle, the difference is prorated. Downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'What platforms do you support?',
    a: 'Krostio currently connects to Uber, Lyft, DoorDash, Instacart, Upwork, Fiverr, Amazon Flex, and 200+ more platforms. We add new platforms regularly based on user requests.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. Krostio uses bank-level encryption (AES-256) for all data in transit and at rest. We never store your platform passwords — we use secure OAuth connections. Our infrastructure is built on Supabase and hosted on AWS.',
  },
  {
    q: 'What is the Krost Passport?',
    a: 'The Krost Passport is a soul-bound (non-transferable) NFT minted on Base L2 that cryptographically attests to your financial identity. It contains no personal data — only a hash reference that verifiers can check on-chain.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day money-back guarantee on all paid plans. If Krostio is not the right fit, contact us and we will process your refund within 5 business days.',
  },
  {
    q: 'Can I use Krostio for my business?',
    a: 'Krostio is built for individual gig workers. If you are a lender, property manager, or enterprise looking to integrate Krostio Verifier into your workflow, reach out at enterprises@krostio.com.',
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-mono-label text-ink/40 mb-5 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" />
            Pricing
          </p>
          <h1 className="font-display text-[clamp(36px,7vw,68px)] font-medium tracking-tight leading-[1.02]">
            Simple, transparent pricing
          </h1>
          <p className="text-body-lg text-ink/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            Start free, upgrade when you need more. All plans include a 14-day
            money-back guarantee — no questions asked.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col card-cohere p-6 md:p-8 transition-all duration-300 ${
                tier.highlighted
                  ? 'border-ink ring-1 ring-ink/10 shadow-md'
                  : 'hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {/* Badge */}
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 rounded-cohere-full bg-coral text-white text-[11px] font-semibold tracking-wide uppercase">
                  Most popular
                </span>
              )}
              {tier.badge && !tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 rounded-cohere-full bg-brand-black text-white text-[11px] font-semibold tracking-wide uppercase">
                  {tier.badge}
                </span>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="font-display text-lg font-medium tracking-tight text-ink">
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-[clamp(32px,4vw,40px)] font-medium tracking-tight text-ink">
                    {tier.price}
                  </span>
                  <span className="text-caption text-ink/40">{tier.period}</span>
                </div>
                {tier.saveText && (
                  <span className="inline-block mt-1 text-coral text-sm font-medium">
                    {tier.saveText}
                  </span>
                )}
                <p className="text-caption text-ink/50 mt-2">{tier.tagline}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
                    <Check className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={tier.href}
                className={`w-full justify-center text-[14px] !py-3 ${
                  tier.highlighted ? 'btn-primary' : 'btn-pill-outline'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Toggle comparison link */}
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            {showComparison ? 'Hide' : 'View'} full feature comparison
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showComparison ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* ── Comparison table ── */}
        {showComparison && (
          <div className="mt-8 overflow-x-auto animate-in fade-in duration-300">
            <div className="card-cohere p-0 min-w-[640px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left px-6 py-4 font-medium text-ink/50 text-mono-label">
                      Feature
                    </th>
                    <th className="px-4 py-4 font-medium text-ink text-center">Free</th>
                    <th className="px-4 py-4 font-medium text-ink text-center bg-ink/5">Starter</th>
                    <th className="px-4 py-4 font-medium text-ink text-center">Pro</th>
                    <th className="px-4 py-4 font-medium text-ink text-center bg-ink/5">Pro Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-hairline/50 transition-colors hover:bg-ink/[0.02] ${
                        i % 2 === 0 ? 'bg-white' : 'bg-ink/[0.02]'
                      }`}
                    >
                      <td className="px-6 py-3.5 text-ink/70 font-medium">{row.label}</td>
                      <td className="px-4 py-3.5 text-ink/60 text-center text-sm">{row.free}</td>
                      <td className="px-4 py-3.5 text-ink text-center text-sm font-medium bg-ink/5">
                        {row.starter}
                      </td>
                      <td className="px-4 py-3.5 text-ink/60 text-center text-sm">{row.pro}</td>
                      <td className="px-4 py-3.5 text-ink text-center text-sm font-medium bg-ink/5">
                        {row.annual}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── FAQ ── */}
      <section className="bg-soft-stone py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-mono-label text-ink/30 mb-3">FAQ</p>
              <h2 className="font-display text-[clamp(28px,5vw,40px)] font-medium tracking-tight leading-[1.05]">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="card-cohere p-0 overflow-hidden transition-shadow duration-200 hover:shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                    >
                      <span className="font-display text-base font-medium tracking-tight text-ink pr-4">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-ink/40 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-200 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-5 pt-0">
                          <p className="text-body text-ink/60 leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="bg-brand-black text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-mono-label text-white/40 mb-4">GET STARTED</p>
          <h2 className="font-display text-[clamp(28px,5vw,48px)] font-medium tracking-tight leading-[1.05]">
            Ready to turn your gig earnings into a financial identity?
          </h2>
          <p className="text-body-lg text-white/60 mt-5 max-w-lg mx-auto">
            Join thousands of gig workers building their financial future. Start
            free, upgrade when you need more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            <Link
              href="/register?ref=pricing-cta"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-black px-8 py-4 rounded-cohere-pill font-medium text-[15px] transition-all hover:opacity-90"
            >
              Start building your score
            </Link>
            <Link
              href="/check-score"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/30 px-8 py-4 rounded-cohere-pill font-medium text-[15px] transition-all hover:bg-white/10"
            >
              Check your score free
            </Link>
          </div>
          <p className="text-micro text-white/30 mt-6">
            No credit check. No commitment. Free to start.
          </p>
        </div>
      </section>
    </div>
  );
}
