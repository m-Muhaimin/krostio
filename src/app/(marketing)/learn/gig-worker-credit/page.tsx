import type { Metadata } from 'next'
import { ArticleShell, H2, P, UL } from '../_components/article-shell'

export const metadata: Metadata = {
  title: 'Why Gig Workers Get Denied Credit (and How to Fix It)',
  description:
    'The structural reasons gig workers get rejected for loans, credit cards, and rentals — and the practical steps that change the outcome.',
  alternates: { canonical: '/learn/gig-worker-credit' },
  openGraph: {
    title: 'Why Gig Workers Get Denied Credit (and How to Fix It)',
    description:
      'It\'s not your income. It\'s how lenders see it. A clear-eyed look at why the gig economy is underbanked — and what to do about it.',
    type: 'article',
    url: '/learn/gig-worker-credit',
  },
}

export default function Page() {
  return (
    <ArticleShell
      eyebrow="Guide · The gig economy"
      title={<>Why gig workers get denied credit (and how to fix it).</>}
      readTime="11 min read · Updated May 2026"
      intro={
        <>
          The gig economy now includes more than 76 million Americans, and the average full-time
          freelancer earns roughly $108,028 a year — well above the median U.S. household income. And
          yet, gig workers are denied loans, mortgages, and credit cards at rates that bear no
          relation to their actual ability to pay. This essay explains why that happens and what to do
          about it.
        </>
      }
    >
      <section>
        <H2>The denial isn&rsquo;t about you. It&rsquo;s about the model.</H2>
        <P>
          Modern underwriting runs on statistical models trained on decades of W-2 wage data. The
          inputs those models trust most are pay-stub frequency, employer tenure, and tax-withholding
          consistency. A gig worker has none of those — not because they lack income, but because the
          income flows through a different shape.
        </P>
        <P>
          When an underwriting model encounters a borrower with no employer field, no W-2, and
          variable monthly deposits, it does not conclude &ldquo;this person has unstable income.&rdquo;
          It concludes &ldquo;I have no signal.&rdquo; And no signal, in a risk-averse system, gets
          treated as bad signal. This is the core mechanic.
        </P>
      </section>

      <section>
        <H2>The five places this goes wrong</H2>
        <UL>
          <li>
            <span className="text-ink-black">Stated-income fields don&rsquo;t match deposit
            patterns.</span> An applicant types &ldquo;$65,000&rdquo; into the income field, but the
            bank-statement automated review sees variable weekly deposits totaling $54,000. The system
            flags &ldquo;income discrepancy&rdquo; and routes the file to manual review — where most
            files quietly die.
          </li>
          <li>
            <span className="text-ink-black">Tax returns understate income.</span> A gig worker who
            aggressively takes the mileage deduction reports net Schedule C income 30–50% lower than
            their gross. The model uses the net figure. The borrower&rsquo;s ability to pay is, in
            reality, much higher.
          </li>
          <li>
            <span className="text-ink-black">Credit utilization spikes in low-earning months.</span>{' '}
            Gig income is lumpy. A slow month leads to higher credit-card balances, which lowers the
            FICO score, which raises the interest rate on the next loan application, which compounds
            the problem.
          </li>
          <li>
            <span className="text-ink-black">Thin or short credit files.</span> Many gig workers are
            younger, immigrant, or otherwise underbanked, with limited credit history. Models built
            for thick W-2 files have nothing to chew on.
          </li>
          <li>
            <span className="text-ink-black">Lenders have no way to verify gig income directly.</span>{' '}
            They are dependent on the borrower&rsquo;s own documentation. Sloppy documentation gets
            denied; even good documentation gets a haircut.
          </li>
        </UL>
      </section>

      <section>
        <H2>What the regulators are doing about it</H2>
        <P>
          The CFPB&rsquo;s final rule under Section 1033 of the Dodd-Frank Act, finalized in late
          2024, gives consumers the right to share their financial data — including data from
          non-traditional accounts — with third parties of their choosing. In practice, this is the
          legal underpinning for a new generation of income-verification tools that pull directly from
          platforms like Uber, DoorDash, and Upwork, rather than relying on the platforms to produce
          their own pay stubs.
        </P>
        <P>
          Fannie Mae and Freddie Mac have also expanded their automated underwriting engines (Desktop
          Underwriter and Loan Product Advisor) to accept bank-statement-based income verification
          for self-employed borrowers — a meaningful step, though one that still privileges
          well-documented self-employment over gig work specifically.
        </P>
      </section>

      <section>
        <H2>What you can do, in the order it matters</H2>
        <UL>
          <li>
            <span className="text-ink-black">File taxes every year, even when you don&rsquo;t owe.</span>{' '}
            Two years of returns is the gateway to almost every form of conventional credit.
          </li>
          <li>
            <span className="text-ink-black">Don&rsquo;t over-deduct in years you plan to borrow.</span>{' '}
            Talk to a CPA about deduction strategy 12–24 months before a planned mortgage or auto
            purchase.
          </li>
          <li>
            <span className="text-ink-black">Keep your gig deposits in one bank account.</span>{' '}
            Underwriters love a clean trail. Move money once a month if you want, but the deposits
            should land in one place.
          </li>
          <li>
            <span className="text-ink-black">Build a consolidated income record.</span> A single,
            verified document showing all your gig income, stability, and trajectory is the highest
            leverage thing you can hand a lender. It changes the conversation from &ldquo;we
            can&rsquo;t verify&rdquo; to &ldquo;here is what we&rsquo;re working with.&rdquo;
          </li>
          <li>
            <span className="text-ink-black">Apply at lenders who serve self-employed borrowers.</span>{' '}
            Credit unions, community banks, and fintech lenders are typically more open than national
            retail banks. Their underwriting is more often manual, which sounds bad but is good — a
            human can be persuaded; a model cannot.
          </li>
        </UL>
      </section>

      <section>
        <H2>What Krostio does about it</H2>
        <P>
          Krostio is built on a simple bet: lenders are not refusing gig workers because they want to.
          They are refusing them because the data infrastructure to underwrite them well does not
          exist. Once that infrastructure exists, the loans get made.
        </P>
        <P>
          We connect to the platforms gig workers actually use — Uber, Lyft, DoorDash, Instacart,
          Grubhub, Upwork, Fiverr — pull 12 to 24 months of earnings, and compute an income
          consistency score (0–100) that summarizes stability, platform diversity, tenure, and
          trajectory. The result is a signed PDF report and a revocable shareable link that any
          lender can verify in seconds.
        </P>
        <P>
          It does not change your credit score. It does not promise to. What it does is give an
          underwriter the signal they need to say yes when the answer should be yes.
        </P>
      </section>
    </ArticleShell>
  )
}
