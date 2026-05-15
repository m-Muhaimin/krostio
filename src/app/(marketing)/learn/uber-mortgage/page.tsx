import type { Metadata } from 'next'
import { ArticleShell, H2, P, UL } from '../_components/article-shell'

export const metadata: Metadata = {
  title: 'Can Uber Drivers Get a Mortgage in 2026?',
  description:
    'Yes — Uber drivers can qualify for conventional and FHA mortgages in 2026, but the documentation rules are different from W-2 buyers. Here is exactly what lenders need and how to assemble it.',
  alternates: { canonical: '/learn/uber-mortgage' },
  openGraph: {
    title: 'Can Uber Drivers Get a Mortgage in 2026?',
    description:
      'A clear-eyed guide to mortgage approval for Uber drivers — what underwriters require, what trips them up, and how to put together an application that actually closes.',
    type: 'article',
    url: '/learn/uber-mortgage',
  },
}

export default function Page() {
  return (
    <ArticleShell
      eyebrow="Guide · Uber"
      title={<>Can Uber drivers get a mortgage in 2026?</>}
      readTime="10 min read · Updated May 2026"
      intro={
        <>
          Short answer: yes. Long answer: the path is narrower than it is for a W-2 buyer, the
          documentation burden is roughly three times heavier, and the difference between approved and
          denied usually comes down to how cleanly you can show two years of stable self-employment
          income. Here is the full picture.
        </>
      }
    >
      <section>
        <H2>What lenders actually require from a rideshare driver</H2>
        <P>
          For conventional loans backed by Fannie Mae or Freddie Mac, and for FHA-insured loans, the
          baseline rule for self-employed borrowers is the same: <strong>two years of tax returns
          showing consistent or growing income.</strong> Both Fannie Mae&rsquo;s Selling Guide and
          HUD&rsquo;s 4000.1 handbook spell this out explicitly. Uber driving is treated as
          self-employment.
        </P>
        <P>The standard package an underwriter will ask for:</P>
        <UL>
          <li>Two full years of personal federal tax returns, including Schedule C.</li>
          <li>Two years of 1099-K and 1099-NEC forms from Uber (Rasier-LLC).</li>
          <li>A year-to-date profit-and-loss statement, ideally CPA-prepared.</li>
          <li>Two to three months of bank statements showing the Uber deposits.</li>
          <li>A business license or DBA, if your state issues one for rideshare.</li>
        </UL>
        <P>
          If you have been driving for less than two years, you are generally not eligible for
          conventional or FHA financing — but there are exceptions for borrowers transitioning from a
          W-2 job in a related field, and portfolio lenders may consider 12 months of history with
          compensating factors (larger down payment, strong reserves, lower debt ratios).
        </P>
      </section>

      <section>
        <H2>The qualifying-income trap</H2>
        <P>
          The single most painful surprise for rideshare drivers applying for a mortgage is the gap
          between <em>gross earnings</em> and <em>qualifying income</em>. An underwriter does not care
          what Uber paid you. They care what you reported on Schedule C after deducting business
          expenses — specifically mileage, vehicle costs, phone, tolls, and platform fees.
        </P>
        <P>
          The mileage deduction in particular wrecks people. The standard mileage rate for 2025 is 70
          cents per mile, and a full-time Uber driver easily logs 40,000+ business miles a year. That
          is a $28,000+ deduction. If you reported $65,000 in Uber earnings and took the full mileage
          deduction, your qualifying income for a mortgage is closer to $37,000, not $65,000.
        </P>
        <P>
          The implication: if you know you are buying a home in the next two years, talk to a CPA
          about how aggressively to take deductions. Maximizing the tax write-off minimizes your
          borrowing power. Most rideshare drivers don&rsquo;t learn this until the loan officer
          delivers the bad news.
        </P>
      </section>

      <section>
        <H2>Conventional vs. FHA vs. non-QM</H2>
        <UL>
          <li>
            <span className="text-ink-black">Conventional (Fannie/Freddie).</span> Best rates, lowest
            mortgage insurance. Requires 620+ credit, full two-year self-employment history, and a
            debt-to-income ratio under 50%. Down payments start at 3% for first-time buyers.
          </li>
          <li>
            <span className="text-ink-black">FHA.</span> More forgiving on credit (580+) and DTI, but
            mortgage insurance is permanent unless you put 10%+ down. Still requires the two-year
            history. Loan limits vary by county.
          </li>
          <li>
            <span className="text-ink-black">Non-QM / bank statement loans.</span> Designed for
            self-employed borrowers. Some accept 12–24 months of bank statements in lieu of tax
            returns. Interest rates run 1–2.5 percentage points higher and down payments often start
            at 10–15%. Useful if your taxable income is too low after deductions.
          </li>
        </UL>
      </section>

      <section>
        <H2>How to strengthen your application</H2>
        <P>
          Beyond the documents, three factors disproportionately move the needle for rideshare
          applicants:
        </P>
        <UL>
          <li>
            <span className="text-ink-black">Reserves.</span> Lenders want to see three to six months
            of mortgage payments sitting in a bank account after closing. Gig income variability is
            forgiven when reserves are strong.
          </li>
          <li>
            <span className="text-ink-black">Multiple income streams.</span> If you drive for Uber and
            Lyft and DoorDash, document all three. Platform diversity reads as stability, not as
            chaos, as long as you can show it cleanly.
          </li>
          <li>
            <span className="text-ink-black">A clean income verification report.</span> Underwriters
            often spend 30–60 minutes assembling a self-employed file. Walking in with a pre-built
            income consistency report measurably shortens approval time and reduces the number of
            &ldquo;conditional approval&rdquo; back-and-forth requests.
          </li>
        </UL>
      </section>

      <section>
        <H2>Where Krost fits in</H2>
        <P>
          Krost was built for this exact problem. We connect to Uber, Lyft, DoorDash, Instacart, and
          your bank, then produce a single signed verification report covering up to 24 months of
          earnings — with stability, diversity, tenure, and trajectory broken out the way underwriters
          read them.
        </P>
        <P>
          That report does not replace your tax returns (no document can). It does mean the
          underwriter spends ten minutes verifying your file instead of an hour reconstructing it from
          screenshots — and that is the difference between &ldquo;conditional approval pending further
          documentation&rdquo; and a clean clear-to-close.
        </P>
        <P>
          With 76 million gig workers in the U.S. and average freelancer income around $108,028,
          rideshare drivers are no longer a niche borrower category. The lenders that figure this out
          first will get the best of these customers. Until they all do, your job is to make your file
          impossible to deny.
        </P>
      </section>
    </ArticleShell>
  )
}
