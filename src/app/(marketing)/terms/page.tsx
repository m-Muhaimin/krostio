import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Krost',
  description:
    'The terms that govern your use of Krost: account terms, payments, acceptable use, disclaimers, and termination.',
}

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <header className="border-b border-hairline pb-10">
        <p className="text-mono-label text-slate">Legal</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Terms of Service.
        </h1>
        <p className="mt-4 text-body text-slate">
          These terms govern your access to and use of Krost. By creating an account you agree to
          them. If you do not agree, please do not use the service.
        </p>
      </header>

      <article className="prose-editorial mt-12 space-y-12 text-ink">
        <section>
          <h2 className="font-display text-2xl text-ink-black">1. Account terms</h2>
          <p className="mt-3 text-body text-slate">
            You must be at least 18 years old and able to enter into a binding contract to use
            Krost. You are responsible for keeping your credentials secure and for all activity
            that happens under your account. Notify us immediately at{' '}
            <a className="link-editorial" href="mailto:support@krost.app">
              support@krost.app
            </a>{' '}
            if you suspect unauthorized access.
          </p>
          <p className="mt-3 text-body text-slate">
            One person or legal entity may maintain one account. Sharing accounts across multiple
            individuals is not permitted.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">2. Payment terms</h2>
          <p className="mt-3 text-body text-slate">
            Paid plans are billed in advance on a recurring basis (monthly or annual depending on
            the plan you select). All payments are processed by Stripe; by subscribing you also
            agree to Stripe&rsquo;s terms.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>Fees are non-refundable except where required by law.</li>
            <li>
              We may change pricing with at least 30 days&rsquo; notice. Changes do not apply
              retroactively to a billing period you have already paid for.
            </li>
            <li>
              If a payment fails, your access to paid features may be suspended until the balance
              is resolved.
            </li>
            <li>You can cancel anytime from the billing portal — access continues until the end of the paid period.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">3. Acceptable use</h2>
          <p className="mt-3 text-body text-slate">You agree not to:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>
              Submit false, fabricated, or misleading earnings data, or attempt to misrepresent
              your income.
            </li>
            <li>Use Krost to commit, facilitate, or further any form of fraud.</li>
            <li>Access another person&rsquo;s account or platform connection without authorization.</li>
            <li>
              Reverse engineer, scrape, or interfere with the security or operation of the service.
            </li>
            <li>Use the service in violation of any applicable law or regulation.</li>
          </ul>
          <p className="mt-4 text-body text-slate">
            We reserve the right to suspend or terminate accounts that violate these rules.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">4. Disclaimer</h2>
          <p className="mt-3 text-body text-slate">
            Krost is an income verification tool. We are not a consumer reporting agency under the
            Fair Credit Reporting Act (FCRA), we are not a credit bureau, and we do not produce
            credit scores. The income consistency score we generate is an informational signal
            based on data you have chosen to connect; lenders and other recipients should treat it
            as one input among many and conduct their own due diligence.
          </p>
          <p className="mt-3 text-body text-slate">
            The service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without
            warranties of any kind, whether express or implied, including merchantability, fitness
            for a particular purpose, and non-infringement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">5. Limitation of liability</h2>
          <p className="mt-3 text-body text-slate">
            To the maximum extent permitted by law, Krost and its affiliates, officers, employees,
            and agents will not be liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenues, arising out of or related to your
            use of the service. Our aggregate liability for any claim relating to the service will
            not exceed the greater of (a) the amount you paid us in the twelve months preceding the
            claim, or (b) one hundred U.S. dollars.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">6. Termination</h2>
          <p className="mt-3 text-body text-slate">
            You may close your account at any time from the settings page. We may suspend or
            terminate your access if you breach these terms, if required by law, or if continuing
            to provide the service is no longer commercially viable. On termination, your data
            will be deleted in accordance with our{' '}
            <a className="link-editorial" href="/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">7. Changes to these terms</h2>
          <p className="mt-3 text-body text-slate">
            We may update these terms from time to time. Material changes will be announced via
            email or in-product notice at least 30 days before they take effect. Continued use
            after that constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">8. Governing law</h2>
          <p className="mt-3 text-body text-slate">
            These terms are governed by the laws of the State of Delaware, USA, without regard to
            its conflict-of-law principles. Any dispute will be resolved exclusively in the state
            or federal courts located in Delaware, unless local consumer-protection laws require
            otherwise.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">9. Contact</h2>
          <p className="mt-3 text-body text-slate">
            Questions about these terms? Reach us at{' '}
            <a className="link-editorial" href="mailto:support@krost.app">
              support@krost.app
            </a>
            .
          </p>
        </section>
      </article>

      <footer className="mt-16 border-t border-hairline pt-6">
        <p className="text-mono-label text-slate">Last updated: May 2026</p>
      </footer>
    </div>
  )
}
