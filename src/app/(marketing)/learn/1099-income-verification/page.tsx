import type { Metadata } from 'next'
import { ArticleShell, H2, P, UL } from '../_components/article-shell'

export const metadata: Metadata = {
  title: '1099 Income Verification for Car Loans',
  description:
    'How auto lenders verify income for 1099 contractors, freelancers, and gig workers — what they accept, what they reject, and how to get approved without a pay stub.',
  alternates: { canonical: '/learn/1099-income-verification' },
  openGraph: {
    title: '1099 Income Verification for Car Loans',
    description:
      'A practical guide to auto financing when you don\'t have a W-2 — including which documents lenders will accept and how to get approved at the rate you deserve.',
    type: 'article',
    url: '/learn/1099-income-verification',
  },
}

export default function Page() {
  return (
    <ArticleShell
      eyebrow="Guide · Auto loans"
      title={<>1099 income verification for car loans.</>}
      readTime="8 min read · Updated May 2026"
      intro={
        <>
          Walking into a dealership without a pay stub is its own special kind of anxiety. The
          finance manager asks &ldquo;where do you work?&rdquo; and the honest answer — &ldquo;I
          freelance,&rdquo; or &ldquo;I drive for a few apps&rdquo; — sets off a documentation cascade
          that most buyers are not prepared for. This guide is the prep.
        </>
      }
    >
      <section>
        <H2>How auto lenders think about 1099 income</H2>
        <P>
          Captive auto lenders (Ford Credit, Toyota Financial, GM Financial) and bank auto-loan desks
          underwrite differently than mortgage lenders, but they share the same instinct: W-2 income
          is &ldquo;known&rdquo; and 1099 income is &ldquo;unknown&rdquo; until proven otherwise.
          Their pricing models reflect that — most lenders apply a 10–25 basis-point rate premium to
          self-employed borrowers, and some apply a 20–30% haircut to stated income.
        </P>
        <P>
          The good news: car loans are smaller, shorter, and better collateralized than mortgages, so
          the documentation bar is significantly lower. Most lenders will close a car loan for a
          self-employed borrower with one year of tax returns plus current-year bank statements.
        </P>
      </section>

      <section>
        <H2>The documents that work</H2>
        <UL>
          <li>
            <span className="text-ink-black">Most recent year&rsquo;s 1040 + Schedule C.</span> If you
            file jointly, both pages 1 and 2 of the 1040. This is the single most important document.
          </li>
          <li>
            <span className="text-ink-black">All 1099-NEC and 1099-K forms.</span> One per platform
            you earned from. Subprime and near-prime lenders often accept the 1099s alone for amounts
            under $25,000.
          </li>
          <li>
            <span className="text-ink-black">Two to three months of bank statements.</span> The full
            PDF from your bank, not a screenshot of the app. Lenders are looking for consistent
            deposits matching your stated income.
          </li>
          <li>
            <span className="text-ink-black">Year-to-date earnings summary.</span> From each platform
            (Uber, DoorDash, Upwork, Fiverr, etc.). Some lenders accept these as the primary income
            document for amounts under $15,000.
          </li>
          <li>
            <span className="text-ink-black">A signed verification report.</span> A consolidated
            document covering all your income sources is increasingly accepted by credit unions and
            modern fintech lenders — it is the cleanest possible file you can hand them.
          </li>
        </UL>
      </section>

      <section>
        <H2>Documents that don&rsquo;t work (no matter what you read online)</H2>
        <UL>
          <li>
            Screenshots of your Uber app or your bank balance. Every lender rejects these. They are
            trivially editable.
          </li>
          <li>
            Venmo, Cash App, or Zelle transaction histories without a corresponding bank deposit.
            Lenders treat peer-to-peer transfers as unverifiable.
          </li>
          <li>
            A letter from yourself attesting to your income. This is occasionally suggested on forums.
            It carries zero weight.
          </li>
          <li>
            Old tax returns from a job you no longer have. Lenders want current-year evidence the
            income still exists.
          </li>
        </UL>
      </section>

      <section>
        <H2>The DTI question</H2>
        <P>
          Auto lenders care about debt-to-income ratio, but they calculate it differently than
          mortgage lenders. Most use a payment-to-income (PTI) ratio — the monthly car payment divided
          by gross monthly income — and they want it under 15–20%. They also look at total DTI,
          ideally under 45–50% including the new car payment.
        </P>
        <P>
          For 1099 borrowers, the income side of the ratio is the trick. A lender will typically use
          a 12- or 24-month average of net (post-deduction) Schedule C income, divided by 12. If you
          aggressively deducted business expenses last year, your qualifying monthly income for the
          car loan is going to look thin even if your bank account looks healthy.
        </P>
      </section>

      <section>
        <H2>How to get approved at a fair rate</H2>
        <UL>
          <li>
            <span className="text-ink-black">Pre-qualify before you go to the dealer.</span> Apply
            with two or three lenders — a credit union, a bank, and a fintech (LightStream, Carvana,
            Capital One Auto) — within a 14-day window. The credit-score impact of multiple inquiries
            in that window is treated as a single inquiry.
          </li>
          <li>
            <span className="text-ink-black">Put 15–20% down if you can.</span> Down payment is the
            single most powerful lever to reduce both the rate and the documentation scrutiny.
          </li>
          <li>
            <span className="text-ink-black">Bring a consolidated income story.</span> One folder,
            one report, all income streams visible. Confused underwriters reject; clear underwriters
            approve.
          </li>
          <li>
            <span className="text-ink-black">Avoid the dealer&rsquo;s in-house finance department for
            shopping rates.</span> Use them only to match a pre-approved offer.
          </li>
        </UL>
      </section>

      <section>
        <H2>The Krostio approach</H2>
        <P>
          Krostio builds the consolidated income story for you. We link directly to your gig platforms,
          pull 12–24 months of earnings, and produce a single signed PDF and shareable link that
          shows total income, platform-by-platform breakdown, deposit consistency, and tenure. An
          income consistency score (0–100) summarizes the whole thing at a glance.
        </P>
        <P>
          For a $25,000 car loan, the difference between a sloppy file and a clean one is often two
          percentage points of interest rate — about $1,400 over the life of a five-year loan. That
          is real money for ten minutes of preparation.
        </P>
      </section>
    </ArticleShell>
  )
}
