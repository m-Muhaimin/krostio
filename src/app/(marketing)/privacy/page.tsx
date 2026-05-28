import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Krostio',
  description:
    'How Krostio collects, uses, retains, and protects your data. Your privacy rights under GDPR, CCPA, and other applicable laws.',
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
          Krostio (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) respects your privacy
          and is committed to protecting the personal data you entrust to us. This policy
          explains what information we collect, how we use it, the legal bases we rely on,
          and the rights you have over your data. It applies to all users of the Krostio
          service, including gig workers, lenders, and visitors to our website.
        </p>
      </header>

      <article className="prose-editorial mt-12 space-y-12 text-ink">
        <section>
          <h2 className="font-display text-2xl text-ink-black">1. Data controller</h2>
          <p className="mt-3 text-body text-slate">
            Krostio is operated by SuprBuild, LLC. If you have any questions about
            this policy or our data practices, please contact:
          </p>
          <p className="mt-3 text-body text-slate">
            SuprBuild, LLC<br />
            Attn: Privacy<br />
            Email:{' '}
            <a className="link-editorial" href="mailto:privacy@krost.app">
              privacy@krost.app
            </a>
          </p>
          <p className="mt-3 text-body text-slate">
            We are the data controller with respect to personal data collected through the
            service. Our data protection representative within the UK / EEA can be reached
            at the same email address.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">2. What we collect</h2>
          <p className="mt-3 text-body text-slate">
            We collect only the information necessary to provide and improve our income
            verification service. Categories are described below.
          </p>

          <h3 className="mt-6 font-display text-lg text-ink-black">2.1 Information you give us</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-body text-slate">
            <li>
              <span className="text-ink-black">Account registration data.</span> When you
              create an account, we collect your email address and a securely hashed
              password. If you sign in via Google OAuth, we receive your email address and
              Google profile information (name, avatar URL) from Google — we never see or
              store your Google password.
            </li>
            <li>
              <span className="text-ink-black">Profile information.</span> You may
              optionally provide your name, avatar, and role (worker or lender). This is
              stored in your profile and is not shared outside the service without your
              consent.
            </li>
            <li>
              <span className="text-ink-black">Payment and billing data.</span> When you
              subscribe to a paid plan or purchase a single report, payment processing is
              handled by Paddle (our payment processor). We receive a customer reference
              ID, subscription status, and current period end date from Paddle. We never
              receive or store your credit card number — that data goes directly to Paddle
              under their privacy policy.
            </li>
            <li>
              <span className="text-ink-black">Plaid platform connections.</span> When you
              link a gig platform through Plaid, you authenticate directly with that
              platform via Plaid Link (an OAuth-like flow). We never receive your platform
              login credentials. After successful linking, Plaid provides us with a
              revocable access token that we use to retrieve your transaction history,
              payouts, deposit metadata, and account balances from that platform. The
              specific data fields available depend on the platform, but generally include
              transaction amounts, dates, descriptions, counterparty information, and
              running balances. You can revoke any connection at any time.
            </li>
            <li>
              <span className="text-ink-black">Support communications.</span> If you
              contact us for support, we collect whatever information you choose to share
              with us, including your email address and details about the issue.
            </li>
          </ul>

          <h3 className="mt-6 font-display text-lg text-ink-black">2.2 Information we collect automatically</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-body text-slate">
            <li>
              <span className="text-ink-black">Usage data.</span> We collect information
              about how you interact with the service, including pages visited, features
              used, click events, session duration, and referral URLs. This data is
              collected via PostHog (self-hosted in the EU) and is used for product
              improvement and diagnostics only.
            </li>
            <li>
              <span className="text-ink-black">Device and connection data.</span> We
              receive your IP address, browser type and version, operating system, and
              device type. This is used for security monitoring, fraud prevention, and
              basic analytics.
            </li>
            <li>
              <span className="text-ink-black">Cookies and similar technologies.</span> We
              use essential cookies to maintain your session and keep you signed in. We do
              not use cookies for advertising, cross-site tracking, or any purpose other
              than core operational functionality. See Section 10 for details.
            </li>
          </ul>

          <h3 className="mt-6 font-display text-lg text-ink-black">2.3 On-chain passport data</h3>
          <p className="mt-3 text-body text-slate">
            If you choose to mint an on-chain passport (a non-financial NFT on Base L2),
            the following information is published to a public blockchain: your income
            consistency tier (e.g., &ldquo;Strong&rdquo; or &ldquo;Building&rdquo;), your
            score value, and the Ethereum wallet address you designate. No raw earnings
            data, platform details, or personally identifying information is written to the
            blockchain. The passport is an opt-in feature; you are not required to use it.
            Once data is written to a public blockchain it cannot be deleted or modified
            — you should consider this before minting.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">3. How we use your data</h2>
          <p className="mt-3 text-body text-slate">
            We use your personal data only for the following purposes:
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-body text-slate">
            <li>
              <span className="text-ink-black">Providing the service.</span> To calculate
              your income consistency score, generate verification reports, enable sharing
              of those reports with third parties you authorize, and display your earnings
              dashboard. This is the core purpose for which you engage us.
            </li>
            <li>
              <span className="text-ink-black">Managing your account.</span> To create and
              maintain your account, authenticate your identity, process password resets,
              and manage billing.
            </li>
            <li>
              <span className="text-ink-black">Communication.</span> To send you
              transactional messages relating to your account (billing receipts,
              subscription changes, security alerts) and, with your consent, occasional
              product updates. We do not send marketing emails without your permission.
            </li>
            <li>
              <span className="text-ink-black">Security and fraud prevention.</span> To
              monitor for and prevent unauthorized access, abuse, or fraudulent activity.
            </li>
            <li>
              <span className="text-ink-black">Improvement and analytics.</span> To
              understand how the service is used, diagnose issues, and inform product
              decisions. We use aggregated, anonymized data where possible.
            </li>
            <li>
              <span className="text-ink-black">Legal compliance.</span> To comply with
              applicable legal obligations, including responding to valid legal requests
              from law enforcement or regulatory authorities.
            </li>
          </ol>
          <p className="mt-4 text-body text-slate">
            We do not use your earnings data, platform connection data, or any other
            personal information for advertising, credit scoring, profiling for commercial
            purposes, or any use beyond the income verification service you have engaged
            us to provide.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">4. Legal bases (GDPR)</h2>
          <p className="mt-3 text-body text-slate">
            If you are located in the European Economic Area (EEA), the United Kingdom, or
            Switzerland, we process your personal data under the following legal bases:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-body text-slate">
            <li>
              <span className="text-ink-black">Performance of contract</span> — to provide
              the service you have signed up for, including account management, score
              calculation, report generation, and billing.
            </li>
            <li>
              <span className="text-ink-black">Consent</span> — where you have explicitly
              consented, such as by linking a Plaid-connected platform, opting into the
              on-chain passport feature, or agreeing to receive marketing communications.
              You may withdraw consent at any time without affecting other services.
            </li>
            <li>
              <span className="text-ink-black">Legitimate interests</span> — for security
              monitoring, fraud prevention, and product improvement, provided those
              interests are not overridden by your privacy rights.
            </li>
            <li>
              <span className="text-ink-black">Legal obligation</span> — where we are
              required to process data to comply with applicable law.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">5. Data sharing and disclosure</h2>
          <p className="mt-3 text-body text-slate">
            We never sell your personal data. We share your information only in the
            following circumstances:
          </p>

          <h3 className="mt-6 font-display text-lg text-ink-black">5.1 With your explicit consent</h3>
          <p className="mt-3 text-body text-slate">
            When you generate a share link for your income verification report, that
            report is accessible to anyone with the link. Share links are scoped to a
            specific report, time-limited (configurable by you), and revocable at any time
            from your dashboard. We recommend sharing only with trusted third parties such
            as lenders or property managers.
          </p>

          <h3 className="mt-6 font-display text-lg text-ink-black">5.2 Service providers (sub-processors)</h3>
          <p className="mt-3 text-body text-slate">
            We engage trusted third-party service providers to operate the service. They
            are contractually bound to process data only on our instructions, to protect
            it with appropriate security measures, and to never use it for their own
            purposes. Our current sub-processors are:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-body text-slate">
              <thead>
                <tr className="border-b border-hairline text-left text-mono-label text-slate">
                  <th className="pb-2 pr-4">Provider</th>
                  <th className="pb-2 pr-4">Service</th>
                  <th className="pb-2">Data location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr>
                  <td className="py-3 pr-4 text-ink-black">Supabase</td>
                  <td className="py-3 pr-4">Database hosting, authentication, storage</td>
                  <td className="py-3">USA (Virginia)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-ink-black">Plaid</td>
                  <td className="py-3 pr-4">Financial data connectivity</td>
                  <td className="py-3">USA</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-ink-black">Paddle</td>
                  <td className="py-3 pr-4">Payment processing and subscription management</td>
                  <td className="py-3">Global (see Paddle privacy policy)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-ink-black">Vercel</td>
                  <td className="py-3 pr-4">Application hosting and edge delivery</td>
                  <td className="py-3">Global edge network</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-ink-black">PostHog</td>
                  <td className="py-3 pr-4">Product analytics (EU-hosted)</td>
                  <td className="py-3">EU (Germany)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 font-display text-lg text-ink-black">5.3 Legal obligations</h3>
          <p className="mt-3 text-body text-slate">
            We may disclose your personal data if required to do so by law, or in the
            good-faith belief that such action is necessary to comply with a legal
            obligation, protect the rights or safety of Krostio, our users, or the public,
            or to defend against legal claims.
          </p>

          <h3 className="mt-6 font-display text-lg text-ink-black">5.4 Business transfers</h3>
          <p className="mt-3 text-body text-slate">
            If Krostio is involved in a merger, acquisition, or sale of all or a portion of
            its assets, your personal data may be transferred as part of that transaction.
            We will notify you via email and a prominent notice on the service of any
            change in ownership or use of your data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">6. Data retention</h2>
          <p className="mt-3 text-body text-slate">
            We retain your personal data only as long as necessary to provide the service
            and fulfill the purposes described in this policy:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>
              <span className="text-ink-black">Account data</span> — retained while your
              account is active. If you delete your account, all personal data is
              permanently deleted within 30 days, except where we are legally required to
              retain certain records (e.g., billing invoices).
            </li>
            <li>
              <span className="text-ink-black">Plaid connection data</span> — earnings and
              transaction data is retained for the duration of your account. If you
              disconnect a platform, we delete the access token immediately; historical
              data previously retrieved from that platform may remain until you delete your
              account.
            </li>
            <li>
              <span className="text-ink-black">Billing records</span> — invoices and
              payment records are retained for 7 years to comply with tax and accounting
              obligations.
            </li>
            <li>
              <span className="text-ink-black">Analytics data</span> — aggregated,
              anonymized usage data that cannot be linked back to you may be retained
              indefinitely for product analytics.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">7. International data transfers</h2>
          <p className="mt-3 text-body text-slate">
            Your personal data is primarily processed in the United States, where our core
            infrastructure providers (Supabase, Vercel) are located. If you are in the EEA,
            the UK, or Switzerland, we ensure an adequate level of data protection through
            one or more of the following safeguards:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>
              EU Standard Contractual Clauses (SCCs) as adopted by the European Commission.
            </li>
            <li>
              Data Processing Agreements (DPAs) with each sub-processor that incorporate
              the SCCs and require the same level of protection as under EU law.
            </li>
            <li>
              Where applicable, reliance on the UK International Data Transfer Agreement
              (IDTA) for transfers from the United Kingdom.
            </li>
          </ul>
          <p className="mt-3 text-body text-slate">
            By using the service, you acknowledge that your data may be transferred to and
            processed in the United States and other jurisdictions where our sub-processors
            operate.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">8. Security</h2>
          <p className="mt-3 text-body text-slate">
            We implement appropriate technical and organizational measures to protect your
            personal data against unauthorized access, alteration, disclosure, or
            destruction:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>All data in transit is encrypted using TLS 1.2 or higher.</li>
            <li>Data at rest is encrypted using AES-256.</li>
            <li>
              We do not store your gig platform login credentials. Plaid uses token-based
              authentication — we receive only a revocable access token, which is encrypted
              at rest.
            </li>
            <li>
              Passwords are hashed using bcrypt with a cost factor of 12 or higher before
              storage.
            </li>
            <li>
              Access to production systems is restricted to authorized personnel,
              protected by multi-factor authentication, and logged and audited.
            </li>
            <li>We conduct periodic security reviews and vulnerability assessments.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">9. Your rights</h2>
          <p className="mt-3 text-body text-slate">
            Depending on your jurisdiction, you have the following rights regarding your
            personal data. We&nbsp;will respond to any request within 30 days.
          </p>

          <h3 className="mt-6 font-display text-lg text-ink-black">9.1 Your rights (EEA / UK / Switzerland)</h3>
          <p className="mt-3 text-body text-slate">
            Under the GDPR and UK GDPR, you have the right to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-body text-slate">
            <li>
              <span className="text-ink-black">Access (Article 15).</span> Request a copy
              of the personal data we hold about you.
            </li>
            <li>
              <span className="text-ink-black">Rectification (Article 16).</span> Request
              correction of inaccurate or incomplete data.
            </li>
            <li>
              <span className="text-ink-black">Erasure (Article 17).</span> Request
              deletion of your personal data (&ldquo;right to be forgotten&rdquo;). Note
              that data published to a public blockchain (on-chain passport) cannot be
              deleted.
            </li>
            <li>
              <span className="text-ink-black">Restriction (Article 18).</span> Request
              restriction of processing in certain circumstances.
            </li>
            <li>
              <span className="text-ink-black">Data portability (Article 20).</span>
              Request a machine-readable export of your data.
            </li>
            <li>
              <span className="text-ink-black">Object (Article 21).</span> Object to
              processing based on legitimate interests, including direct marketing.
            </li>
            <li>
              <span className="text-ink-black">Withdraw consent.</span> Withdraw your
              consent at any time, without affecting the lawfulness of processing before
              withdrawal.
            </li>
            <li>
              <span className="text-ink-black">Lodge a complaint.</span> File a complaint
              with your local data protection authority (e.g., the ICO in the UK or your
              national DPA in the EEA).
            </li>
          </ul>

          <h3 className="mt-6 font-display text-lg text-ink-black">9.2 Your rights (California CCPA)</h3>
          <p className="mt-3 text-body text-slate">
            If you are a California resident, the CCPA grants you the right to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-body text-slate">
            <li>Know what personal information we collect, use, and disclose.</li>
            <li>Request deletion of personal information we have collected from you.</li>
            <li>Opt out of the sale of personal information — we do not sell data.</li>
            <li>
              Non-discrimination — we will not discriminate against you for exercising any
              of your CCPA rights.
            </li>
          </ul>
          <p className="mt-4 text-body text-slate">
            To exercise any of these rights, email{' '}
            <a className="link-editorial" href="mailto:privacy@krost.app">
              privacy@krost.app
            </a>
            . We may need to verify your identity before processing your request. You may
            also designate an authorized agent to make a request on your behalf.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">10. Cookies</h2>
          <p className="mt-3 text-body text-slate">
            We use a minimal set of cookies and similar storage technologies:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-body text-slate">
              <thead>
                <tr className="border-b border-hairline text-left text-mono-label text-slate">
                  <th className="pb-2 pr-4">Cookie</th>
                  <th className="pb-2 pr-4">Purpose</th>
                  <th className="pb-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-black">krost_session</td>
                  <td className="py-3 pr-4">Authentication session token (signed JWT)</td>
                  <td className="py-3">30 days</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-black">posthog_*</td>
                  <td className="py-3 pr-4">Product analytics (page views, feature usage)</td>
                  <td className="py-3">1 year</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-black">_csrf</td>
                  <td className="py-3 pr-4">Cross-site request forgery protection</td>
                  <td className="py-3">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-body text-slate">
            You can manage or disable cookies through your browser settings. However,
            disabling essential cookies may prevent you from signing in or using core
            features. We do not use third-party advertising cookies, tracking pixels, or
            fingerprinting technologies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">11. Children&rsquo;s privacy</h2>
          <p className="mt-3 text-body text-slate">
            Krostio is not intended for individuals under the age of 18 (or the applicable
            age of majority in your jurisdiction). We do not knowingly collect personal
            data from minors. If we become aware that a minor has provided us with personal
            data, we will delete it promptly. If you believe a minor has provided us with
            personal data, please contact us at{' '}
            <a className="link-editorial" href="mailto:privacy@krost.app">
              privacy@krost.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">12. Third-party links</h2>
          <p className="mt-3 text-body text-slate">
            The service may contain links to third-party websites, products, or services
            (e.g., Plaid Link, Paddle Checkout, lender portals). We are not responsible for
            the privacy practices of those third parties. We encourage you to read their
            privacy policies before interacting with them.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">13. Changes to this policy</h2>
          <p className="mt-3 text-body text-slate">
            We may update this Privacy Policy from time to time. If we make material
            changes, we will notify you by email (to the address on file) and through a
            prominent notice in the service before the changes take effect. We encourage
            you to review this policy periodically.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink-black">14. Contact</h2>
          <p className="mt-3 text-body text-slate">
            If you have questions, concerns, or requests regarding this Privacy Policy or
            our data practices, please contact us:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-slate">
            <li>
              Email:{' '}
              <a className="link-editorial" href="mailto:privacy@krost.app">
                privacy@krost.app
              </a>
            </li>
            <li>
              Data protection inquiries:{' '}
              <a className="link-editorial" href="mailto:dpo@krost.app">
                dpo@krost.app
              </a>
            </li>
            <li>
              For EEA/UK users: you may also contact our EU/UK representative at the same
              email addresses above.
            </li>
          </ul>
        </section>
      </article>

      <footer className="mt-16 border-t border-hairline pt-6">
        <p className="text-mono-label text-slate">Last updated: May 28, 2026</p>
      </footer>
    </div>
  )
}
