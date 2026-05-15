# [ARCHIVED] Competitor Comparison — Krostio
> **ARCHIVED:** This file uses the old brand name "Krostio" throughout and has been superseded by `competitive-intel-output.md`. Do not edit — kept for historical reference.

> For internal use and lender/sales conversations.
> Categories: Gig worker credit scoring, income data aggregators, alternative credit scoring, credit-builder apps, DeFi income protocols, employer verification.
> Last updated: May 15, 2026

---

## Category Map

| Category | Examples | What they do | Gap they leave | Threat to Krostio |
|----------|----------|--------------|----------------|-------------------|
| **Gig Worker Credit Scoring** | ecreditumo, Float | Score or lending based on gig income | ecreditumo: 3 platforms only, no on-chain. Float: issues own credit, not a scoring infra play. | LOW — both smaller, narrower. |
| **Income Data Aggregators** | Plaid, Argyle, Finicity, Truv, Pinch, Rollee | Pull raw earnings data from platforms/banks | No scoring model; lenders do the math themselves | **HIGH** — Plaid and Argyle have the data pipes. If either adds scoring, it's existential. |
| **Alternative Credit Scoring** | UltraFICO, Zest AI, Upstart, Nova Credit | Score thin-file consumers with non-traditional data | Not gig-native; don't connect to gig platforms; no on-chain | MEDIUM — they serve non-gig thin-file, overlap on "no W-2" audience |
| **Credit-Builder Apps** | Self, Chime, Kikoff, Grow Credit | Report on-time payments to credit bureaus | Don't measure income at all; 12-18 months to see score impact | LOW — complementary; Krostio measures earning power TODAY |
| **DeFi Credit / Identity** | Cred Protocol, CreDA, Spectral, Privado ID, Sismo, Humanity Protocol | On-chain credit scores or identity | DeFi-behavior-only scoring (repayments/liquidations). No real-world income data. | LOW — Krostio bridges real-world → on-chain. Genuine whitespace. |
| **Employer Verification** | The Work Number (Equifax), Truework, VX | W-2/1099 employer-reported income | Gig workers are invisible to all of them | LOW — Krostio solves their blind spot |

---

## Detailed Competitor Profiles

### Direct: ecreditumo

| Dimension | Detail |
|-----------|--------|
| **Platforms** | Uber, Lyft, DoorDash (3) |
| **Score model** | Proprietary alternative credit score, 300-850 range |
| **Output** | 300-850 score |
| **Attestation** | Off-chain (centralized DB) |
| **Worker data ownership** | Worker account, no on-chain record |
| **Lender integration** | API (limited docs) |
| **Worker pricing** | ~$20/mo |
| **Lender pricing** | Not publicly listed |
| **Strengths** | First mover in gig score space |
| **Weaknesses** | Centralized — scores disappear if they shut down. Only 3 platforms. No blockchain attestation. |
| **Krostio win line** | "We have 6 platforms, on-chain attestation, and worker-controlled revocation. Your score lives on Base L2 — it's permanent even if Krostio isn't." |

### Direct: Float (adjacent — income-linked lending)

| Dimension | Detail |
|-----------|--------|
| **Platforms** | Gig platform income (via Plaid) |
| **Score model** | Buy-power estimate (income-linked credit limit) |
| **Output** | Credit line offer, not a portable score |
| **Attestation** | None |
| **Worker data ownership** | Worker authorizes data |
| **Lender integration** | They are the lender (owns credit risk) |
| **Pricing** | Float issues its own credit |
| **Krostio vs Float** | Krostio = scoring infrastructure. Float = lender. Different businesses. A worker can have a Krost Score AND use Float for credit. |

### Threat: Plaid (Income Verification)

| Dimension | Detail |
|-----------|--------|
| **Platforms** | 12,000+ banks + some gig platforms via Argyle partnership |
| **Score model** | None — raw data only |
| **Output** | Transactions, income figures, employment data |
| **Attestation** | None |
| **Worker data ownership** | Worker authorizes; Plaid holds data |
| **Lender integration** | Deep: 7,000+ apps use Plaid |
| **Pricing** | $0.50-2.00/verification (lender pays) |
| **Existential threat?** | **YES.** If Plaid adds "Plaid Income Score," they'd deploy it across 7,000+ fintechs overnight. Mitigation: Plaid's core business is data pipes — scoring would make them compete with their own customers. |
| **Krostio win line** | "Plaid gives your underwriters raw data to interpret. Krostio gives them a verified, standardized score in 3 seconds. Use Plaid for bank verification, Krostio for gig income scoring." |

### Threat: Argyle

| Dimension | Detail |
|-----------|--------|
| **Platforms** | 450+ payroll + gig (Uber, Lyft, DoorDash, etc.) |
| **Score model** | None — employment data API |
| **Output** | Employment verification, income history |
| **Attestation** | None |
| **Worker data ownership** | Worker authorizes; Argyle stores data |
| **Lender integration** | API, webhook |
| **Pricing** | Enterprise contracts (B2B) |
| **Existential threat?** | **HIGH.** Argyle already has gig data pipes. A scoring layer would be technically easy. They sell enterprise contracts to lenders — same buyers Krostio targets. |
| **Krostio win line** | "Argyle returns employment data. Krostio returns a credit score with on-chain attestation. We're the decision signal layer on top of their data pipe. Partners, not competitors." |

### Income Aggregators: Truv

| Dimension | Detail |
|-----------|--------|
| **Platforms** | 40+ payroll + gig (Uber, Lyft, DoorDash) |
| **Score model** | None |
| **Output** | Employment + income data |
| **Attestation** | None |
| **Pricing** | $15-25/verification |
| **Note** | Positioned as "cheaper Argyle." No scoring product. Moderate threat — could add scoring but has less traction than Argyle. |

### Credit-Builder: Self

| Dimension | Detail |
|-----------|--------|
| **Mechanism** | CD-secured loan → FICO score building |
| **Gig workers** | Works for anyone with $25/mo. Not gig-specific. |
| **Timeline** | 12-18 months to meaningful FICO improvement |
| **Relevance** | Complementary. Workers can build FICO with Self AND prove earning power with Krostio. |
| **Krostio win line** | "Your FICO is for credit cards. Your Krost Score is for auto loans, mortgages, and personal loans — lenders who need to verify income, not just debt history. Use both." |

### DeFi: Cred Protocol / CreDA

| Dimension | Detail |
|-----------|--------|
| **Chain** | Polygon (Cred), Ethereum (CreDA) |
| **Data source** | On-chain behavior (DeFi repayments, liquidations) |
| **Real-world income?** | No — DeFi behavior only |
| **Gig workers?** | Only if they also DeFi. Most gig workers aren't DeFi users. |
| **Krostio position** | Complementary. Cred scores your DeFi history; Krostio scores your real-world income. Together they create a complete credit picture for undercollateralized lending. |

### Employer Verification: The Work Number (Equifax)

| Dimension | Detail |
|-----------|--------|
| **Coverage** | 70M+ W-2 employees |
| **Gig coverage** | Effectively zero. Gig platforms don't report earnings to Equifax. |
| **Krostio position** | The Work Number doesn't work for gig workers. This is NOT a competitor — it's the status quo Krostio replaces. |

---

## Win/Loss Themes

| Scenario | Win Response | Loss Response |
|----------|-------------|---------------|
| "We already use Plaid" | "Use both. Plaid for bank verification, Krostio for gig income scoring. Different layers." | "We need a single integration." → Build the dual-integration case study. |
| "We use Argyle" | "Argyle is the data pipe; Krostio is the credit decision. Data without a score still requires manual underwriting." | "We don't need scoring." → They're not the target buyer. |
| "ecreditumo is cheaper" | "Add on-chain permanence, 6 platforms, and worker-owned data. Our scores don't disappear if we do." | "Price-sensitive buyers" → Match on Pilot tier ($79 vs $99). |
| "FICO is the standard" | "FICO leaves 64M gig workers invisible. Krostio is the layer that extends FICO to gig workers." | "Our underwriting only uses FICO" → Show the market they're losing. |
| "We do manual review" | "$25-50/file, 3-5 days. Krostio: $0.15-0.50/query, 3 seconds." | "Manual review works for us" → Credit unions doing $10M+ in gig loans. |

---

## Key Competitive Metrics to Track

| Signal | Source | What it means |
|--------|--------|---------------|
| Plaid hires a Chief Product Officer with scoring experience | Plaid press releases | Preparing to launch a scoring product |
| Argyle raises $50M+ Series C | Argyle Crunchbase | Accelerating toward scoring layer |
| ecreditumo adds on-chain attestation | ecreditumo product updates | Krostio's differentiator erodes |
| Largest US credit union announces gig-worker lending product | CU Today / industry press | Proof of market — Krostio should approach them |
| Uber/DoorDash announce credit-building dashboard feature | Platform announcements | Competition from above — or partnership opportunity |
