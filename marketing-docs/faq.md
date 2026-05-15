# Krost — Frequently Asked Questions

> Covers: product, pricing, data privacy, lenders, technical, troubleshooting.
> Format: Q&A. Designed to live on the `/faq` page and power the Intercom/Zendesk help center.
> Update: review and refresh every 30 days based on actual support tickets.

---

## Product

### What is Krost?

Krost is a decentralized credit scoring platform for gig workers. We pull your earnings history from gig platforms (Uber, DoorDash, Upwork, Fiverr, etc.), compute a 300–850 credit score based on how you actually earn, and attest it on Base L2 (Ethereum) so any lender can verify it — without seeing your raw financial data.

### Who is Krost for?

Gig workers — drivers, delivery couriers, freelancers, independent contractors — who earn money through platforms but are treated as "income unverifiable" by traditional credit systems. Also: lenders (credit unions, fintechs, DeFi protocols) who want to serve this market with verified income data.

### How is Krost different from FICO?

FICO measures debt repayment behavior: credit cards, loans, payment history. It was built in 1989. It has no model for gig income. Krost measures income generation behavior: earnings consistency, platform diversity, tenure, trajectory. Same 300–850 scale, different inputs. They're not competing — Krost is additive. Workers can have both.

### How is Krost different from credit-builder apps (Self, Chime, Kikoff)?

Credit-builder apps help you build FICO credit by reporting on-time payments. That's useful. But they don't measure your income at all — they just add positive payment data to your credit file. Krost starts from your actual earnings and generates an income-based score that reflects your earning power, not your debt behavior. A gig worker with 2 years of $5K/month Uber income and a thin credit file can have a 740 Krost Score but a 620 FICO. Which one matters more for a $15,000 auto loan?

### What platforms does Krost support?

Currently: Uber, DoorDash, Lyft, Upwork, Fiverr, Instacart.

In beta / coming soon: Grubhub, Postmates, TaskRabbit, Freelancer.com, Truelancer, Rover, Wag.

*Don't see yours? Email hello@krost.xyz — we prioritize platforms by waitlist demand.*

### Is this related to Plaid or Argyle?

Krost uses Plaid for bank-linked income verification as one data source. We also connect directly to platform APIs (Uber, DoorDash, etc.) where OAuth is available. Argyle is a competitor in the income data aggregation space — we use their data selectively. Krost's value add is the scoring engine on top of the raw data, and the on-chain attestation layer.

---

## The Score

### How is my Krost Score calculated?

Your score is computed from 12 months of verified earnings data across all connected platforms. The model uses four weighted factors:

| Factor | Weight | What it measures |
|--------|--------|-----------------|
| Income Stability | 30% | How consistent are your weekly/monthly earnings over 3+ months |
| Average Monthly Income | 25% | Raw earning power, normalized across platforms |
| Platform Diversity | 15% | Multi-platform income = income resilience |
| Earnings Trajectory | 15% | Growing, stable, or declining trend |
| Tenure | 10% | How long you've been in the gig economy |
| Platform Ratings | 5% | Quality signal from platform ratings |

We do not use: credit bureau data, social data, location, race, gender, or any demographic data.

### What score range is considered "good" for gig workers?

The full 300–850 range applies, but the distribution differs from FICO:

| Score | Range | Typical profile |
|-------|-------|-----------------|
| 720–850 | Excellent | 2+ years, 3+ platforms, consistent growth |
| 670–719 | Good | 12–18 months, 2 platforms, stable income |
| 600–669 | Fair | 6–12 months, 1–2 platforms, some variance |
| 500–599 | Building | <6 months, 1 platform, high variance |
| 300–499 | Limited | New or highly irregular income |

Most Krost users score 640–760. The median is 698.

### Does the Krost Score affect my FICO score?

No. Krost is an income-based alternative score — it does not report to credit bureaus and does not affect your FICO score positively or negatively. It is a separate, complementary record. You can have a low FICO and a high Krost Score (if you're a new-to-credit but consistent gig worker) or vice versa.

### How often does my score update?

Your score is recalculated every time you earn — specifically, after each platform payout cycle. There's no fixed "update day." Your score reflects the most recent 12-month window of verified earnings. If your income increases, your score can increase. If you stop working for 3 months, your score will decline.

### Can I delete my score?

Yes. You can delete your Krost account and all associated data at any time from your settings page. On-chain attestations cannot be deleted (they're permanent by design), but they only contain your score hash and a unique identifier — no raw financial data.

---

## Privacy & Data

### What data does Krost collect?

We collect: earnings history from connected platforms (via read-only OAuth), email address, and optional: name, platform usernames. We do NOT collect: bank account numbers, SSN, credit bureau data, social profiles, location, device data beyond basic analytics.

### Who can see my score?

Only parties you authorize. When you share your score with a lender, you grant them one-time read access to your current score and attestation hash. They cannot access your score again without a new authorization. You can revoke authorizations at any time from your `/dashboard/worker/connections` page.

### Can lenders see my raw earnings data?

No. Lenders receive: (1) your Krost Score (300–850), (2) your attestation hash (verifiable on-chain), (3) optional: the four factor breakdowns (stability, income, diversity, trajectory). They do NOT receive: raw earnings figures, platform transaction history, bank data, or any data not in the score summary.

### Where is my data stored?

Earnings data is stored encrypted in Supabase (PostgreSQL) with row-level security. The on-chain attestation on Base L2 contains only your score hash and a unique identifier — no raw data. You can export your data at any time and delete it permanently.

### Does Krost sell my data?

No. We generate revenue from lender API queries and worker subscription fees. We do not sell, license, or share your personal or financial data with any third party. See our [Privacy Policy](https://krost.xyz/privacy) for details.

---

## Lenders

### How can lenders use Krost?

Lenders query worker scores via the Krost Lender API. A worker authorizes the query (they control this), and the lender receives a verified score and attestation hash in seconds. No manual document review. No re-verification on every application.

### What does a lender query return?

```json
{
  "worker_id": "0x71C...dE3a",
  "score": 731,
  "range": "300-850",
  "attestation_hash": "0xa1f2...7c4b",
  "verified_at": "2026-05-15T12:00:00Z",
  "breakdown": {
    "income_stability": 85,
    "monthly_avg": "$4,200",
    "platform_diversity": 3,
    "earnings_trajectory": "stable"
  },
  "on_chain_url": "https://basescan.io/tx/0x..."
}
```

### How much does lender access cost?

See our [lender pricing page](https://krost.xyz/lenders). Pilot plan: $99/month for 50 verifications. No per-query spikes.

### How do I know the score is real?

Every score is attested on Base L2 (Ethereum L2). The attestation hash proves the score was computed by the Krost protocol at a specific time, from a specific worker's verified data. You can verify any score on-chain at `basescan.io` using the attestation hash — no trust in Krost required.

### Do you have a sandbox / test environment?

Yes. Lender sandbox: `https://sandbox.krost.xyz/api/v1`. Use test API keys from your dashboard. Test scores are clearly labeled and do not interact with mainnet attestations.

---

## Pricing & Billing

### How much does Krost cost for workers?

$29/month. Includes: unlimited platform connections, monthly score updates, unlimited lender share links, 12-month earnings history, Base L2 attestation.

14-day free trial. No credit card required for the trial.

### How much does Krost cost for lenders?

$99/month (Pilot), $299/month (Growth), Custom (Enterprise). All plans include API access, webhooks, and reporting.

### Can I cancel anytime?

Yes. Cancel from your billing settings page at any time. If you cancel, you lose access at the end of your current billing period. Your on-chain attestations remain valid — only your access to the Krost platform ends.

### Do you offer discounts?

Yes. Early access members get 50% off for the first 3 months (code: EARLY50). Annual billing saves 20%. Student and verified low-income workers: contact hello@krost.xyz for a discount program.

---

## Technical

### What is Base L2?

Base is a Layer 2 blockchain built on Ethereum by Coinbase. It's fast (<1 second finality), cheap (<$0.01 per transaction), and secure via Ethereum's consensus. Krost attests scores on Base L2 because it's accessible to anyone — no special wallet or crypto knowledge required to verify.

### Do I need a crypto wallet to use Krost?

No. Workers interact with Krost through a normal web and mobile interface. The on-chain attestation is an implementation detail — your score is verified by the protocol, not by you manually. Lenders can verify scores on `basescan.io` with no wallet required.

### Is this a DeFi protocol?

Not exactly. Krost is a centralized scoring protocol with a decentralized attestation layer. The scoring engine is operated by Krost (similar to how FICO operates its model). The attestation is on-chain so the score record is immutable and publicly verifiable. Future versions may fully decentralize the scoring model — we'll announce plans when ready.

### What happens if Krost goes away?

Your on-chain attestations survive. They are permanent records on Base L2. Your score can still be verified on-chain indefinitely. What you lose: platform connections, score updates, and the web interface. But the historical record is yours forever.

---

## Troubleshooting

### My score is lower than I expected. Why?

Common reasons:
- **Short tenure:** <6 months on a platform means limited history
- **Single platform:** platform diversity adds 15% to your score
- **High variance:** significant month-to-month swings hurt stability score
- **Declining trajectory:** if your last 3 months are below your average, that pulls the trajectory score down

You can see your full breakdown on the score page. Reply to any Krost email and I'll walk through your specific breakdown.

### I connected a platform but my score didn't update.

Scores update after the next payout cycle from your platform — typically weekly or bi-weekly depending on the platform. If it hasn't updated after 7 days, check that your platform connection is still active (re-authenticate if needed). Still stuck? Email hello@krost.xyz.

### The lender I shared my score with says they can't verify it.

They can verify at `basescan.io` using the attestation hash from your share link. If they don't know how, send them to our [lender verification guide](https://krost.xyz/verify). If they need API access, direct them to `krost.xyz/lenders`.

### I got an email saying my trial is ending but I already paid.

You're likely on a legacy trial. Check your billing page — if you have an active subscription, you're all set. Email hello@krost.xyz if something looks wrong.

---

## Contact

**General questions:** hello@krost.xyz
**Lender integrations:** lenders@krost.xyz
**Press:** press@krost.xyz
**Bug report:** Open an issue at github.com/krost/kit

Response time: <24 hours on business days.
