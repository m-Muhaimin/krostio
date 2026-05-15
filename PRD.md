# Krostio — Product Requirements Document
### *Income Verification & Lender-Ready Documentation for Gig Workers*
**Version:** 1.0 | **Author:** Solo Micro-SaaS Founder | **Date:** May 2026  
**Status:** Pre-build Validation → MVP Scoping

---

## 0. Executive Summary

Krostio is a B2C2B income-verification platform that translates gig platform earnings (Uber, DoorDash, Lyft, Instacart, Upwork, Fiverr, et al.) into lender-ready documentation — income history, consistency patterns, annualized projections, and a shareable income passport. The core insight: **banks speak W-2, gig workers speak 1099, and the translation layer does not yet exist at the consumer layer**.

**Positioning:** Not an infrastructure API (that's Argyle/Pinwheel territory, B2B, $100M+ raised). Krostio is the *consumer-facing interface on top of that infrastructure* — the TurboTax to Plaid's bank rails. We build trust with workers first, then monetize lenders as the B2B expansion.

---

## 1. Strategic Market Validation

### 1.1 Market Size & Urgency

| Signal | Data Point |
|---|---|
| US gig workers (2025) | 76.4 million (≈36% of US workforce) |
| Projected by 2027 | 86.5 million (>50% of total US workforce) |
| Global gig market (2026) | $674.1 billion projected |
| Global gig market (2034) | $2.17 trillion projected |
| CAGR | 15.79% |
| Denied loan rate for 1099 workers | Disproportionately high; no standardized documentation path |
| Average US freelancer income | $108,028/year (2025), yet banks routinely deny them |

The problem is structurally ignored by incumbents. Traditional banks require W-2s/paystubs. Non-QM mortgage lenders exist but rely on manual bank statement review, which is slow, expensive, and error-prone. No consumer-grade tool bridges this gap for the worker themselves.

### 1.2 Competitive Landscape

#### Infrastructure Layer (B2B, NOT direct competitors at consumer layer)
| Company | Raise | Positioning | Gap |
|---|---|---|---|
| **Argyle** | $100M+ (Series C, 2024) | B2B API for lenders; 75% US workforce coverage; 300 gig platforms | Sells to lenders, not workers. No consumer UI. |
| **Pinwheel** | VC-backed | B2B payroll API; 80% US worker coverage; 1,500 platforms | Same — no worker-facing product |
| **Truv** | VC-backed | Consumer-permissioned financial data; verification workflows | B2B-first, complex integration |
| **Atomic** | $40M (Greylock) | Payroll connectivity API; 75% US coverage | B2B infrastructure only |

#### Worker-Facing Fintech (Partial competitors)
| Company | What They Do | Gap vs. Krostio |
|---|---|---|
| **Giggle Finance** | Revenue-based lending for gig workers | They *are* the lender — no portability, no document generation |
| **Moves Financial** | Gig worker banking + income data (uses Argyle) | Banking-first, not verification-first; limited portability |
| **KarmaLife (India)** | Credit via gig platform data | India-focused; not a document tool |

#### The Existing Implementation Being Analyzed: income-verifier-delta.vercel.app
This is a **marketing shell / concept demo**, not a functional product. Full gap analysis in Section 8.

### 1.3 Strategic Wedge for a Solo Founder

The infrastructure players (Argyle, Pinwheel) are B2B with long sales cycles and enterprise contracts. They have **no incentive to build a consumer product** that competes with their clients (lenders). This creates a permanent structural gap:

> **The gig worker has no tool they own, control, and can take to any lender.**

Krostio is that tool. It rides on top of Argyle/Pinwheel/Plaid APIs rather than competing with them. Solo-founder advantage: move in the consumer layer gap that well-funded B2B players deliberately leave open.

---

## 2. Problem Definition

### 2.1 Primary User Pain

A gig worker earning $60,000–$110,000/year cannot prove their income to a conventional lender because:
1. No W-2 exists — they are an independent contractor
2. 1099 forms show gross income but not net (after expenses)
3. Tax returns reflect aggressive deductions that understate reportable income
4. Earnings come from 3–6 platforms simultaneously with no consolidated view
5. Platform-specific "earnings reports" are app screenshots — not lender-recognized documents
6. The manual process (bank statements + tax returns + explanatory letters) takes weeks and gets denied anyway

**The result:** A documented, tax-paying worker pays 18%+ APR from predatory lenders for loans they should qualify for at 6–8%.

### 2.2 Secondary Pain (Lender-Side)

Lenders lose qualified borrowers daily. The non-QM (non-Qualified Mortgage) market relies on manual bank statement review — slow, costly, and inconsistent. Lenders who accept gig income need underwriter-grade reports they can trust without hours of manual work.

### 2.3 Jobs-to-be-Done

**Gig Worker:**
- *"I want to prove I'm creditworthy so I can get a fair loan rate"*
- *"I want to see all my income in one place and understand my earning trajectory"*
- *"I want documentation I own and can send to any lender"*

**Lender / Underwriter:**
- *"I want to assess a gig worker's income in under 5 minutes with confidence"*
- *"I want risk signals: consistency, growth or decline, platform diversity"*
- *"I want verifiable data I can cite in an underwriting decision"*

---

## 3. Product Vision

> **Krostio is the income passport for the gig economy** — a portable, verifiable, worker-owned financial identity that makes every dollar of gig earnings count toward financial access.

**For MVP (Solo Founder, 0–6 months):** Focus exclusively on the gig worker use case. Generate a professional, lender-ready Income Verification Report as a downloadable PDF and shareable link. Everything else is roadmap.

---

## 4. User Personas

### Persona A: Full-Time Gig Worker — "Maria"
- **Age:** 28–42 | **Income:** $50K–$90K | **Platforms:** 2–4 simultaneously
- **Goal:** Car loan, apartment lease, personal loan, or mortgage
- **Blocker:** No W-2, can't prove income to lender's satisfaction
- **Tech comfort:** High (uses gig apps daily); expects mobile-first
- **Willingness to pay:** $10–$29/month if it gets them a loan approval

### Persona B: Part-Time Gig Hustler — "Dev"
- **Age:** 22–35 | **Income:** $20K–$50K from gigs on top of other income
- **Goal:** Apartment, credit card, or small personal loan
- **Blocker:** Traditional employer income is primary; gig income is invisible to lender
- **Willingness to pay:** Lower; more price-sensitive; one-time report preferred

### Persona C: Lender / Credit Union Underwriter — "Sam"
- **Age:** 30–55 | **Role:** Loan processor, mortgage underwriter at regional bank or credit union
- **Goal:** Fast, defensible documentation for non-QM or alt-doc loan files
- **Blocker:** Manual review of bank statements takes 3–5 hours per file
- **Willingness to pay:** $50–$150/verification or API subscription

---

## 5. MVP Feature Scope

### 5.1 Core MVP (Weeks 1–12)

#### F-01: Gig Platform Connection (OAuth / API)
- User authenticates with up to 3 gig platforms (Uber, Lyft, DoorDash, Instacart, Upwork, Fiverr, Amazon Flex, Grubhub)
- Use **Argyle API** or **Pinwheel API** as the data layer (do NOT build raw OAuth scrapers — use existing infrastructure)
- Argyle covers ~75% of US workers and 300+ gig platforms out of the box
- Store only processed/derived data, not raw credentials
- Connection health indicator (last synced, data freshness)

#### F-02: Income Aggregation Engine
- Pull last 24 months of earnings per platform
- Normalize to weekly/monthly/annual views
- Combine multi-platform income into unified ledger
- Flag anomalies: sudden gaps, declining trends, one-time spikes

#### F-03: Income Scoring Model
**Inputs:**
- Gross monthly income (rolling 3, 6, 12-month averages)
- Income stability index (coefficient of variation of monthly earnings)
- Platform tenure (months active per platform)
- Platform diversity score (number of active platforms)
- Income trajectory (linear regression slope over last 12 months)
- Estimated annualized income (seasonally adjusted)

**Output metrics (shown to worker):**
- Annualized Income Estimate
- Income Consistency Score (0–100)
- Earning Trend (Positive / Stable / Declining)
- Lender-Ready Status (Green / Yellow / Red with improvement tips)

*Note: This is NOT a credit score. Do not represent it as such. It is an income verification metric.*

#### F-04: Lender-Ready Report Generation (PDF)
Core deliverable. A professional PDF document containing:
1. **Cover Page** — Worker name, report date, Krostio verification seal
2. **Income Summary Table** — Monthly gross by platform, trailing 12/24 months
3. **Annualized Projection** — With methodology footnote (trailing 12-month average × 12, seasonally adjusted)
4. **Income Consistency Analysis** — Visual chart of monthly earnings + volatility band
5. **Platform Profile** — Per-platform: start date, total earnings, rating/status (if available via API)
6. **Trajectory Statement** — Plain-English summary: "Income has grown X% over 12 months"
7. **Verification Statement** — Signed/attested: "Data sourced directly from [platforms] via authenticated API connection. Not self-reported."
8. **Appendix** — Raw monthly earnings table, data source log

Report generated as: downloadable PDF + shareable link (with access expiry options: 7 days, 30 days, one-time view)

#### F-05: Shareable Income Link
- Unique, expiring URL the worker sends to a lender
- Lender sees read-only, branded report view
- Worker can revoke access at any time
- Optional: require lender email to access (creates lender lead)
- Access log: worker sees who viewed their report and when

#### F-06: Worker Dashboard
- Connected platforms overview
- Income trend chart (12-month sparkline per platform + combined)
- Current annualized income estimate (prominently displayed)
- Report history (all generated reports)
- Platform connection status and data freshness
- One-click "Generate New Report" CTA

#### F-07: Auth & Onboarding
- Email + password or Google OAuth signup
- Onboarding flow: 4 steps (what's this, connect a platform, see your income, generate report)
- Guided empty state (no data yet → prompt to connect)
- Email verification

#### F-08: Billing (Stripe)
- **Free Tier:** Connect 1 platform, see income summary, no PDF
- **Pro ($19/mo):** Connect up to 5 platforms, unlimited PDF reports, shareable links, 24 months history
- **One-Time Report ($9):** Single PDF generation, no subscription, 1 platform, 12-month data
- Annual discount: 2 months free

---

### 5.2 Post-MVP — Phase 2 (Months 4–9)

#### F-09: Lender Portal
- Separate lender-side account
- Receive income verification requests from workers
- Bulk download verified reports
- API access for lenders wanting to integrate into loan origination software
- Pricing: $99/month for up to 50 verifications, $199/month for 150

#### F-10: Tax Document Integration
- Import IRS 1099-K data (via IRS API or Plaid Tax)
- Cross-reference platform earnings vs. 1099 tax data
- Discrepancy alerts ("Your reported gig income matches your 1099-K within 5%")

#### F-11: Income Improvement Tips
- Contextual nudges: "Adding a second platform could increase your Consistency Score by 12 points"
- Best earning hours/periods by platform
- Estimated impact of stable earnings schedule on report quality

#### F-12: Lender Directory & Warm Leads
- Directory of lenders that accept Krostio reports
- Worker clicks "Find a Lender" → sees partner lenders sorted by loan type
- Affiliate/referral revenue from lender partners ($50–$200 per funded loan)
- This is the **high-margin monetization path** — referral fees at scale dwarf subscription revenue

#### F-13: Automated Report Refresh
- Monthly auto-refresh for Pro subscribers
- Alert when income drops below a threshold (for workers managing loan covenants)
- "Share Latest Report" auto-sends updated report to saved lender contacts

---

### 5.3 Phase 3 — Platform Play (Months 9–18)

#### F-14: White-Label Reports for Gig Platforms
- DoorDash, Uber, etc. could offer Krostio as a driver benefit
- Platform pays per-user fee; drivers get free verification as perk
- This is the B2B2C moat: platform distribution + worker trust

#### F-15: API for Non-QM Lenders
- REST API for lenders to pull verified income data directly into LOS (Loan Origination Software)
- Webhook for income updates
- MISMO-compatible data format (mortgage industry standard)

#### F-16: Rent Verification
- Landlords and property managers accept Krostio reports in lieu of paystubs
- Separate landlord portal; separate pricing ($25/verification)

---

## 6. Feature Flow & User Journey

### 6.1 First-Time User Flow

```
Landing Page
  └─▶ CTA: "Check Your Income Score Free"
        └─▶ Signup (email or Google)
              └─▶ Onboarding Step 1: "What is Krostio?" (30s explainer)
                    └─▶ Step 2: Connect your first platform (OAuth via Argyle)
                          └─▶ Step 3: Loading → Income data pulled (10–30 sec)
                                └─▶ Step 4: Income Summary Preview
                                      ├─▶ [Free] See annualized estimate + trend
                                      └─▶ [Upgrade] Full PDF report → Paywall
                                            └─▶ Stripe checkout ($9 one-time or $19/mo)
                                                  └─▶ Report generated → Download + Share link
```

### 6.2 Returning User Flow (Pro Subscriber)

```
Dashboard Login
  └─▶ Dashboard: income overview, connected platforms, report history
        ├─▶ "Generate New Report" → instant PDF with latest data
        ├─▶ "Share Report" → copy shareable link / email to lender
        ├─▶ "Connect Another Platform" → add Lyft to existing Uber connection
        └─▶ "View Report History" → all past reports with viewer logs
```

### 6.3 Lender-Side Flow (Phase 2)

```
Worker shares link
  └─▶ Lender receives URL (email or copy-paste)
        └─▶ Lender enters their email to access (access-gated)
              └─▶ Reads branded Income Verification Report
                    ├─▶ Download PDF button
                    ├─▶ "Request Worker Consent for API Access" → sends worker notification
                    └─▶ "Find More Workers" → Lender portal CTA (Phase 2 upsell)
```

---

## 7. Business Logic & Scoring Algorithm

### 7.1 Annualized Income Calculation

```
annualized_income = mean(monthly_earnings[-12:]) × 12
```

If fewer than 6 months data: flag as "Preliminary Estimate — Insufficient History"  
If seasonal adjustment needed: apply platform-specific seasonality multiplier (e.g., food delivery peaks Nov–Jan; rideshare peaks summer)

### 7.2 Income Consistency Score (0–100)

```
cv = std(monthly_earnings[-12:]) / mean(monthly_earnings[-12:])
consistency_score = max(0, 100 - (cv × 100))
```

- 80–100: Highly consistent (strong positive signal to lenders)
- 60–79: Moderate consistency (acceptable for most loans)
- Below 60: High volatility (flag with explanatory note, not automatic denial signal)

### 7.3 Income Trajectory

Linear regression on last 12 months of monthly earnings:
- Slope > 3%/month: **Growing** 🟢
- Slope -3% to +3%: **Stable** 🟡
- Slope < -3%/month: **Declining** 🔴

Include confidence interval (R² value) to indicate reliability of trend.

### 7.4 Platform Diversity Score

```
diversity_score = min(100, (num_active_platforms / 4) × 100)
```

Rationale: Workers on 4+ platforms demonstrate market adaptability and have more redundancy (less single-platform dependency risk).

### 7.5 Report Verification Statement (Legal/Compliance)

The report must clearly state:
- Data sourced via consumer-permissioned OAuth connections to gig platforms
- Data is not self-reported; pulled directly from platform APIs
- Krostio is an income verification tool, not a credit reporting agency (not subject to FCRA as a verifier of self-provided data — **requires legal review**)
- Report reflects earnings data as of [date]; lender should verify currency of data
- Krostio makes no representation regarding creditworthiness

**Compliance flags for solo founder:**
- DO NOT call this a "credit score" or "credit report" — FCRA liability
- DO NOT store Social Security Numbers
- Clearly display data access permissions granted by user
- GDPR/CCPA data deletion rights must be implementable
- Consult a fintech attorney before launch; Clerky or Stripe Atlas legal packages are starting points

---

## 8. Implementation Gap Analysis: income-verifier-delta.vercel.app

The existing site at `income-verifier-delta.vercel.app` is analyzed as a **concept marketing shell**. Here is a full gap matrix:

### 8.1 What Exists

| Element | Status |
|---|---|
| Landing page with value proposition | ✅ Exists (well-written) |
| "How It Works" 3-step marketing copy | ✅ Exists |
| Pricing tiers ($29 worker, $99 lender) | ✅ Exists |
| Register/Login routes (`/register`, `/login`) | ✅ Routes exist |
| Check Score page (`/check-score`) with 8 platform buttons | ✅ Exists (UI only) |
| Blockchain/on-chain attestation language | ✅ Marketed |

### 8.2 Critical Missing Implementations (The Gaps)

| Gap | Severity | Notes |
|---|---|---|
| **No actual platform OAuth connections** | 🔴 CRITICAL | The 8 platform buttons on `/check-score` are non-functional. No Argyle/Pinwheel/Plaid API integration exists. Clicking a platform does nothing. |
| **No income data ingestion** | 🔴 CRITICAL | Zero backend data pipeline. No earnings data is ever fetched, stored, or processed. |
| **No scoring engine** | 🔴 CRITICAL | The "300–850 credit score" mentioned in marketing has no underlying algorithm. No computation occurs. |
| **No PDF/report generation** | 🔴 CRITICAL | Core deliverable promised ("lender-ready documentation") does not exist. |
| **Register/Login pages are empty shells** | 🔴 CRITICAL | `/register` and `/login` pages render the nav bar only — no form, no auth, no backend. |
| **No Stripe or payment integration** | 🔴 CRITICAL | Pricing page is marketing copy only. No subscription flow, no checkout. |
| **No database / backend** | 🔴 CRITICAL | Static Vercel deployment with no API routes or database integration |
| **Blockchain attestation is pure marketing** | 🔴 CRITICAL | "On-chain attestation on Base L2" is copied language. No wallet, no smart contract, no attestation exists. |
| **No shareable report links** | 🔴 HIGH | Feature marketed but not built |
| **No lender portal** | 🟡 MEDIUM | Appropriate for MVP phase 2, but marketed as current feature |
| **"2,000+ gig workers already verified" counter** | 🟡 HIGH | This is fabricated social proof on a non-functional product — legal/ethical risk if used in production |
| **No mobile optimization for auth flows** | 🟡 MEDIUM | The landing page is responsive; sub-pages are not tested |
| **No privacy policy or terms of service** | 🟡 MEDIUM | Required before collecting any user data |
| **Documentation/API Reference/Blog links** | 🟢 LOW | Footer links go to `#` — acceptable for pre-launch |

### 8.3 Blockchain/On-Chain Attestation — Strategic Assessment

The existing implementation markets "on-chain attestation on Base L2" heavily. This is a significant strategic mismatch for a solo micro-SaaS founder:

**Problems with the blockchain approach:**
1. **Technical complexity:** Smart contract development, wallet UX, gas fees, and L2 bridge integration are 3–6 months of solo engineering effort before any core product is built
2. **User friction:** Gig workers do not have wallets. Forcing wallet creation to access income verification adds 80%+ drop-off at onboarding
3. **Lender skepticism:** Traditional lenders (banks, credit unions) will not accept "on-chain attestation" as a compliance-satisfying verification mechanism in 2025–2026. They need PDFs, not blockchain hashes
4. **Regulatory uncertainty:** On-chain financial attestations introduce regulatory questions that remain unresolved
5. **It solves a problem that doesn't exist:** Income verification fraud is prevented by OAuth directly to the platform source, not by writing a hash on-chain

**Recommendation:** Drop blockchain language entirely from MVP. It is a vanity feature that impresses developers, not lenders or gig workers. If cryptographic proof is desired, use standard PDF digital signatures (PKI) instead — lenders understand and trust these. The attestation story: "We connect directly to your platform account via their official API. The data is not self-reported. Here's the API connection log." That is more compelling to a loan officer than a Base L2 transaction hash.

### 8.4 Gap Priority Matrix

| Priority | Gap to Close | Effort (Solo) | Week Target |
|---|---|---|---|
| P0 | Auth (Supabase or Clerk) | 1–2 days | Week 1 |
| P0 | Argyle API integration (OAuth to 1 platform) | 3–5 days | Week 1–2 |
| P0 | Income data ingestion + storage | 3–5 days | Week 2–3 |
| P0 | Scoring algorithm | 2–3 days | Week 3 |
| P0 | PDF report generation (react-pdf or Puppeteer) | 3–5 days | Week 3–4 |
| P0 | Stripe billing (subscription + one-time) | 2–3 days | Week 4–5 |
| P1 | Shareable report link | 2–3 days | Week 5–6 |
| P1 | Dashboard (charts, report history) | 3–5 days | Week 6–7 |
| P1 | Privacy Policy + Terms of Service | 1 day + legal review | Week 4 |
| P2 | Multi-platform connections (3+) | 2–3 days | Week 8 |
| P2 | Lender access portal | 1 week | Month 3 |
| P3 | Blockchain anything | Skip for MVP | Never (reframe as Phase 3 exploration) |

---

## 9. Tech Stack Recommendations (Solo Founder)

### 9.1 Recommended Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Vercel-native, already deployed there; SSR for report pages |
| **Auth** | Clerk | 10-min setup, handles OAuth, free up to 10K MAU |
| **Database** | Supabase (Postgres) | Free tier generous; Row Level Security for data isolation; real-time subscriptions |
| **Gig Data API** | Argyle API | Covers 300+ platforms including all 8 on existing site; consumer-permissioned OAuth; pay-per-use |
| **Alternative Data API** | Pinwheel (if Argyle too expensive) | Similar coverage, different pricing model |
| **PDF Generation** | react-pdf + Puppeteer (server-side) | react-pdf for template; Puppeteer for pixel-perfect renders |
| **Payments** | Stripe | Subscriptions + one-time payments; Stripe Tax handles compliance |
| **File Storage** | Supabase Storage (S3-compatible) | Store generated PDFs; signed URLs for time-limited access |
| **Email** | Resend + React Email | Transactional emails (report ready, sharing notification) |
| **Analytics** | PostHog (self-hostable) | Funnel analysis; free tier sufficient for early stage |
| **Error Monitoring** | Sentry | Free tier; critical for financial data flows |
| **Hosting** | Vercel | Already there; zero-config Next.js deployment |

### 9.2 Argyle API Integration Pattern

```typescript
// Argyle Link initialization (drop into your onboarding flow)
import { useArgyleLink } from '@argyleio/argyle-js'

const { open } = useArgyleLink({
  pluginKey: process.env.NEXT_PUBLIC_ARGYLE_PLUGIN_KEY,
  userToken: userArgyleToken, // fetched from your backend
  onSuccess: (accountId) => {
    // accountId is now linked; call your backend to pull income data
    syncPlatformIncome(accountId)
  },
  onError: (error) => handleError(error),
})
```

```typescript
// Backend: Pull income data via Argyle REST API
async function fetchGigIncome(accountId: string, userId: string) {
  const paymentsRes = await fetch(
    `https://api.argyle.com/v2/payments?account=${accountId}&limit=200`,
    { headers: { Authorization: `Bearer ${process.env.ARGYLE_API_KEY}` } }
  )
  const { results } = await paymentsRes.json()

  // Normalize and store to Supabase
  const normalized = results.map(p => ({
    user_id: userId,
    platform: p.account.employer,
    amount: p.net_pay, // or gross_pay depending on use case
    period_start: p.pay_period_start,
    period_end: p.pay_period_end,
    payment_date: p.payment_date,
  }))

  await supabase.from('earnings').upsert(normalized)
}
```

### 9.3 PDF Report Generation Pattern

```typescript
// Using react-pdf for templated reports
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export function IncomeReport({ worker, earnings, score }) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Income Verification Report</Text>
          <Text style={styles.subtitle}>Prepared by Krostio</Text>
          <Text>Verification Date: {format(new Date(), 'MMMM d, yyyy')}</Text>
        </View>
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>Income Summary</Text>
          <Text>Annualized Income Estimate: ${score.annualizedIncome.toLocaleString()}</Text>
          <Text>Consistency Score: {score.consistencyScore}/100</Text>
          <Text>Trend: {score.trajectory}</Text>
        </View>
        {/* Monthly earnings table, platform breakdown, verification statement */}
      </Page>
    </Document>
  )
}

// Server-side: render to buffer and store
import { renderToBuffer } from '@react-pdf/renderer'

const pdfBuffer = await renderToBuffer(<IncomeReport {...props} />)
const { data: file } = await supabase.storage
  .from('reports')
  .upload(`${userId}/${reportId}.pdf`, pdfBuffer, { contentType: 'application/pdf' })
```

---

## 10. Go-to-Market Strategy (Solo Founder)

### 10.1 Pre-Launch (Month 0)

- **Waitlist landing page:** Simple email capture with the DoorDash driver story. No product yet. Goal: 500 signups before launch.
- **Channels:** Reddit (r/doordash_drivers, r/uberdrivers, r/personalfinance, r/freelance), Facebook Groups for gig workers, TikTok/Instagram short videos framing the $62K denial story
- **Positioning:** "The app DoorDash should have built for you"

### 10.2 Launch (Month 1–2)

- **Product Hunt:** Coordinate a PH launch day with pre-warmed community
- **Press angles:** "76 million gig workers can't get loans despite earning six figures — this app fixes that" → pitch to TechCrunch, The Information, Bloomberg tech
- **Affiliate DMs:** Reach out to gig economy YouTube creators (100K–1M subscriber channels covering Uber/DoorDash driving tips) with free Pro accounts in exchange for coverage

### 10.3 Growth (Month 3–6)

- **SEO content:** "How to prove income as a DoorDash driver," "Can Uber drivers get mortgages," "1099 income verification for car loans" — extremely low competition, high commercial intent keywords
- **Lender partnerships:** Approach 10 non-QM mortgage lenders and credit unions with a proof-of-concept. Offer first 6 months of lender portal free in exchange for case study.
- **Platform partnerships:** Contact driver community managers at DoorDash/Uber about offering Krostio as a driver benefit (long shot but high upside)

### 10.4 Revenue Projections (Conservative, Solo Founder)

| Month | Paying Users | MRR | Notes |
|---|---|---|---|
| M1 | 50 | $500 | Early adopters, waitlist conversion |
| M3 | 200 | $2,800 | Organic growth + PH |
| M6 | 600 | $8,000 | SEO begins producing |
| M9 | 1,200 | $17,000 | Lender portal launched |
| M12 | 2,500 | $38,000 | Referral + lender affiliate fees |

**Path to $50K MRR:** 2,500 Pro subscribers ($19/mo) = $47.5K. Achievable within 12 months with strong community SEO and 2–3 lender partnerships generating referral volume.

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Argyle API pricing too high for consumer B2C margins | HIGH | HIGH | Negotiate per-user pricing; model unit economics before launch; consider Truv (lower cost) |
| Gig platforms block OAuth / change API | MEDIUM | HIGH | Use Argyle/Pinwheel as buffer layer — they maintain integrations; contract guarantees |
| FCRA classification if used in adverse action | MEDIUM | HIGH | Legal review; clearly disclaim as worker-requested verification tool, not CRA report |
| Workers unwilling to grant OAuth to earnings data | MEDIUM | HIGH | Education-first onboarding; emphasize user controls, revocation, zero credential storage |
| Incumbents (Argyle, Moves) launch consumer product | LOW | HIGH | Build community moat and lender relationships before they pivot |
| Low conversion free → paid | MEDIUM | MEDIUM | Gate PDF generation behind paywall; free tier shows data but not export |
| Data breach of earnings data | LOW | EXTREME | Encrypt at rest, never store gig credentials, SOC2 roadmap (Year 2) |

---

## 12. Success Metrics

### 12.1 North Star Metric
**Reports Generated** — every report is a worker who can potentially get a better loan. Tracks both activation and value delivery.

### 12.2 Leading Indicators
| Metric | Week 4 Target | Month 3 Target | Month 6 Target |
|---|---|---|---|
| Platform connections completed | 100 | 500 | 2,000 |
| Reports generated | 80 | 400 | 1,800 |
| Free → Paid conversion | 15% | 20% | 25% |
| Report share rate (shared with lender) | 40% | 50% | 60% |
| Churn rate (monthly, Pro) | <15% | <10% | <7% |
| Lender portal signups | — | 5 | 20 |

### 12.3 Qualitative Signals
- Workers report successful loan approval citing Krostio report (collect testimonials)
- Lenders proactively request Krostio reports from workers
- Gig platform community moderators recommend the tool organically

---

## 13. Definition of Done — MVP

The MVP is complete and ready for paid users when:

- [ ] User can sign up with email/Google and verify account
- [ ] User can connect at least 1 gig platform via Argyle OAuth
- [ ] Income data is ingested and stored (last 12 months minimum)
- [ ] Scoring engine computes Annualized Income, Consistency Score, and Trajectory
- [ ] A professionally formatted PDF report is generated on demand
- [ ] Report is downloadable and sharable via expiring link
- [ ] Stripe subscription ($19/mo) and one-time ($9) payments process correctly
- [ ] Free tier is properly gated (income summary visible, PDF blocked)
- [ ] Privacy Policy and Terms of Service are live
- [ ] Data deletion request flow works
- [ ] No fabricated social proof metrics are displayed
- [ ] Report includes accurate, legally sound verification language (reviewed by counsel)

---

## 14. Open Questions for Founder Decision

1. **Argyle vs. Pinwheel:** Which API vendor for data layer? (Evaluate pricing per-call vs. per-seat before committing)
2. **FCRA counsel:** Who is the fintech attorney to engage before launch? Budget $2,000–$5,000 for initial review.
3. **"Krostio" vs. "Income Verifier":** The existing domain uses "Income Verifier" — a generic name that is hard to brand and impossible to rank for. "Krostio" (from the original idea email) is more defensible. Decide and register domain.
4. **Blockchain pivot or full drop:** Recommend drop entirely for MVP. Revisit only if there is demonstrated lender demand for cryptographic attestation.
5. **One-time report vs. subscription first:** Consider leading with a $9 one-time report to lower the barrier and prove value before asking for subscription.

---

*Document prepared for solo micro-SaaS founder pursuing the Krostio / Income Verifier opportunity. Next step: validate Argyle API pricing against unit economics model before writing a single line of product code.*

---
**Document Control**  
PRD v1.0 | May 2026 | For internal founder use | Confidential
Krostio_PRD.md
Displaying Krostio_PRD.md.