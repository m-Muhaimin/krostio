import type { Metadata } from 'next'
import { ArticleShell, H2, P, UL } from '../_components/article-shell'

export const metadata: Metadata = {
  title: 'Your gig income is real. Here\'s why banks don\'t see it — and how to fix it.',
  description:
    'Traditional credit scores penalize gig workers for having irregular income. A new alternative credit scoring model based on actual platform earnings is changing that.',
  alternates: { canonical: '/learn/gig-workers-denied-loans' },
  openGraph: {
    title: 'Your gig income is real. Here\'s why banks don\'t see it.',
    description:
      'Traditional credit scores penalize gig workers for having irregular income. A new alternative credit scoring model based on actual platform earnings is changing that.',
    type: 'article',
    url: '/learn/gig-workers-denied-loans',
  },
}

export default function Page() {
  return (
    <ArticleShell
      eyebrow="Guide · Credit & loans"
      title={<>Your gig income is real. Here&rsquo;s why banks don&rsquo;t see it &mdash; and how to fix it.</>}
      readTime="10 min read · Updated May 2026"
      intro={
        <>
          Traditional credit scores penalize gig workers for having irregular
          income. A new alternative credit scoring model based on actual platform
          earnings is changing that. Here&rsquo;s how it works.
        </>
      }
    >
      <section>
        <H2>The Problem: You Earn $60K/Year But the Bank Sees Zero</H2>
        <P>
          Maria drives for Uber and DoorDash. She grosses about $5,000/month &mdash;
          sometimes more in summer, less in January. She&rsquo;s been doing this
          for two years, has great ratings, and a consistent earnings history
          by gig worker standards.
        </P>
        <P>
          When she applied for a $15,000 car loan last month, the bank said no.
        </P>
        <P>
          Not because she couldn&rsquo;t afford it. Because her
          &ldquo;income didn&rsquo;t verify.&rdquo;
        </P>
        <P>
          This isn&rsquo;t Maria&rsquo;s fault. The US credit system was built
          for W-2 employees with predictable paychecks. If you&rsquo;re a gig
          worker, the system doesn&rsquo;t know what to do with you.
        </P>

        <h3 className="mt-10 text-xl font-medium text-ink-black">By the Numbers</h3>
        <UL>
          <li><span className="text-ink-black">64 million</span> Americans participated in gig work in 2025 (Upwork/Freelancers Union)</li>
          <li><span className="text-ink-black">45%</span> of gig workers have been denied a loan or credit card</li>
          <li><span className="text-ink-black">78 million</span> Americans are &ldquo;credit invisible&rdquo; or have thin credit files (CFPB)</li>
          <li><span className="text-ink-black">Gig workers are 3&times; more likely</span> to be denied a mortgage than salaried employees with the same income</li>
        </UL>

        <H2>Why Traditional Credit Scores Don&rsquo;t Work for Gig Workers</H2>

        <h3 className="mt-10 text-xl font-medium text-ink-black">1. Income Verification Is Broken</h3>
        <P>
          When a lender needs to verify your income, they ask for pay stubs or
          W-2s. Gig workers don&rsquo;t have those. Bank statements help, but
          they show <em>all</em> your transactions &mdash; mixed with personal
          spending &mdash; making it hard for lenders to parse your actual
          earnings.
        </P>
        <P>
          Services like Argyle and Plaid can pull gig income data, but they only
          provide a <strong>point-in-time snapshot</strong>. A lender sees what
          you earned last month, not your six-month trend, your consistency
          score, or your multi-platform income diversification.
        </P>

        <h3 className="mt-10 text-xl font-medium text-ink-black">2. Thin Credit Files</h3>
        <P>
          Most gig workers are younger or newer to credit. They may have a single
          credit card or student loans. The traditional scoring models (FICO,
          VantageScore) need years of credit history to generate a meaningful score.
        </P>
        <P>
          Your two years of perfect Uber ratings and consistent DoorDash earnings?
          The credit bureaus don&rsquo;t see that data.
        </P>

        <h3 className="mt-10 text-xl font-medium text-ink-black">3. Irregular Income Flags as Risk</h3>
        <P>
          A 2024 study by the Consumer Financial Protection Bureau found that
          <strong> irregular income is treated as a risk indicator</strong> by
          most scoring models &mdash; even when the total annual income is equal
          to or higher than salaried peers.
        </P>
        <P>
          Gig workers with $60K+ annual earnings are classified higher risk than
          salaried workers earning $40K. The system conflates
          <em>payment irregularity</em> with <em>income unreliability</em>.
        </P>

        <H2>The Old Solutions (And Why They&rsquo;re Insufficient)</H2>
        <P>Gig workers have had limited options:</P>
        <UL>
          <li>
            <span className="text-ink-black">Credit-builder loans</span>
            (Self, Chime) &mdash; Help build FICO but require monthly payments,
            don&rsquo;t reflect income
          </li>
          <li>
            <span className="text-ink-black">Secured credit cards</span>
            &mdash; Same problem; cap at deposit amount
          </li>
          <li>
            <span className="text-ink-black">Manual underwriting</span>
            &mdash; Some credit unions do this, but it&rsquo;s slow, invasive, and rare
          </li>
          <li>
            <span className="text-ink-black">Co-signers</span>
            &mdash; Requires someone else&rsquo;s credit, which defeats the purpose
          </li>
        </UL>
        <P>
          None of these actually use your gig income as evidence of
          creditworthiness. They help you build credit <em>despite</em> your gig
          income, not <em>because</em> of it.
        </P>

        <H2>The New Approach: Income-Based Alternative Credit Scoring</H2>
        <P>
          A new category of credit scoring treats gig income as a first-class
          signal. Instead of asking &ldquo;How long have you had a credit
          card?&rdquo; it asks &ldquo;How consistently do you earn?&rdquo;
        </P>

        <h3 className="mt-10 text-xl font-medium text-ink-black">How It Works</h3>
        <UL>
          <li>
            <strong>Connect your platforms</strong> &mdash; Link your Uber, Lyft,
            DoorDash, Fiverr, Upwork, or Instacart accounts (read-only, with your
            consent)
          </li>
          <li>
            <strong>Income analysis</strong> &mdash; The system analyzes your
            earnings history across all platforms: monthly earnings average and
            trend, earnings consistency, platform diversity, and tenure
          </li>
          <li>
            <strong>Score generation</strong> &mdash; A 0&ndash;100 income consistency
            score is generated based on earnings data rather than debt repayment history
          </li>
          <li>
            <strong>Share with lenders</strong> &mdash; When you apply for a loan,
            the lender queries your score directly &mdash; you don&rsquo;t need to
            hand over bank statements
          </li>
        </UL>

        <h3 className="mt-10 text-xl font-medium text-ink-black">Key Signals Used</h3>
        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Signal</th>
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Weight</th>
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Why It Matters</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Income Stability</td>
                <td className="py-2 pr-4 text-slate">30%</td>
                <td className="py-2 pr-4 text-slate">How consistent are weekly earnings over 3+ months</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Average Monthly Income</td>
                <td className="py-2 pr-4 text-slate">25%</td>
                <td className="py-2 pr-4 text-slate">Raw earning power, normalized across platforms</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Platform Diversity</td>
                <td className="py-2 pr-4 text-slate">15%</td>
                <td className="py-2 pr-4 text-slate">Working multiple platforms = income resilience</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Earnings Trend</td>
                <td className="py-2 pr-4 text-slate">15%</td>
                <td className="py-2 pr-4 text-slate">Stable or growing trajectory vs declining</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Tenure</td>
                <td className="py-2 pr-4 text-slate">10%</td>
                <td className="py-2 pr-4 text-slate">How long in gig economy</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Platform Ratings</td>
                <td className="py-2 pr-4 text-slate">5%</td>
                <td className="py-2 pr-4 text-slate">Ratings from platforms as proxy for reliability</td>
              </tr>
            </tbody>
          </table>
        </div>

        <H2>The Decentralized Difference</H2>
        <P>
          The most important innovation: <strong>the score is owned by you, not a credit bureau.</strong>
        </P>
        <P>
          With Krostio, your income score is derived from your real earnings data, not
          debt repayment history. No company can revoke it. When you authorize a lender
          to see it, they receive a verifiable report with your complete income picture
          — sourced directly from your connected financial accounts.
        </P>
        <P>
          <strong>For workers:</strong> You build one portable income history
          that follows you across lenders, landlords, and financial apps.
        </P>
        <P>
          <strong>For lenders:</strong> You can now confidently serve the 76
          million Americans the current system ignores.
        </P>

        <H2>What This Means for You</H2>
        <P>If you&rsquo;re a gig worker who&rsquo;s been denied credit:</P>
        <UL>
          <li><strong>Your income counts</strong> &mdash; Alternative scoring models recognize gig earnings as real income</li>
          <li><strong>You own your data</strong> &mdash; On-chain scores mean you control access, not a bureau</li>
          <li><strong>One score, all platforms</strong> &mdash; No more re-verifying every time you apply</li>
          <li><strong>Privacy by default</strong> &mdash; Lenders see only what you authorize</li>
        </UL>

        <P>
          <strong>Ready to see your score?</strong>{' '}
          <a href="/check-score" className="link-editorial">Check your free Krostio Score &rarr;</a>
        </P>
      </section>
    </ArticleShell>
  )
}
