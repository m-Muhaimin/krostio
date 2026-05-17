# Krostio Competitive Intelligence Matrix

> Generated: 2026-05-16
> Methodology: Public sources, Crunchbase, company websites, product documentation
> Status: FINAL — v1.0 ready for launch

---

## 1. Competitive Landscape Overview

Krostio operates at the intersection of four markets:
- **Alternative Credit Scoring** (reaching gig workers without FICO)
- **Income & Employment Verification** (gig data via Plaid/Argyle)
- **DeFi / On-Chain Identity** (soul-bound credentials on Base L2)
- **Embedded Fintech for Platforms** (Uber, DoorDash, etc.)

The map below shows direct, adjacent, and indirect competitors.

---

## 2. Competitor Deep-Dives

### COMPETITOR 1: Argyle

| Field | Detail |
|---|---|
| **Product** | Direct-source income verification via API. Connects to 25,000+ payroll platforms including gig platforms (Uber, DoorDash, Lyft). Provides employment records, income streams, and pay frequency data to lenders, property managers, and background check companies. |
| **Pricing** | Transactional API pricing. $1–$5 per verification (est.). Enterprise tiers with volume discounts. Not publicly disclosed. |
| **Target Users** | Lenders, mortgage underwriters, property managers, background screeners. B2B-only (no consumer app). |
| **Funding** | $100M+ (Series C, 2022). Backed by Bain Capital Ventures, SignalFire, Point72, Rockefeller Asset Management. |
| **Key Differentiator** | Direct payroll API connections — not bank-statement OCR or user-input. Covers 70%+ of US gig+W-2 workforce. |
| **Weakness** | No consumer-facing brand. No alternative credit scoring (just raw data). No on-chain/self-sovereign component. Platform dependency: if gig platforms revoke API access, revenue model breaks. |
| **Threat to Krostio** | **High** — strongest direct competitor on the data aggregation front. Krostio's Ledger layer overlaps directly with Argyle's core offering. |
| **Krostio Advantage** | Krostio wraps the same data into a proprietary credit score (Krost Score), adds on-chain attestation, and gives workers ownership of their data. Argyle is purely B2B infrastructure. |

---

### COMPETITOR 2: Pinwheel (acquired by Alloy)

| Field | Detail |
|---|---|
| **Product** | Income verification via direct payroll API (similar to Argyle). Also offers direct deposit switching. After acquisition by Alloy (2023), integrated into Alloy's identity verification stack. |
| **Pricing** | Not publicly disclosed. Embedded within Alloy's platform. |
| **Target Users** | Fintechs, neobanks, lenders (same as Argyle — B2B). |
| **Funding** | $100M+ raised before acquisition. Acquired by Alloy (est. $50–100M). Investors: Coatue, Sutter Hill, Firework Ventures. |
| **Key Differentiator** | Direct deposit switching (allows users to re-route payroll to new bank accounts) — a different value prop than pure verification. |
| **Weakness** | Post-acquisition, product roadmap driven by Alloy's priorities. Less independent innovation. No consumer brand. No credit scoring. |
| **Threat to Krostio** | **Medium** — overlaps on data aggregation but Alloy relationship makes it less likely to partner with standalone startups. |
| **Krostio Advantage** | Not dependent on being a piece of a larger identity platform. Krostio is building its own credit product end-to-end. |

---

### COMPETITOR 3: Steady (steadyapp.com)

| Field | Detail |
|---|---|
| **Product** | Consumer app for gig workers to track income, manage finances, and access FDIC-insured banking. Offers cash advances (Earned Wage Access) and income insights. |
| **Pricing** | Free tier with premium subscription ($9.99/mo for advanced features). Also monetizes via transaction data and lending partnerships. |
| **Target Users** | Direct-to-consumer: gig workers and freelancers. |
| **Funding** | $36M (Series B, 2022). Investors: TI Platform Management, Be Curious Partners. |
| **Key Differentiator** | Consumer brand awareness. Gig workers use Steady to "smooth" volatile income. Built-in banking + EWA feature. |
| **Weakness** | No credit scoring. No on-chain component. No lender-facing verification platform. Competing more as a neobank than a credit infrastructure play. Limited to app-based engagement (not shareable links/reports). |
| **Threat to Krostio** | **Medium** — overlaps on consumer-facing gig income tracking but diverges on credit scoring and verification. Could pivot into scoring. |
| **Krostio Advantage** | Krost Score (proprietary 300-850 model) is a genuine differentiator. On-chain Passport gives portability Steady can't match. Krostio Verifier (shareable PDFs + links) serves both sides of the market. |

---

### COMPETITOR 4: Stilt / Arc (fintech for non-traditional borrowers)

| Field | Detail |
|---|---|
| **Product** | **Stilt**: Loans (personal, credit card) for immigrants, international students, and gig workers using alternative data (bank statements, education, work history). **Arc**: AI-powered credit card and financial platform for immigrants. Both owned by Stilt Inc. |
| **Pricing** | APR 11–24%. No subscription fee. Revenue from loan interest + interchange. |
| **Target Users** | Immigrants, international students, gig workers — anyone with thin/no US credit file. |
| **Funding** | Stilt: $187M (debt + equity, Series C 2022). Backed by Visa, Swift Ventures, Y Combinator. |
| **Key Differentiator** | Lending to the "credit invisible" with non-traditional data. Regulatory expertise (partner with a bank). Visa strategic investment. |
| **Weakness** | Loan-product focused (not a verification platform). No on-chain/self-sovereign data. Limited to Stilt's own balance sheet — not enabling third-party lenders. Underwriting model is opaque and proprietary. |
| **Threat to Krostio** | **Medium** — overlaps on alternative credit assessment for thin-file borrowers. Stilt is more established in the immigrant segment (Krostio focuses on gig). |
| **Krostio Advantage** | Krostio is a **platform** (scoring + verification + passport), not a lender. Enables any bank to make gig-friendly decisions. On-chain attestation is unique. Focused exclusively on gig income signals. |

---

### COMPETITOR 5: Nova Credit

| Field | Detail |
|---|---|
| **Product** | Cross-border credit bureau. Aggregates credit histories from 20+ countries so immigrants can port their credit score to the US. Also offers Cash Atlas (bank statement analysis for underwriters). |
| **Pricing** | Enterprise SaaS for lenders. $0.50–$5 per credit pull (est.). Revenue sharing with credit bureaus. |
| **Target Users** | Lenders (Auto, Mortgage, Credit Cards, BNPL) serving immigrant populations. B2B. |
| **Funding** | $125M+ (Series C, 2022). Backed by Canapi Ventures, Kleiner Perkins, Index Ventures, General Catalyst. |
| **Key Differentiator** | Only company with global credit bureau relationships (CRIF, Equifax Canada, etc.). Immigrant credit portability is a unique asset. |
| **Weakness** | Focused on **cross-border** credit, not gig work. Requires traditional credit history in home country — doesn't help gig workers who have no credit anywhere. No on-chain/self-sovereign data. |
| **Threat to Krostio** | **Low-Medium** — adjacent but not overlapping. Nova addresses cross-border immigrants; Krostio addresses gig-native thin-file. Could converge if Nova adds gig data. |
| **Krostio Advantage** | Krostio works for anyone with gig income — no prior credit history needed anywhere. Krostio's data sources (Plaid+Argyle) are US-gig-native. |

---

### COMPETITOR 6: Esusu / Ultra Fintech / RentTrack

| Field | Detail |
|---|---|
| **Product** | **Esusu**: Rent reporting to credit bureaus (Equifax, Experian, TransUnion). Automates rent payment data submission to build FICO scores. **Ultra Fintech**: payroll-connected rent reporting. **RentTrack / RentReporters**: similar rent-reporting services. |
| **Pricing** | Esusu: Free for residents (landlords pay). Revenue from property management platform fees. Ultra: subscription ($5–15/mo for residents). |
| **Target Users** | Renters, property managers, landlords. |
| **Funding** | Esusu: $130M+ (Seed through Series B). Backed by SoftBank, Serena Ventures, Motley Fool Ventures, and others. |
| **Key Differentiator** | Rent is the largest monthly expense — reporting it builds credit without debt. High impact for thin-file consumers. Strong property management integrations (Yardi, RealPage). |
| **Weakness** | Only addresses rent (a single data point). Requires a landlord/property manager to participate. Doesn't capture gig income at all. No on-chain. FICO benefit is limited (not all scoring models weigh rent equally). |
| **Threat to Krostio** | **Low** — different data source (rent vs. gig income). Complementary rather than competitive. Rent reporting builds traditional FICO; Krostio builds alternative score for gig. |
| **Krostio Advantage** | Gig income is a richer and more predictive signal than rent alone. Krostio works without landlord cooperation. Multi-platform aggregation captures total earning power. |

---

### COMPETITOR 7: DeFi Credit / On-Chain Identity Projects

| Field | Detail |
|---|---|
| **Product** | Various: **Cred Protocol** (on-chain credit scoring via DeFi history), **Spectral Finance** (on-chain risk scores), **ArcX** (provenance-based lending), **BrightID** (decentralized identity), **Gitcoin Passport** (soul-bound sybil resistance), **Civic** (on-chain identity verification), **Worldcoin** (proof of personhood). |
| **Pricing** | Typically free at protocol level; revenue from token or protocol fees. |
| **Target Users** | DeFi protocols, DAOs, Web3-native lenders, airdrop distributors. |
| **Funding** | Spectral: $30M (Series A, 2022). Civic: $11M ICO. Worldcoin: $250M+. Generally well-funded but mostly pre-revenue on credit use-cases. |
| **Key Differentiator** | Native composability with smart contracts. Permissionless. Censorship-resistant. Global by design. |
| **Weakness** | **No connection to real-world income.** Most on-chain credit scores are based on on-chain behavior (DeFi positions, liquidation history, wallet age) — irrelevant for gig workers who earn off-chain. Gas fees, UX friction, regulatory uncertainty. Tiny user base vs. US gig economy (64M workers). |
| **Threat to Krostio** | **Low-Medium** — currently separate markets (crypto-native vs. gig-native). Krostio bridges both via Passport on Base. If DeFi credit grows, Krostio's on-chain passport is well-positioned. |
| **Krostio Advantage** | Krostio connects **real-world gig income** to an **on-chain credential** — the best of both worlds. Real wage data gives actual underwriting value; on-chain passport gives portability. Spectral/Cred only see on-chain activity. |

---

## 3. Competitive Matrix Summary

| Dimension | Argyle | Pinwheel | Steady | Stilt/Arc | Nova Credit | Esusu | DeFi Credit | **Krostio** |
|---|---|---|---|---|---|---|---|---|
| **Gig Income Data** | ✅ (API) | ✅ (API) | ✅ (app) | ❌ (bank stmts) | ❌ | ❌ | ❌ | **✅ (Plaid+Argyle)** |
| **Proprietary Score** | ❌ | ❌ | ❌ | ✅ (internal) | ❌ (ports existing scores) | ❌ (reports to FICO) | ✅ (on-chain) | **✅ (Krost Score 300-850)** |
| **Lender Platform** | ✅ (API) | ✅ (API) | ❌ | ✅ (own loans) | ✅ (API) | ❌ | ✅ (protocol) | **✅ (shareable links + PDF)** |
| **Consumer Brand** | ❌ (B2B) | ❌ (B2B) | ✅ | ✅ | ❌ (B2B) | ✅ | ❌ | **✅ (worker-facing)** |
| **On-Chain Attestation** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | **✅ (Base L2 Passport)** |
| **Multi-Platform Aggregation** | ✅ (payrolls) | ✅ (payrolls) | ❌ (app only) | ❌ | ❌ | ❌ | ❌ | **✅ (Uber, DD, Lyft, Upwork, Instacart, Flex, Fiverr)** |
| **Shareable Reports** | ❌ (API only) | ❌ (API only) | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ (PDF + links)** |
| **Worker-Owned Data** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (varies) | **✅ (soul-bound)** |
| **Pricing Model** | $1-5/verif | Embedded | $9.99/mo sub | APR 11-24% | $0.50-$5/pull | Landlord-paid | Protocol/token | **TBD (Freemium + per-verif)** |

---

## 4. Competitive Positioning Map

```
                     CONSUMER-FACING
                           |
                     Steady | Krostio
                    (app)   | (platform)
                           |
    EMPTY SCORE -----------|---------------- PROPRIETARY SCORE
                           |
                    Argyle |  Stilt/Arc
                   Pinwheel |  (lending)
                   (pure API)|
                           |
                      B2B-ONLY
```

Krostio occupies a **unique quadrant** — it is both consumer-facing (worker app) and B2B (lender verification), with a proprietary score AND raw data access. No other competitor occupies this same position.

---

## 5. Key Takeaways

1. **No direct competitor does all four pillars.** The closest is Argyle (data) or Spectral (on-chain) but no one combines scoring + verification + on-chain attestation + multi-platform aggregation.

2. **The biggest threat is Argyle adding scoring** or a consumer front-end. Krostio must move fast to establish brand + score credibility before incumbents notice the gap.

3. **DeFi credit projects are not yet a threat** but could become one if they add off-chain data oracles (e.g., Chainlink + Plaid integration). Krostio's head start on gig-native on-chain credentials is defensible.

4. **Esusu and Nova are complementary, not competitive.** Partnership potential: Esusu for rent data + Krostio for gig data = full picture. Nova for cross-border + Krostio for gig-native.

5. **Steady is the most direct consumer competitor** but their lack of a scoring model and lender platform limits them. If they partner with or acquire a scoring engine, they become dangerous.

---

*End of Competitive Intelligence Matrix*
