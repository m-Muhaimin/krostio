import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Krost',
  description:
    'How Krost collects, uses, retains, and protects your data. Your privacy rights under GDPR and CCPA.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <header className="border-b border-hairline pb-10">
        <p className="text-mono-label text-slate">Legal</p>
        <h1 className="mt-3 font-display text-[44px] leading-none tracking-tight text-ink-black">
          Privacy Policy.
        </h1>
        <p className="mt-4 text-body text-slate">
          We respect your privacy and are committed to protecting the personal data you share with
          us. This policy explains what we collect, how we use it, and the rights you have over
          your information.
        </p>
      </header>

      <article className="prose-editorial mt-12 space-y-12 text-ink">
        <section>
          <h2 className="font-display text-2xl text-ink-black">1. Data we collect</h2>
          <p className="mt-3 text-body text-slate">
            We only collect what is necessary to verify your gig-economy income and operate the
            service:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>
              <span className="text-ink-black">Account information</span> — your email address,
              hashed password, role (worker or lender), and basic profile metadata.
            </li>
            <li>
              <span className="text-ink-black">Connected platform earnings data</span> — when you
              link a gig platform through Plaid, we receive transaction histories, payouts, and
              deposit metadata associated with that account. We never receive or store your
              platform login credentials.
            </li>
            <li>
              <span className="text-ink-black">Usage data</span> — pages visited, features used, and
              diagnostic logs used to improve reliability.
            </li>
            <li>
              <span className="text-ink-black">Payment data</span> — handled exclusively by Stripe.
              We store a customer reference and subscription status, never your card number.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">2. How we use your data</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>To calculate your income consistency score and generate verification reports.</li>
            <li>To operate, secure, and improve the Krost service.</li>
            <li>To process payments and manage your subscription.</li>
            <li>To communicate important account or service updates.</li>
          </ul>
          <p className="mt-4 text-body text-slate">
            We do not use your earnings data for advertising, profiling, or any purpose other than
            the income verification service you have asked us to provide.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">3. Data retention</h2>
          <p className="mt-3 text-body text-slate">
            We keep your data while your account is active. If you delete your account, we will
            delete your personal data and disconnect any linked platforms within 30 days. Anonymized,
            aggregate metrics that cannot be tied back to you may be retained for product analytics.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">4. Data sharing</h2>
          <p className="mt-3 text-body text-slate">
            We never sell your personal data. We share your verification report only with parties
            you explicitly authorize — for example, a lender who receives a share link you have
            generated. Share links are scoped, time-limited, and revocable.
          </p>
          <p className="mt-3 text-body text-slate">
            We use a small number of trusted sub-processors to operate the service: Supabase
            (hosting and database), Plaid (financial data connectivity), Stripe (payments), and
            standard infrastructure providers. They are contractually bound to protect your data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">5. Security</h2>
          <p className="mt-3 text-body text-slate">
            All data is transmitted over TLS and encrypted at rest. We do not store your gig
            platform login credentials — Plaid handles authentication and provides us with a
            revocable access token. Access to production systems is restricted and audited.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">6. Your rights (GDPR / CCPA)</h2>
          <p className="mt-3 text-body text-slate">
            Regardless of where you live, you have the right to:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data (the &ldquo;right to be forgotten&rdquo;).</li>
            <li>Export your data in a portable format.</li>
            <li>Opt out of the sale of personal information — we do not sell data in any case.</li>
            <li>Withdraw consent for any optional processing at any time.</li>
          </ul>
          <p className="mt-4 text-body text-slate">
            To exercise any of these rights, email{' '}
            <a className="link-editorial" href="mailto:privacy@krost.app">
              privacy@krost.app
            </a>
            . We respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">7. Cookies</h2>
          <p className="mt-3 text-body text-slate">
            We use a minimal set of cookies required to keep you signed in and to remember basic
            preferences. We do not use third-party advertising trackers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">8. Changes to this policy</h2>
          <p className="mt-3 text-body text-slate">
            If we make material changes to this policy we will notify you by email or via a notice
            in the product before the changes take effect.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">9. Contact</h2>
          <p className="mt-3 text-body text-slate">
            Questions about this policy? Reach us at{' '}
            <a className="link-editorial" href="mailto:privacy@krost.app">
              privacy@krost.app
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
