import type { Metadata } from 'next'
import { ArticleShell, H2, P, UL } from '../_components/article-shell'

export const metadata: Metadata = {
  title: 'How to Prove Income as a DoorDash Driver (2026 Guide)',
  description:
    'A practical guide for DoorDash drivers on proving income to landlords, lenders, and underwriters — what counts as proof, what doesn\'t, and how Krost turns Dasher earnings into a verified report.',
  alternates: { canonical: '/learn/doordash-income-proof' },
  openGraph: {
    title: 'How to Prove Income as a DoorDash Driver',
    description:
      'What actually counts as proof of income when you Dash for a living — and how to put a verified report in a lender\'s hands in minutes.',
    type: 'article',
    url: '/learn/doordash-income-proof',
  },
}

export default function Page() {
  return (
    <ArticleShell
      eyebrow="Guide · DoorDash"
      title={<>How to prove income as a DoorDash driver.</>}
      readTime="9 min read · Updated May 2026"
      intro={
        <>
          DoorDash pays you on a weekly direct deposit, sends you a 1099-NEC at tax time, and otherwise
          leaves you to fend for yourself when a landlord, auto dealer, or mortgage officer asks for
          &ldquo;proof of income.&rdquo; This guide walks through what those parties actually want, what
          DoorDash will and won&rsquo;t give you, and how to assemble a verification package that gets
          you approved.
        </>
      }
    >
      <section>
        <H2>What &ldquo;proof of income&rdquo; means when you don&rsquo;t get a paycheck</H2>
        <P>
          For a W-2 employee, proof of income is a single document: a pay stub or an employer letter.
          For a 1099 worker, no such document exists. There is no employer. DoorDash classifies you as
          an independent contractor, which means you are running a one-person business — and a business
          proves income by showing the money flowing in, the time it has been flowing in for, and the
          taxes filed on it.
        </P>
        <P>
          In practice, underwriters and landlords want to answer three questions: <em>Is this money
          real?</em> <em>Is it consistent?</em> <em>Is it likely to keep coming?</em> Every piece of
          documentation below is just a different way of answering those three questions.
        </P>
      </section>

      <section>
        <H2>The documents DoorDash actually gives you</H2>
        <P>
          From inside the Dasher app and the DoorDash tax dashboard you have access to:
        </P>
        <UL>
          <li>
            <span className="text-ink-black">Weekly earnings statements.</span> Available in the
            &ldquo;Earnings&rdquo; tab. They show base pay, promotions, and tips for the week. Each one
            is a snapshot — not a cumulative record.
          </li>
          <li>
            <span className="text-ink-black">Year-to-date earnings summary.</span> Available in the
            Dasher app and on partners.doordash.com. This is the closest thing to a pay stub you will
            get.
          </li>
          <li>
            <span className="text-ink-black">1099-NEC from Stripe.</span> Issued in January if you
            earned more than $600 in the prior year. This is your tax form, not a real-time income
            document.
          </li>
        </UL>
        <P>
          None of these alone will get you a mortgage. Most landlords will accept them in combination
          with bank statements. Auto lenders are split — some take them, many ask for &ldquo;a CPA
          letter,&rdquo; which is a polite way of saying they don&rsquo;t trust gig income at face
          value.
        </P>
      </section>

      <section>
        <H2>The five documents that actually open doors</H2>
        <P>
          If you are serious about borrowing — a car loan, a personal loan, an apartment lease, a
          mortgage — assemble all five of these before you start applying. Missing pieces are the
          single most common reason gig-worker applications get denied.
        </P>
        <UL>
          <li>
            <span className="text-ink-black">Two years of tax returns.</span> Full federal returns,
            including all Schedule C pages. Mortgages require two years; many auto lenders accept one.
          </li>
          <li>
            <span className="text-ink-black">Three months of bank statements.</span> The full PDFs, not
            screenshots. Underwriters will trace the DoorDash deposits and match them against your
            earnings summaries.
          </li>
          <li>
            <span className="text-ink-black">DoorDash year-to-date earnings.</span> Exported as a PDF
            from the Dasher dashboard.
          </li>
          <li>
            <span className="text-ink-black">Profit-and-loss statement.</span> A simple document
            showing gross income minus business expenses (mileage, phone, supplies). You can prepare it
            yourself; some lenders want it signed by a CPA.
          </li>
          <li>
            <span className="text-ink-black">An income verification report.</span> A standardized
            document — like what Krost produces — that pulls all your gig earnings into one signed,
            shareable file so an underwriter does not have to assemble it themselves.
          </li>
        </UL>
      </section>

      <section>
        <H2>Why DoorDash income gets undervalued (and how to fix it)</H2>
        <P>
          The dirty secret of gig-economy lending is that underwriters routinely discount 1099 income
          by 25–50% when they price a loan. The reason is that legacy underwriting models were trained
          on W-2 wage data; they have no clean signal for the stability of a Dasher pulling $850 every
          week for three years. So they apply a haircut.
        </P>
        <P>
          The only defense is documentation that quantifies stability. According to the U.S. Chamber of
          Commerce and Census data, there are now over 76 million Americans participating in the gig
          economy, and the average freelancer earns roughly $108,028 per year — yet the lending
          industry still treats this income as &ldquo;unverifiable.&rdquo; That is what is starting to
          change, but only for workers who show up with the right paperwork.
        </P>
      </section>

      <section>
        <H2>How Krost helps</H2>
        <P>
          Krost connects directly to DoorDash and the other platforms you work on (Uber, Instacart,
          Upwork, and others), pulls your earnings history, and produces a single document an
          underwriter actually trusts:
        </P>
        <UL>
          <li>
            An <span className="text-ink-black">income consistency score</span> from 0–100 that
            quantifies stability, diversity, tenure, and trajectory. This is not a credit score — it is
            a transparent, deterministic measure of how steady your earnings are.
          </li>
          <li>
            A <span className="text-ink-black">signed PDF verification report</span> covering up to 24
            months of multi-platform earnings, formatted the way underwriters expect.
          </li>
          <li>
            An <span className="text-ink-black">expiring shareable link</span> you send to a lender or
            landlord. They click it, verify the data, and the link expires. You can revoke access at
            any time.
          </li>
        </UL>
        <P>
          If you are a Dasher who has been told &ldquo;we can&rsquo;t verify your income,&rdquo; this
          is the document that turns the conversation around.
        </P>
      </section>
    </ArticleShell>
  )
}
