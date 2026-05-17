import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center mb-14">
        <p className="text-mono-label text-ink/30 mb-3">LEGAL</p>
        <h1 className="font-display text-[clamp(32px,5vw,52px)] font-medium tracking-tight leading-[1.05]">
          Terms of Service
        </h1>
        <p className="text-body text-ink/50 mt-4">
          Last updated: May 16, 2026
        </p>
      </div>

      <div className="space-y-10 text-body text-ink/70 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Krostio platform, website, and services (collectively, the &ldquo;Service&rdquo;),
            you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service.
          </p>
          <p className="mt-3">
            These Terms constitute a binding agreement between you (&ldquo;you,&rdquo; &ldquo;your,&rdquo; &ldquo;User&rdquo;) and
            Krostio Inc. (&ldquo;Krostio,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">2. Eligibility</h2>
          <p>By using the Service, you represent and warrant that:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>You are at least 18 years of age.</li>
            <li>You are a legal resident of the United States (the Service is currently available only to US residents).</li>
            <li>You have the legal capacity to enter into these Terms.</li>
            <li>You are not barred from using the Service under applicable law.</li>
            <li>All information you provide is accurate, current, and complete.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">3. Account Registration</h2>
          <p>
            To use the Service, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>Maintaining the confidentiality of your account credentials.</li>
            <li>All activities that occur under your account.</li>
            <li>Notifying us immediately of any unauthorized use of your account.</li>
          </ul>
          <p className="mt-3">
            We reserve the right to suspend or terminate accounts that violate these Terms or
            that we reasonably suspect are being used for fraudulent or abusive purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">4. Platform Connections</h2>
          <p>
            The core functionality of Krostio involves connecting your gig economy platform accounts
            (e.g., Uber, DoorDash, Upwork, Instacart) to our Service.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li><strong>Authorization:</strong> By connecting a platform, you authorize Krostio to access, retrieve, and store your earnings data, transaction history, and platform activity from that platform through OAuth-based connections via Plaid, Argyle, or direct API integrations.</li>
            <li><strong>Read-Only Access:</strong> All platform connections use read-only scopes. Krostio cannot initiate transactions, send messages, or take actions on your behalf on connected platforms.</li>
            <li><strong>Data Accuracy:</strong> You are responsible for ensuring that the data retrieved from connected platforms is accurate. Krostio relies on data provided by platform APIs and is not responsible for inaccuracies in third-party platform data.</li>
            <li><strong>Revocation:</strong> You may disconnect any platform at any time from your account settings. Disconnecting stops new data retrieval but does not delete previously collected data unless you also request deletion.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">5. Krost Score</h2>
          <p>
            The Krost Score is an informational metric derived from your gig earnings data. Important limitations:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>The Krost Score is <strong>not a credit score</strong> and is not a replacement for a FICO or VantageScore credit score.</li>
            <li>The Krost Score is <strong>not a guarantee of creditworthiness</strong> or loan approval.</li>
            <li>The Krost Score is <strong>for informational purposes only</strong>.</li>
            <li>Lenders, landlords, and other third parties make independent decisions based on their own criteria. Krostio does not guarantee that any third party will accept or rely on the Krost Score.</li>
            <li>Krostio is not a credit bureau, lender, or financial institution. We do not make credit decisions.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">6. Reports and Sharing</h2>
          <p>
            Krostio allows you to generate and share income verification reports (Krost Verifier links, PDF reports)
            with third parties such as lenders, landlords, and employers.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li><strong>Your Control:</strong> You decide who sees your data. Reports are shared only when you explicitly generate and send them.</li>
            <li><strong>Revocable:</strong> You may revoke access to a shared report at any time. However, data already obtained by a third party before revocation may continue to be used by them.</li>
            <li><strong>No Warranty:</strong> Krostio makes no warranty that any third party will accept or rely on our reports.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">7. Payment Terms</h2>
          <p>
            Krostio offers a free tier and paid subscription plans.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li><strong>Free Tier:</strong> Basic access to the Krost Score and limited report generation at no cost.</li>
            <li><strong>Paid Plans:</strong> Premium features are available on a subscription basis. Fees, billing cycles, and features are described on our pricing page and are subject to change with notice.</li>
            <li><strong>Payment Processing:</strong> Payments are processed securely by Stripe. By subscribing, you authorize Stripe to charge your payment method on the agreed billing cycle.</li>
            <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Access to paid features continues until the end of the current billing period. No pro-rata refunds are provided unless otherwise stated.</li>
            <li><strong>Taxes:</strong> You are responsible for any applicable taxes.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">8. Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>Use the Service for any illegal purpose or in violation of any applicable laws.</li>
            <li>Attempt to manipulate, inflate, or falsify your earnings data or Krost Score.</li>
            <li>Create multiple accounts for fraudulent purposes.</li>
            <li>Access or attempt to access other users' accounts or data.</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
            <li>Use the Service to transmit malware, viruses, or other harmful code.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Scrape, crawl, or harvest data from the Service without authorization.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">9. Intellectual Property</h2>
          <p>
            The Service, including its code, design, branding, algorithms, and content (excluding your personal data),
            is owned by Krostio Inc. and is protected by intellectual property laws.
          </p>
          <p className="mt-3">
            You retain all rights to your personal data and earnings information. You grant Krostio a limited
            license to use your data solely for the purpose of providing the Service to you (e.g., calculating
            your score, generating reports).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">10. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
            WHETHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, KROSTIO DISCLAIMS ALL
            WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="mt-3">
            KROSTIO DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE
            FROM VIRUSES OR OTHER HARMFUL COMPONENTS. WE DO NOT GUARANTEE THE ACCURACY, RELIABILITY, OR
            COMPLETENESS OF THE KROST SCORE OR ANY OTHER DATA PROVIDED THROUGH THE SERVICE.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">11. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, KROSTIO INC., ITS OFFICERS, DIRECTORS, EMPLOYEES, AND
            AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF
            OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
          </p>
          <p className="mt-3">
            OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE GREATER OF
            $100 OR THE AMOUNT YOU HAVE PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>
          <p className="mt-3">
            SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO THESE
            LIMITATIONS MAY NOT APPLY TO YOU.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">12. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Krostio Inc., its affiliates, officers,
            directors, employees, and agents from and against any claims, liabilities, damages, losses,
            and expenses (including reasonable legal fees) arising out of or related to:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>Your use of the Service in violation of these Terms.</li>
            <li>Your violation of any applicable law or regulation.</li>
            <li>Your infringement of any third-party rights.</li>
            <li>Any dispute between you and a third party arising from your use of the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">13. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time, with or without cause or notice.
            Upon termination, your right to use the Service will immediately cease. Sections 5, 8, 9, 10, 11, 12,
            and 13 of these Terms shall survive termination.
          </p>
          <p className="mt-3">
            You may terminate your account at any time by contacting us or through your account settings.
            Upon termination, we will delete or anonymize your personal data in accordance with our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">14. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of
            California, without regard to its conflict of law provisions. Any disputes arising under these
            Terms shall be resolved exclusively in the state or federal courts located in San Francisco,
            California.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">15. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of material changes
            by email or through a notice on our website. Your continued use of the Service after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">16. Contact</h2>
          <p>
            For questions or concerns regarding these Terms, please contact us:
          </p>
          <p className="mt-3">
            <strong>Email:</strong>{' '}
            <a href="mailto:legal@krostio.com" className="link-editorial">legal@krostio.com</a>
            <br />
            <strong>Krostio Inc.</strong>
            <br />
            San Francisco, CA
          </p>
        </section>
      </div>
    </div>
  );
}
