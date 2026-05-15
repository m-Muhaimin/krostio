# [ARCHIVED] Competitive Intelligence Report — Krostio
> **ARCHIVED:** This file was generated during initial research. It uses the old brand name "Krostio" throughout and has been superseded by `competitive-intel-output.md` (which uses "Krost"). Do not edit — kept for historical reference.

> Phase 2 (Market): Competitive landscape analysis.
> Produced: May 15, 2026
> Next review: when any competitor raises >$10M or launches a scoring product

---

## Market Overview

**The space:** Gig-worker income verification sits at the intersection of 5 categories — income data aggregation, alternative credit scoring, credit building, DeFi identity/credit, and employer verification. No single company fully occupies the "income-based, multi-platform, worker-owned, cryptographically attested credit score" niche Krostio is building.

**Market size:** 64M US gig workers (Upwork estimate). $1T+ annual platform earnings (Freelancers Union). The addressable market is any worker who has been denied credit due to "unverifiable income" — estimated 30-40M Americans.

**Key trend:** Regulators (CFPB, state AGs) are increasingly scrutinizing FCRA compliance for alternative data scoring. Products that use 300-850 scales without being recognized credit scores face legal risk. This is both a threat (compliance overhead) and an opportunity (solutions that make the compliance distinction clear have an advantage).

---

## Category 1: Direct Competitors — Gig Worker Credit Scoring

Companies whose core product is a credit-like score for gig workers.

| Company | Platforms | Score Type | Blockchain | Pricing | Notes |
|---------|-----------|------------|------------|---------|-------|
| **ecreditumo** | Uber, Lyft, DoorDash (3) | 300-850 alt. credit | No | ~$20/mo worker | First mover; centralized; no on-chain attestation |
| **Wollit** | Bank account (one-source) | Credit-building report | No | Free/Pro tier | UK-only; more "credit building" than scoring |
| **Movulu/Moves Financial** | Bank account | Cash-flow underwriting | No | Free for workers | Focus on thin-file immigrants; bank-model not gig-platform model |
| **WorkWise Credit** | Not publicly launched | Unknown | Unknown | Unknown | Pre-seed; very little public info |

**Krostio's position vs direct:** Strongest multi-platform support (6 platforms vs 3 for ecreditumo). Only company doing on-chain attestation. Only company with a full four-pillar ecosystem (score + ledger + reports + passport).

---

## Category 2: Income Data Aggregators (Largest threat / likely partners)

Companies that provide raw income data — the "picks and shovels" layer. If any of these build a scoring layer on top of their data, they become direct competitors.

| Company | Platform Coverage | Score/Branding | Pricing | Threat Level |
|---------|-----------------|----------------|---------|--------------|
| **Plaid** | 12,000+ banks + some gig via Argyle partnership | No score; raw data | $0.50-2.00/verification (lender pays) | HIGH — they have the data, the lender trust, the brand. If Plaid launches "Plaid Income Score," it's game over for pure aggregators. |
| **Argyle** | 450+ payroll + gig (Uber, Lyft, DoorDash) | No score; employment data | Enterprise (B2B) | HIGH — closest to building a score. Already has gig data pipes. $55M raised. |
| **Finicity (Mastercard)** | 90% of US financial institutions | No score; open banking data | Usage-based | LOW velocity on gig — enterprise open banking play |
| **Truv** | 40+ payroll + gig (Uber, Lyft, DoorDash) | No score; employment data | $15-25/verification | MEDIUM — positioned as "cheaper Argyle" but no scoring |
| **Pinch** | Payroll + gig (platform play) | No score | $10/verification | LOW — small, early |
| **Rollee** | 20+ platforms (EU-gig focused) | No score | €5-15/verification | LOW — EU-only |
| **Stripe / Stripe Connect** | Platform earnings (if using Stripe) | No score; raw data | In-platform free | LOW for now — no public scoring product; could add one if 1099 users grow |

**Key insight:** No data aggregator has launched a scoring product. They're all API-first data providers. Krostio's value is the scoring engine + attestation layer built on top. But Plaid and Argyle represent existential threats if they add scoring.

**Adjacent threat:** Payroll platforms (Gusto, Rippling, ADP) have gig-worker earnings data. If they partner with lenders directly, they bypass the need for a dedicated score.

---

## Category 3: Alternative Credit Scoring — General

Products that score thin-file/no-file consumers using non-traditional data. Not gig-specific but overlap on audience.

| Company | Data Source | Score Output | Gig-Specific? | Notes |
|---------|-------------|--------------|--------------|-------|
| **UltraFICO** | Bank account cash flow | FICO-like | No | Pilot stalled; partner dependency |
| **LexisNexis RiskView** | Utility, phone, property | Credit-attachment score | No | Fragmented data; not real income |
| **Nova Credit** | Cross-border credit history | Credit passport | No | Immigrant-focused; not gig-specific |
| **Zest AI** | ML on alternative data | Custom per-lender | No | B2B model builder — lender must integrate |
| **Upstart** | Education, employment, FICO | Upstart Score | No | Gig worker as *type* but not platform-native |

**Krostio's position vs alt scoring:** Most alt scoring targets general thin-file population. None are gig-platform-native. None do on-chain attestation.

---

## Category 4: Credit-Builder / Financial Health Apps

Products gig workers might use *instead* of or *in addition to* Krostio.

| Company | Mechanism | Cost | Gig Workers Served? | Notes |
|---------|-----------|------|--------------------|-------|
| **Self** | CD-secured loan → bureau reporting | $25/mo | Indirectly (reports FICO) | Long timeline (12-18mo to see score impact) |
| **Chime Credit Builder** | Secured card → bureau reporting | Free | No special gig treatment | Requires Chime account |
| **Kikoff** | Credit line → bureau reporting | $0-10/mo | No special gig treatment | Reports as installment loan |
| **Grow Credit** | Subscription payments → bureau | $0-18/mo | No | Reports as revolving credit |
| **Earnin** | Pay advance, not scoring | Tips | Yes (earnings-linked) | Not a score — it's earned-wage access |
| **Float** | Income-linked credit for gig workers | Subscription | Yes (gig-native) | Closest overlap: estimates buying power from gig income |

**Float note:** Float is the most interesting overlap. They estimate "how much you can afford" based on gig income history. They're more "lending" than "scoring" — they issue their own credit products. Not a scoring infrastructure play.

---

## Category 5: DeFi Credit / Identity Protocols

Blockchain-native solutions that overlap with Krostio's Passport pillar.

| Protocol | Chain | Product | Status | Notes |
|----------|-------|---------|--------|-------|
| **Cred Protocol** | Polygon | On-chain credit score | DeFi-only | Score derived from on-chain behavior (repayments, liquidations). No real-world income data. |
| **CreDA** | Ethereum | Cross-chain credit | DeFi-only | Credit-to-earn model. No off-chain income data. |
| **Spectral** | Ethereum | On-chain credit scoring (ML) | Risk score for DeFi | No real-world income. |
| **Privado ID (ex Polygon ID)** | Polygon | Decentralized identity | Identity infra | Not a credit score — identity and credential verification. |
| **Sismo** | Ethereum | Soul-bound identity | Community identity | Not financial. |
| **Humanity Protocol** | Polygon | Proof-of-humanhood | Identity | Not credit. |
| **Worldcoin/ID** | World Chain | Proof-of-humanhood | Identity | Distributed token + identity. Not a credit score. |

**Key insight for Krostio:** No DeFi protocol connects real-world gig income to an on-chain credit score. Krostio's Passport (SBT on Base L2 tied to verified income data) is the first product to bridge real-world and on-chain credit. This is genuine whitespace.

---

## Category 6: Traditional Employer Verification

The "old way" lenders verify income — mostly fails for gig workers.

| Company | Coverage | Gig Coverage | Cost |
|---------|----------|-------------|------|
| **The Work Number (Equifax)** | 70M+ US employees (W-2) | Minimal (requires employer enrollment) | $10-25/verification |
| **Truework** | Employer-verified employment | Growing gig employer enrollment | Free for employees; lender pays |
| **Verification Exchange (VX)** | Direct employer data | Payroll platform data | Custom |
| **Manual / Statement Review** | Docs the applicant provides | Any (PDFs, bank statements) | High labor cost |

**Krostio's position:** Gig workers are invisible to all of these. The Work Number literally cannot verify them. This is the core pain Krostio solves.

---

## Strategic Whitespace Summary

| Whitespace | Occupied by? | Krostio's advantage |
|------------|-------------|-------------------|
| **Multi-platform gig income → standardized score** | No one fully owns this. ecreditumo has 3 platforms. | 6 platforms (more in development). First scoring engine built for gig platforms. |
| **On-chain attestation of real-world income** | No protocol. DeFi protocols score DeFi behavior only. | Passport SBT on Base L2. Account abstraction so workers need no wallet. |
| **Worker-owned, portable credit identity** | No company. Data aggregators hold the data. | Worker controls authorization, can revoke, identity follows them. |
| **Lender API + worker subscription model** | No company. Aggregators charge lenders per-query. | Dual revenue: worker subscription ($29/mo) + lender access ($99-299/mo). |
| **Four-pillar ecosystem (score + ledger + reports + passport)** | No company. Pure whitespace. | Each pillar is a standalone value prop. Together they create lock-in. |

---

## Positioning Document

### One-Liner

> "Krostio turns gig platform earnings into a verified, portable, on-chain credit score — that any lender can accept in seconds, without W-2s or document review."

### Target ICPs

**ICP 1: The Rejected Gig Worker**
- Demographics: Uber/DoorDash driver, 25-40, earns $3-6K/mo across 2-4 platforms
- Pain: Denied for auto loan, apartment, or credit card because bank "can't verify income"
- Desire: A credit score that reflects their actual earnings, not their W-2 status
- Trigger: "I've been driving for 2 years and still can't get a car loan"

**ICP 2: The Forward-Thinking Lender**
- Demographics: Credit union VP of Lending, fintech credit officer, DeFi protocol lead
- Pain: Turning away 30%+ of applicants who have good cash flow but no W-2. Manual income verification costs $25-50 per file.
- Desire: A standardized, queryable, verifiable credit score for any gig worker — API call, 3 seconds, done
- Trigger: "We know we're leaving money on the table with gig workers but our underwriting rules are rigid"

**ICP 3: The Gig Platform (B2B upsell)**
- Demographics: Uber, DoorDash, Lyft driver relations / product teams
- Pain: Drivers churn because they can't convert gig earnings into credit access (mortgage, car loan)
- Desire: Offer credit access as a driver benefit → retention → loyalty
- Trigger: "If we could help drivers get car loans through their earnings dashboard, would they stay longer?"

### Competitive Positioning Table

| When they say... | We win because... |
|------------------|------------------|
| "We already use Plaid" | Plaid gives underwriters raw data to interpret. Krostio gives a verified, standardized score in 3 seconds. Use Plaid for bank verification, Krostio for gig income scoring. Different layers. |
| "We use Argyle for income data" | Argyle returns employment data — Krostio returns a credit score with attestation. Argyle is the data pipe; Krostio is the credit decision signal. |
| "ecreditumo does this" | ecreditumo is centralized with 3 platforms. Krostio has 6 platforms + on-chain attestation + worker-controlled revocation. Their scores vanish if they shut down; Krostio scores live on-chain forever. |
| "FICO is the standard" | FICO leaves 64M gig workers invisible. They have no model for gig income. Krostio is not a FICO replacement — it's a gig-income-native score lenders layer alongside FICO for this underserved market. |
| "We already ask for bank statements" | Manual review costs $25-50 per file and takes 3-5 business days. Krostio is $0.15-0.50 per query, 3 seconds. And gig workers' income is spread across 3+ accounts — a single bank statement is incomplete. |
| "Credit builders (Self/Chime) work fine" | Those build FICO over 12-18 months. Krostio proves earning power TODAY. A worker with 2 years of $5K/mo Uber income can get a 731 Krost Score in 2 minutes. |
| "DeFi lending uses on-chain reputation" | On-chain reputation only scores DeFi behavior (repayments, liquidations). Krostio bridges real-world gig income to on-chain attestation. A worker with no on-chain history gets a score from their Uber earnings. |
| "We do manual income review" | Manual review is not scalable. Every underwriter is a bottleneck. Krostio is the first automated, auditable income verification signal that works for gig income patterns. |

### Key Differentiators

1. **Multi-platform by design** — 6 platforms (Uber, DoorDash, Lyft, Instacart, Upwork, Fiverr) connected via Plaid/OAuth. Single-platform scores miss half the gig picture. Krostio rewards multi-platform diversity.

2. **On-chain attestation** — Scores attested on Base L2 as soul-bound tokens. Verifiable by any party (lender, landlord, regulator). Permanent even if Krostio shuts down. No wallet needed — account abstraction makes it gasless and email-based.

3. **4-factor scoring model** — built for income patterns, not debt behavior. Income Stability (30%), Average Monthly Income (25%), Platform Diversity — weighted, with trajectory overlay. 9 deterministic factors. Transparent — no ML black box.

4. **Worker-owned data** — Worker authorizes each platform connection. Can revoke any time. Can share with specific lenders via expiring links. Full access log. Data aggregators (Plaid, Argyle) hold the data; Krostio workers own it.

5. **Dual revenue model** — Worker subscription ($29/mo) funds the platform. Lender API access ($99-299/mo) funds B2B growth. Aligned incentives: workers pay for their score, lenders pay for verified queries.

### Messaging Pillars

| Pillar | Core Message | Proof Point |
|--------|-------------|-------------|
| **Income Credit** | "Your gig income is real. We give it a credit score." | 9-factor model, 12-month earnings history, 6 platforms connected |
| **Worker Ownership** | "Your financial identity belongs to you. Not a bank. Not a platform. Not us." | Revocable auth, expiring share links, on-chain attestation |
| **Lender Efficiency** | "Instant, verified gig-worker credit decisions without manual document review." | API response in <3s, 10-section PDF report, on-chain verifiable attestation |
| **The Missing Bridge** | "Real-world gig income meets on-chain credit identity." | Account-abstraction wallet, Base L2 SBT, no wallet required for workers |

### Taglines (A/B variants)

1. "Your gig income is real. Own your financial identity." *(current hero — strong, keep)*
2. "The credit score that works for gig workers." *(simple, descriptive)*
3. "Verified income. Portable credit. On-chain attestation." *(feature triad, tech-friendly)*
4. "Turn your Uber earnings into a credit score lenders accept." *(worker-friendly, concrete)*
5. "Krostio: FICO for the 64 million Americans without W-2s." *(category-creating, audacious)*
6. "Your gig earnings are earning you credit — even if FICO doesn't know it." *(emotional, relatable)*

---

## Market Threats to Monitor

1. **Plaid launches a scoring product.** If Plaid adds a "Plaid Income Score" using their bank + payroll data, existing Plaid-integrated lenders would adopt instantly. Mitigation: Plaid's core business is data pipes for 7,000+ fintechs. Launching a scoring product would make them compete with their own customers (like Argyle). They're unlikely to do this without a clear path.

2. **Argyle adds scoring.** Argyle already has gig data from 450+ platforms. Adding a scoring model would be technically easy. Their B2B sales motion (enterprise contracts with lenders) means they'd sell it alongside existing data.
   - Mitigation: Krostio is worker-friendly (subscription model, revocable auth, on-chain ownership). Argyle is enterprise-only data API. Different value props.

3. **Regulatory: FCRA classification.** If any regulator decides income-based scores on a 300-850 scale constitute a "credit report" under FCRA, every company in this space faces compliance costs.
   - Mitigation: Krostio's marketing and product language must explicitly distinguish "Krost Score" from "credit report." The score is an income-consistency metric, not a creditworthiness prediction. Current compliance: "Krost Score" label, 300-850 range but only 4 factors (not 300-850 in the FCRA sense).

4. **Platforms build their own.** Uber could launch "Uber Credit Score" using their own earnings data. DoorDash already issues a DasherDirect card.
   - Mitigation: Platforms are identity-motivated — they want workers on their platform, not lending licenses. Partnering with Krostio (win-win) is more likely than building in-house.

5. **Credit bureaus acquire.** Equifax (The Work Number), Experian (Boost), or TransUnion could buy an income-aggregator + build scoring.
   - Mitigation: Bureaus are slow-moving and regulatory-constrained. They'd need 18+ months to acquire and integrate.
