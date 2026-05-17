import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center mb-14">
        <p className="text-mono-label text-ink/30 mb-3">LEGAL</p>
        <h1 className="font-display text-[clamp(32px,5vw,52px)] font-medium tracking-tight leading-[1.05]">
          Privacy Policy
        </h1>
        <p className="text-body text-ink/50 mt-4">
          Last updated: May 16, 2026
        </p>
      </div>

      <div className="space-y-10 text-body text-ink/70 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">1. Introduction</h2>
          <p>
            Krostio Inc. (&ldquo;Krostio,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
            use our platform, website, and services (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p className="mt-3">
            By using the Service, you agree to the collection and use of information in accordance with this policy.
            If you do not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">2. Information We Collect</h2>
          <h3 className="font-medium text-ink mt-4 mb-2">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-1.5">
            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and a password.</li>
            <li><strong>Platform Connections:</strong> When you connect a gig platform (e.g., Uber, DoorDash, Upwork), you authorize us to access your earnings data, work history, and platform activity through OAuth-based connections via Plaid, Argyle, or direct API integrations.</li>
            <li><strong>Profile Information:</strong> Any additional information you choose to provide, such as your phone number or profile photo.</li>
            <li><strong>Communications:</strong> When you contact us, we collect the content of your messages and your contact information.</li>
          </ul>

          <h3 className="font-medium text-ink mt-5 mb-2">2.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-1.5">
            <li><strong>Usage Data:</strong> Information about how you interact with our Service, including pages visited, features used, and time spent.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device type, and IP address.</li>
            <li><strong>Cookies:</strong> We use essential cookies for authentication and functionality, and analytics cookies to improve our Service. You can control cookies through your browser settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li><strong>Score Calculation:</strong> To compute your Krost Score using earnings data, income consistency, platform diversity, and other factors you authorize.</li>
            <li><strong>Lender Verification:</strong> To generate income verification reports and Krost Verifier links that you choose to share with lenders, landlords, or other third parties.</li>
            <li><strong>Service Operation:</strong> To provide, maintain, and improve our Service, including customer support and troubleshooting.</li>
            <li><strong>Product Improvement:</strong> To analyze usage patterns and improve our scoring algorithms, user experience, and platform integrations.</li>
            <li><strong>Communications:</strong> To send you service updates, product announcements, and marketing communications (with your consent where required).</li>
            <li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, and security incidents.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">4. How We Share Your Information</h2>
          <p>
            Krostio does <strong>not</strong> sell your personal information. We share your information only in the
            following circumstances:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li><strong>With Your Permission:</strong> When you authorize us to share your earnings data or Krost Score with a lender, landlord, or other third party (e.g., via a Krost Verifier link or PDF report). You control this sharing and can revoke access at any time.</li>
            <li><strong>Service Providers:</strong> We engage trusted third-party service providers (e.g., Supabase for database hosting, Stripe for payment processing, Vercel for hosting) who process data on our behalf under contractual obligations to protect your information.</li>
            <li><strong>Legal Compliance:</strong> We may disclose information if required by law, legal process, or governmental request, or to protect our rights, property, or safety.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">5. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide
            you the Service. When you delete your account, we will delete or anonymize your personal
            information within 30 days, except where we are required to retain it for legal or regulatory
            compliance purposes (e.g., tax records, fraud prevention).
          </p>
          <p className="mt-3">
            Platform earnings data retrieved through OAuth connections is cached and updated on a recurring
            basis. You may disconnect any platform at any time, after which we will stop retrieving new data
            from that platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">6. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li>Data is encrypted at rest using AES-256 and in transit using TLS 1.3.</li>
            <li>Our infrastructure is hosted on Supabase and Vercel, both SOC 2-compliant platforms.</li>
            <li>OAuth connections use read-only scopes — Krostio cannot transact on behalf of users.</li>
            <li>Access to personal data is restricted to authorized personnel on a need-to-know basis.</li>
            <li>We conduct regular security audits and penetration testing.</li>
          </ul>
          <p className="mt-3">
            No method of transmission or storage is 100% secure. We cannot guarantee absolute security,
            but we are committed to protecting your data to the best of our ability.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements).</li>
            <li><strong>Portability:</strong> Request a machine-readable copy of your data in a structured format.</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances.</li>
            <li><strong>Objection:</strong> Object to processing of your information for marketing purposes.</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:privacy@krostio.com" className="link-editorial">privacy@krostio.com</a>.
            We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">8. CCPA &amp; GDPR Compliance</h2>
          <h3 className="font-medium text-ink mt-4 mb-2">California Residents (CCPA)</h3>
          <p>
            If you are a California resident, you have the right to know what personal information we collect,
            the right to request deletion, and the right to opt out of the sale of your personal information.
            Krostio does not sell personal information. To exercise your CCPA rights, email{' '}
            <a href="mailto:privacy@krostio.com" className="link-editorial">privacy@krostio.com</a>.
          </p>

          <h3 className="font-medium text-ink mt-5 mb-2">European Users (GDPR)</h3>
          <p>
            If you are located in the European Economic Area (EEA), we process your personal data based on
            one or more of the following lawful bases: your consent, performance of a contract, legitimate
            interests, or legal obligation. You have the right to lodge a complaint with your local data
            protection authority. Data controller: Krostio Inc.,{' '}
            <a href="mailto:privacy@krostio.com" className="link-editorial">privacy@krostio.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">9. Third-Party Services</h2>
          <p>
            Our Service integrates with third-party platforms and services:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1.5">
            <li><strong>Plaid &amp; Argyle:</strong> Used to connect and retrieve earnings data from gig platforms. These services operate under their own privacy policies.</li>
            <li><strong>Supabase:</strong> Our database and authentication provider. Data is hosted on US-based servers.</li>
            <li><strong>Stripe:</strong> Payment processing for paid plans. Stripe handles payment information; we do not store credit card details.</li>
            <li><strong>Vercel:</strong> Website and application hosting.</li>
          </ul>
          <p className="mt-3">
            We encourage you to review the privacy policies of these third-party services.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">10. Children's Privacy</h2>
          <p>
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect
            personal information from children. If we become aware that a child has provided us with
            personal information, we will take steps to delete it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            by email or through a notice on our website. Your continued use of the Service after changes
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink mb-3">12. Contact Us</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:
          </p>
          <p className="mt-3">
            <strong>Email:</strong>{' '}
            <a href="mailto:privacy@krostio.com" className="link-editorial">privacy@krostio.com</a>
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
