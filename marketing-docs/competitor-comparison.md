# Competitor Comparison — Gig Worker Credit & Income Verification

> For internal use and lender/sales conversations.
> Categories: Income data aggregators, alternative credit scoring, credit-builder apps, DeFi income protocols.
> Last updated: [DATE]

---

## Category Map

| Category | Examples | What they do | Gap they leave |
|----------|----------|--------------|----------------|
| **Income Data Aggregators** | Plaid, Argyle, Finicity | Pull raw earnings data from platforms/banks | No scoring model; lenders do the math themselves |
| **Alternative Credit Scoring** | Krost, ecreditumo, Parseur | Income data → 300–850 score | Only Krost does on-chain attestation |
| **Credit-Builder Apps** | Self, Chime, Kikoff | Report on-time payments to bureaus | Don't measure income; don't help with lenders today |
| **DeFi Income Protocols** |队友 (no major US) | On-chain income verification for crypto | Limited real-world platform coverage |
| **Employer-Verified Income** | The Work Number (Equifax) | W-2/1099 income from employers | Doesn't cover gig platforms; not worker-controlled |

---

## Direct Competitors

### Krost

| Dimension | Detail |
|-----------|--------|
| **Platforms** | Uber, DoorDash, Lyft, Upwork, Fiverr, Instacart (6) |
| **Score model** | Income-based, 4-factor (stability, avg income, diversity, trajectory) |
| **Output** | 300–850 score + factor breakdown |
| **Attestation** | On-chain (Base L2), verifiable by any party |
| **Worker data ownership** | Worker controls authorization; can revoke |
| **Lender integration** | REST API, webhook-ready |
| **Worker pricing** | $29/mo, 14-day free trial |
| **Lender pricing** | $99/mo (50 queries) |
| **Strengths** | On-chain attestation, multi-platform, worker-owned |
| **Weaknesses** | New (2026), limited platform set, no bureau integration |
| **Target buyer** | Credit unions, fintech lenders, DeFi protocols |

---

### ecreditumo

| Dimension | Detail |
|-----------|--------|
| **Platforms** | Uber, Lyft, DoorDash (3) |
| **Score model** | Proprietary alternative credit score |
| **Output** | 300–850 score |
| **Attestation** | Off-chain (centralized) |
| **Worker data ownership** | Worker account, no on-chain record |
| **Lender integration** | API (limited docs) |
| **Worker pricing** | ~$20/mo |
| **Lender pricing** | Not publicly listed |
| **Strengths** | First mover in gig score space |
| **Weaknesses** | Centralized, no on-chain, limited platforms |
| **Differentiator vs Krost** | On-chain vs. centralized; Krost has more platforms |

---

### Parseur (Income Genius)

| Dimension | Detail |
|-----------|--------|
| **Platforms** | Email-based; supports any earnings email/payslip |
| **Score model** | Parses payslips → income history → credit model |
| **Output** | Income history report (no score) |
| **Attestation** | None |
| **Worker data ownership** | Manual upload, no OAuth |
| **Lender integration** | PDF export; no API |
| **Worker pricing** | Free tier, $15/mo Pro |
| **Strengths** | Works for any income type |
| **Weaknesses** | Manual, no OAuth, no score, no API |
| **Differentiator vs Krost** | Krost is automated + OAuth + scoring |

---

### Self (Credit-Builder)

| Dimension | Detail |
|-----------|--------|
| **Platforms** | None (bank account link) |
| **Score model** | Reports on-time payments to credit bureaus → builds FICO |
| **Output** | FICO score improvement |
| **Attestation** | None (standard bureau reporting) |
| **Worker data ownership** | Standard credit bureau rules |
| **Lender integration** | Works with any lender (FICO) |
| **Worker pricing** | $25/mo minimum |
| **Strengths** | Universal lender acceptance (FICO) |
| **Weaknesses** | Doesn't measure income; slow (12–18 months); requires consistent payments |
| **Differentiator vs Krost** | FICO vs. income-based; Self builds debt history, Krost measures earning power |

---

### Plaid (Income Verification)

| Dimension | Detail |
|-----------|--------|
| **Platforms** | 12,000+ banks + some gig platforms via Argyle |
| **Score model** | None — raw data only |
| **Output** | Transactions, income figures, employment data |
| **Attestation** | None |
| **Worker data ownership** | Worker authorizes; Plaid holds data |
| **Lender integration** | API, webhook, sandbox |
| **Worker pricing** | Free for consumers (lenders pay) |
| **Lender pricing** | $0.50–$2.00 per verification |
| **Strengths** | Bank coverage, lender ecosystem, trusted brand |
| **Weaknesses** | Point-in-time snapshots; no scoring model; lender does analysis; expensive per-query |
| **Differentiator vs Krost** | Krost = scoring + attestation layer on top of what Plaid provides |

---

### Argyle

| Dimension | Detail |
|-----------|--------|
| **Platforms** | 450+ payroll + gig platforms (Uber, Lyft, DoorDash, etc.) |
| **Score model** | None — income data API |
| **Output** | Employment verification, income history |
| **Attestation** | None |
| **Worker data ownership** | Worker authorizes; Argyle stores data |
| **Lender integration** | API, webhook |
| **Worker pricing** | Free for workers (B2B model) |
| **Lender pricing** | Usage-based; enterprise contracts |
| **Strengths** | Wide payroll + gig coverage; strong B2B relationships |
| **Weaknesses** | Data provider only; no score; lender must build model; expensive |
| **Differentiator vs Krost** | Argyle = raw data; Krost = scoring model + attestation + worker-owned identity |

---

## Positioning Against Each

| Competitor | Krost's positioning |
|------------|---------------------|
| **FICO / Credit Bureaus** | Complementary. Krost is income-based, not debt-history-based. Workers can have both. |
| **Self / Credit-Builder apps** | Different goal. Self builds FICO. Krost proves earning power to lenders today. |
| **Plaid / Argyle** | Upstream. Plaid gives raw data; Krost gives a score and an on-chain attestation. Lenders pay per-query to Plaid; workers pay a subscription to Krost. |
| **ecreditumo** | More platforms (Krost: 6 vs ecreditumo: 3), on-chain vs. centralized, lower lender price point. |
| **Parseur** | Automated OAuth vs. manual email parsing. Krost has a scoring model; Parseur is a document parser. |
| **Traditional underwriting** | The real competitor. Krost's pitch to lenders: stop doing manual document review. |

---

## Win/Loss Themes

**Wins against Plaid/Argyle:** When lender says "we already use Plaid" → response: "Plaid gives your underwriters raw data to interpret manually. Krost gives them a verified, standardized score in 3 seconds. Use Plaid for bank verification, Krost for gig income scoring."

**Wins against ecreditumo:** "They're centralized — if they shut down, your scores disappear. Krost scores are on Base L2. The record is permanent even if Krost isn't."

**Losses to Self:** "My credit score went up 40 points on Self." → Krost can't compete on FICO improvement timeline. Lean into: "Your FICO is for credit cards. Your Krost Score is for auto loans, mortgages, and personal loans — lenders who need to verify income, not just debt history."

**Losses to doing nothing:** "My current lender works fine." → Krost wins by being the lender's competitive advantage. "The credit union down the street that starts using Krost will be approving gig workers you're turning away. Do you want to be first or second?"
