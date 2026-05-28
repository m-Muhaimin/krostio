import type { Metadata } from 'next'
import { ArticleShell, H2, P, UL } from '../_components/article-shell'

export const metadata: Metadata = {
  title: 'Why income volatility is the wrong proxy for gig-worker creditworthiness.',
  description:
    'Traditional credit models treat income variability as risk. For gig workers, this misreads a feature as a bug. Here\'s why stability metrics, not volatility penalties, should drive alternative scoring.',
  alternates: { canonical: '/learn/income-volatility-myth' },
  openGraph: {
    title: 'Why income volatility is the wrong proxy for creditworthiness.',
    description:
      'Traditional credit models treat income variability as risk. For gig workers, this misreads a feature as a bug. Here\'s why stability metrics, not volatility penalties, should drive alternative scoring.',
    type: 'article',
    url: '/learn/income-volatility-myth',
  },
}

export default function Page() {
  return (
    <ArticleShell
      eyebrow="Guide &middot; Scoring &amp; data science"
      title={<>Why income volatility is the wrong proxy for gig-worker creditworthiness.</>}
      readTime="9 min read &middot; Updated May 2026"
      intro={
        <>
          Traditional credit models treat income variability as risk. For gig
          workers, this misreads a feature as a bug. Here&rsquo;s why stability
          metrics, not volatility penalties, should drive alternative credit
          scoring &mdash; and how a new approach corrects the bias.
        </>
      }
    >
      <section>
        <H2>The Mistake at the Heart of Credit Scoring</H2>
        <P>
          Credit scoring models were designed in the 1980s for a workforce that
          no longer exists. FICO and VantageScore both assume a single-employer,
          W-2 model where monthly income is predictable within a small variance band.
        </P>
        <P>
          The problem: <strong>64 million American gig workers don&rsquo;t fit
          this model.</strong> And the scoring industry&rsquo;s response has been
          to penalize them for it.
        </P>
        <P>
          A 2024 Consumer Financial Protection Bureau study found that irregular
          income is systematically treated as a risk indicator by most scoring
          models &mdash; even when total annual income <strong>matches or
          exceeds</strong> salaried peers. The CFPB flagged this as a potential
          fair lending concern. The market is starting to agree.
        </P>

        <H2>The Volatility Fallacy: Three Blind Spots</H2>

        <h3 className="mt-10 text-xl font-medium text-ink-black">1. Variance is not unreliability</h3>
        <P>
          A DoorDash driver earning $700 one week and $1,100 the next has
          irregular income. But over 12 months, that driver might gross $48,000
          &mdash; the same as a salaried retail worker earning $4,000/month.
        </P>
        <P>
          The traditional scoring model penalizes the driver for the variance.
          But the right question isn&rsquo;t &ldquo;How much does this person
          earn month-to-month?&rdquo; &mdash; it&rsquo;s &ldquo;How much have
          they earned over the full period, and how reliably does that repeat?&rdquo;
        </P>
        <P>
          <strong>The fallacy:</strong> conflating <em>payment irregularity</em>
          (different amounts each week) with <em>income unreliability</em> (can&rsquo;t
          depend on this person to earn). These are different things.
        </P>

        <h3 className="mt-10 text-xl font-medium text-ink-black">2. Multi-platform income looks volatile only when viewed per-platform</h3>
        <P>
          This is the biggest blind spot. Most gig workers use 2&ndash;3 platforms.
          Uber demand drops in January; DoorDash picks up. Instacart is strong on
          weekends; Fiverr projects span weeks.
        </P>
        <P>
          Viewed individually, each platform looks volatile. Aggregated, the
          income stream is <strong>more stable than any single platform in
          isolation</strong>.
        </P>

        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Platform</th>
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Jan</th>
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Feb</th>
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Mar</th>
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Q1 Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Uber</td>
                <td className="py-2 pr-4 text-slate">$3,200</td>
                <td className="py-2 pr-4 text-slate">$2,100</td>
                <td className="py-2 pr-4 text-slate">$2,800</td>
                <td className="py-2 pr-4 text-slate">$8,100</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">DoorDash</td>
                <td className="py-2 pr-4 text-slate">$800</td>
                <td className="py-2 pr-4 text-slate">$1,900</td>
                <td className="py-2 pr-4 text-slate">$1,400</td>
                <td className="py-2 pr-4 text-slate">$4,100</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate"><strong>Combined</strong></td>
                <td className="py-2 pr-4 text-slate"><strong>$4,000</strong></td>
                <td className="py-2 pr-4 text-slate"><strong>$4,000</strong></td>
                <td className="py-2 pr-4 text-slate"><strong>$4,200</strong></td>
                <td className="py-2 pr-4 text-slate"><strong>$12,200</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <P>
          Traditional verification pulls one platform (often Uber) and sees a
          35% month-over-month drop in February. A multi-platform aggregator
          sees consistent $4,000/month with slight upward trend.
        </P>
        <P>
          The scoring industry penalizes the snapshot. The right approach rewards
          the full picture.
        </P>

        <h3 className="mt-10 text-xl font-medium text-ink-black">3. Income volatility is a different signal for gig workers</h3>
        <P>
          For salaried workers, income volatility signals instability: job loss,
          reduced hours, or economic distress. For gig workers, income volatility
          can signal <strong>optimization behavior</strong>:
        </P>
        <UL>
          <li>A driver who switches from Uber to DoorDash in winter isn&rsquo;t struggling &mdash; they&rsquo;re following demand</li>
          <li>A freelancer who takes a low-utilization month to upskill isn&rsquo;t declining &mdash; they&rsquo;re investing</li>
          <li>A multi-platform worker with a bad week on one app and a great week on another isn&rsquo;t unreliable &mdash; they&rsquo;re diversified</li>
        </UL>
        <P>
          The same statistical signal (variance in earnings) means something
          fundamentally different depending on the employment model. Traditional
          scoring treats both as the same risk factor. That&rsquo;s the fallacy.
        </P>

        <H2>What Alternative Scoring Gets Right</H2>
        <P>
          New income-based credit scoring models correct this by shifting from
          <strong>point-in-time snapshots</strong> to <strong>persistent,
          multi-dimensional profiles</strong>.
        </P>

        <h3 className="mt-10 text-xl font-medium text-ink-black">The Right Signals</h3>
        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Signal</th>
                <th className="text-left py-2 pr-4 font-medium text-ink-black">What It Measures</th>
                <th className="text-left py-2 pr-4 font-medium text-ink-black">Why It&rsquo;s Better Than Raw Volatility</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Income consistency rate</td>
                <td className="py-2 pr-4 text-slate">Percentage of months within 20% of the 12-month average</td>
                <td className="py-2 pr-4 text-slate">Rewards stability without penalizing seasonal variance</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Platform diversity index</td>
                <td className="py-2 pr-4 text-slate">Number of platforms with consistent earnings</td>
                <td className="py-2 pr-4 text-slate">Recognizes multi-platform income as resilience, not noise</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Earnings trajectory</td>
                <td className="py-2 pr-4 text-slate">Slope of 12-month earnings trend</td>
                <td className="py-2 pr-4 text-slate">Separates growing earners from declining ones</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Effective tenure</td>
                <td className="py-2 pr-4 text-slate">Total time with active earnings across all platforms</td>
                <td className="py-2 pr-4 text-slate">Rewards experience regardless of individual platform gaps</td>
              </tr>
              <tr className="border-b border-hairline/50">
                <td className="py-2 pr-4 text-slate">Recurrence rate</td>
                <td className="py-2 pr-4 text-slate">Percentage of weeks with &gt;$0 earnings</td>
                <td className="py-2 pr-4 text-slate">Measures reliability better than per-paycheck variance</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-10 text-xl font-medium text-ink-black">The Wrong Signals (That Most Models Still Use)</h3>
        <UL>
          <li><strong>Month-over-month variance</strong> alone (no normalization for seasonality or platform mix)</li>
          <li><strong>Single-platform earnings</strong> (ignoring aggregation benefit)</li>
          <li><strong>Raw bank statement deposits</strong> (mixes personal transfers with gig income, inflates noise)</li>
          <li><strong>Credit utilization ratio</strong> (measures debt behavior, not earning power)</li>
        </UL>

        <H2>The Lender&rsquo;s Perspective</H2>
        <P>
          We&rsquo;ve spoken with credit union underwriting teams piloting
          income-based scoring. The feedback is consistent:
        </P>
        <P>
          <span className="italic text-ink-black">
            &ldquo;We want to lend to gig workers. We know the demand is there.
            But when our only verification option is a bank statement or a Plaid
            pull of one platform, we&rsquo;re flying blind. We end up denying
            good borrowers to avoid the one bad one we can&rsquo;t detect.&rdquo;
          </span>
        </P>
        <P>
          The skepticism makes sense. When your only data point is a noisy,
          point-in-time earnings snapshot, the safe call is denial.
        </P>
        <P>
          Alternative credit scoring solves this by providing:
        </P>
        <UL>
          <li>Multi-platform, multi-month history &mdash; not a single-account snapshot</li>
          <li>Standardized scoring &mdash; same 300&ndash;850 scale lenders already use</li>
          <li>Cryptographic attestation &mdash; score is verifiable without revealing raw data</li>
          <li>Persistence &mdash; the score travels with the worker; no re-verification needed</li>
        </UL>

        <H2>What This Means for Workers</H2>
        <P>If you&rsquo;re a gig worker who&rsquo;s been told your income is &ldquo;too variable&rdquo; for credit:</P>
        <UL>
          <li><strong>Your income profile is likely stronger than any single-platform snapshot suggests.</strong> Connect multiple platforms to show the full picture.</li>
          <li><strong>Your tenure matters.</strong> Two years of gig earnings across multiple platforms signals more reliability than six months on one app.</li>
          <li><strong>Traditional scoring models penalize what they can&rsquo;t model.</strong> This is a statistical blind spot, not a judgment on your earning ability.</li>
        </UL>
        <P>
          The next generation of credit scoring is designed for how you actually
          earn &mdash; across platforms, through seasonal cycles, with the
          resilience that comes from income diversification.
        </P>

        <H2>The Bottom Line</H2>
        <P>
          Income volatility isn&rsquo;t a credit risk signal. It&rsquo;s a proxy
          that traditional scoring models use because they lack better data. For
          gig workers, this proxy is systematically wrong.
        </P>
        <P>
          <strong>See how your income stacks up.</strong>{' '}
          <a href="/check-score" className="link-editorial">Check your Krostio Score for free &rarr;</a>
        </P>
      </section>
    </ArticleShell>
  )
}
