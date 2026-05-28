import type { Metadata } from 'next'
import { ArticleShell, H2, P, UL } from '../_components/article-shell'

export const metadata: Metadata = {
  title: 'Instacart Shopper Income Verification Guide',
  description:
    'A complete guide for full-service Instacart shoppers on documenting income for landlords, lenders, and underwriters in 2026 — and avoiding the most common mistakes.',
  alternates: { canonical: '/learn/instacart-shopper-income' },
  openGraph: {
    title: 'Instacart Shopper Income Verification Guide',
    description:
      'How to prove your earnings as an Instacart full-service shopper — what platforms provide, what underwriters need, and how to bridge the gap.',
    type: 'article',
    url: '/learn/instacart-shopper-income',
  },
}

export default function Page() {
  return (
    <ArticleShell
      eyebrow="Guide · Instacart"
      title={<>Instacart shopper income verification guide.</>}
      readTime="9 min read · Updated May 2026"
      intro={
        <>
          Full-service Instacart shoppers are independent contractors paid via batch — base pay, tips,
          and the occasional bonus, deposited weekly. From the outside it looks like a job. From an
          underwriter&rsquo;s perspective, it looks like a one-person small business with no
          accounting department. This guide bridges those two worlds.
        </>
      }
    >
      <section>
        <H2>The income document Instacart actually provides</H2>
        <P>
          Inside the Instacart Shopper app and at shoppers.instacart.com, you have access to a few
          documents, and you should know exactly what each one is and isn&rsquo;t:
        </P>
        <UL>
          <li>
            <span className="text-ink-black">Weekly batch summary.</span> Shows each batch you
            completed, base pay, tips, and any promotional incentives. Useful for personal accounting;
            not accepted as standalone proof by any major lender.
          </li>
          <li>
            <span className="text-ink-black">Earnings dashboard.</span> Shows lifetime, year-to-date,
            and last-30-days earnings. Can be exported as a screenshot; some smaller lenders and most
            landlords will accept it as a supporting document.
          </li>
          <li>
            <span className="text-ink-black">1099-NEC.</span> Issued in January by Stripe on behalf of
            Maplebear Inc. (Instacart&rsquo;s legal entity) if you earned more than $600 in the prior
            year. This is the closest thing to an annual W-2 you will get.
          </li>
        </UL>
        <P>
          Note that Instacart does <em>not</em> issue traditional pay stubs and does not respond to
          third-party verification-of-employment (VOE) requests in the way an employer would. Calling
          Instacart and asking them to verify your income for a lender will not work.
        </P>
      </section>

      <section>
        <H2>Distinguishing in-store vs. full-service shoppers</H2>
        <P>
          Instacart used to operate two worker classifications: in-store shoppers (W-2 part-time
          employees, paid hourly, with pay stubs) and full-service shoppers (1099 independent
          contractors, paid per batch). In 2023, Instacart announced the wind-down of the in-store
          shopper program in most markets. If you are an active shopper today, you are almost
          certainly a full-service shopper — meaning your verification path is the 1099 path described
          below.
        </P>
      </section>

      <section>
        <H2>The full verification package</H2>
        <UL>
          <li>
            <span className="text-ink-black">Most recent year&rsquo;s tax return.</span> 1040 +
            Schedule C. For mortgages, two years.
          </li>
          <li>
            <span className="text-ink-black">1099-NEC from Maplebear/Stripe.</span> For each year you
            shopped.
          </li>
          <li>
            <span className="text-ink-black">Year-to-date earnings summary from the Instacart
            Shopper app.</span> Exported as a PDF.
          </li>
          <li>
            <span className="text-ink-black">Three months of bank statements.</span> Showing the
            weekly Instacart deposits, ideally consistent.
          </li>
          <li>
            <span className="text-ink-black">A consolidated income verification report.</span> If you
            also shop for Shipt, drive for Uber/Lyft, or do any other gig work, one consolidated
            report is dramatically more persuasive than three separate dashboards.
          </li>
        </UL>
      </section>

      <section>
        <H2>The common pitfalls (and how to avoid them)</H2>
        <UL>
          <li>
            <span className="text-ink-black">Mixing personal and business deposits.</span> If your
            Instacart deposits land in the same account where you receive Venmo from friends and
            Zelle from family, an underwriter has to separate the wheat from the chaff. Most just
            haircut your stated income. Open a dedicated checking account for gig deposits.
          </li>
          <li>
            <span className="text-ink-black">Aggressive mileage deductions.</span> Instacart shoppers
            drive a lot — to the store, around the store, to the delivery, home. The mileage adds up
            and the deduction is real, but it directly reduces your reported income. If you plan to
            apply for a mortgage in the next 24 months, talk to a tax professional about the
            tradeoff.
          </li>
          <li>
            <span className="text-ink-black">Inconsistent platform identity.</span> Some shoppers
            operate under their personal name; some under a sole-proprietor DBA. Pick one and keep it
            consistent on tax returns, bank accounts, and applications.
          </li>
          <li>
            <span className="text-ink-black">Relying on screenshots.</span> A screenshot of your
            Instacart earnings is not a verification document. It is a starting point. Get the PDF
            export. Better yet, get a signed third-party report.
          </li>
        </UL>
      </section>

      <section>
        <H2>How Krostio handles Instacart income</H2>
        <P>
          Krostio connects to the Instacart shopper account and pulls 12–24 months of batch-level
          earnings. We then combine it with any other gig platforms you work on and produce one
          unified verification report with:
        </P>
        <UL>
          <li>Total earnings, gross and net of platform fees.</li>
          <li>Weekly deposit consistency, plotted as a stability metric.</li>
          <li>Tenure on each platform.</li>
          <li>
            An income consistency score (0–100) that summarizes the file at a glance for an
            underwriter.
          </li>
          <li>A signed PDF and an expiring shareable link you can hand to any lender or landlord.</li>
        </UL>
        <P>
          Instacart shoppers represent a meaningful share of the 76 million Americans now
          participating in the gig economy. The income is real, the work is real, and the financial
          system is slowly building the tools to recognize it. In the meantime, your job is to walk
          in with a file that leaves no room for ambiguity.
        </P>
      </section>
    </ArticleShell>
  )
}
