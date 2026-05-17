---
title: "Krostio Verifier — Lender One-Pager"
subtitle: "API-first income verification for the gig economy"
date: "2026-05-16"
author: "Partnerships Team"
status: "final"
audience: "Credit unions, fintech lenders, DeFi protocols, mortgage lenders, auto lenders"
---

# Krostio Verifier — One-Pager for Lenders

## The Problem

64 million US workers earn income through gig economy platforms. They have no W-2, no single employer, and no standardized way to prove their income to lenders. Traditional verification methods fail:

- **Manual bank statement analysis** costs $40-80 per application and takes hours
- **Tax returns** are self-reported and outdated (6-18 month lag)
- **Credit bureaus** capture none of this income data
- **Plaid/transaction-based** verification only reveals bank deposits, not platform-specific earnings

The result: qualified borrowers are denied, and lenders leave billions in addressable volume on the table.

---

## The Solution: Krostio Verifier API

Krostio Verifier connects to 8+ gig platforms via OAuth, aggregates multi-platform earnings, and returns structured, verified income data — including a contextual Krost Score.

### How It Works

```
Borrower connects platforms (30s OAuth)
    ↓
Krostio calculates Krost Score (300-850, 9 factors)
    ↓
Shareable Verifier link + PDF generated
    ↓
Lender opens link or calls API → structured JSON
```

---

## API Shape

### Endpoint

```
GET /api/lender/score?worker_email={email}&report_id={id}
```

### Authentication

Bearer token (API key issued after KYC review)

### Response (JSON)

```json
{
  "verification_id": "v_abc123def",
  "status": "verified",
  "score": 680,
  "score_range": "fair",
  "income": {
    "monthly_average": 5800,
    "annual_projected": 69600,
    "currency": "USD"
  },
  "platforms": [
    {
      "name": "uber",
      "status": "connected",
      "months_active": 24,
      "monthly_avg": 3200
    },
    {
      "name": "doordash",
      "status": "connected",
      "months_active": 18,
      "monthly_avg": 2600
    }
  ],
  "indicators": {
    "income_consistency": "high",
    "earnings_trend": "upward",
    "tenure_months": 24,
    "platform_diversity": "moderate",
    "expense_ratio": 0.18
  },
  "report_url": "https://krostio.vercel.app/verify/v_abc123def",
  "generated_at": "2026-05-16T14:00:00Z",
  "expires_at": "2026-07-15T14:00:00Z"
}
```

### Data Fields Returned

| Field | Description | Notes |
|-------|-------------|-------|
| `score` | Krost Score (300-850) | Composite of 9 income quality factors |
| `income.monthly_average` | Mean monthly net earnings (12mo) | After platform fees |
| `income.annual_projected` | Annualized projection | Conservative estimate |
| `platforms[].name` | Platform name | "uber", "doordash", "upwork", etc. |
| `platforms[].months_active` | Active duration per platform | Since first gig |
| `indicators.income_consistency` | Variance in weekly earnings | "high", "medium", "low" |
| `indicators.earnings_trend` | 3-month trend direction | "upward", "stable", "declining" |
| `indicators.tenure_months` | Total gig work history | Across all platforms |
| `report_url` | Verifier link | Browser-viewable, shareable |
| `on_chain_attestation` | Base L2 attestation ID | Optional, if Passport minted |

---

## Comparison Table

| Feature | Krostio Verifier | Plaid Income | Manual Underwriting | Credit Bureaus |
|---------|-----------------|--------------|-------------------|---------------|
| **Gig platform data** | ✅ Native OAuth (8+ platforms) | ❌ Bank transactions only | ❌ Self-reported only | ❌ None |
| **Multi-platform aggregation** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Structured JSON output** | ✅ Yes | ✅ Yes | ❌ Unstructured PDFs | ✅ Yes (but limited) |
| **Contextual score** | ✅ 9-factor Krost Score | ❌ Raw income only | ❌ N/A | ❌ Income not included |
| **On-chain attestation** | ✅ Base L2 | ❌ No | ❌ No | ❌ No |
| **Shareable link** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Time to verify** | ~2 minutes | ~5 minutes | 2-5 hours | N/A |
| **Cost per verification** | $2.00 | $1-5 | $40-80 | $0.50-2 (CRA) |
| **Borrower data ownership** | ✅ Revocable consent | ✅ Limited | ❌ N/A | ❌ No |
| **Gig worker approval rate** | ~92% (with connected platforms) | ~60% (bank connection issues) | ~25% (manual review) | ~10% (no data) |

---

## Pricing Tiers

| Feature | Starter | Growth | Enterprise |
|---------|---------|--------|------------|
| **Monthly verifications** | 100 | 1,000 | Custom |
| **API rate limit** | 100 req/min | 1,000 req/min | Custom |
| **Platforms supported** | 5 | 8+ | All + custom |
| **API documentation** | ✅ | ✅ | ✅ + white-glove |
| **Sandbox environment** | ✅ | ✅ | ✅ |
| **On-chain attestation** | ❌ | ✅ | ✅ |
| **SOC 2 report** | ❌ | ✅ | ✅ |
| **SLA** | 99.5% | 99.9% | 99.99% |
| **Dedicated support** | Email (48h) | Email (4h) | Slack + phone |
| **Price** | **$99/mo** | **$199/mo** | **Custom** |
| **Per-verification overage** | $1.50 | $0.50 | Negotiable |

*All tiers include a 14-day free trial. No long-term contract required for Starter and Growth.*
*Enterprise pricing includes volume discounts for >10,000 verifications/month.*

---

## Integration Timeline

| Phase | Days | Activity | Lender Effort |
|-------|------|----------|---------------|
| **1. API Key** | 1-3 | Security review, contract, key issuance | Sign agreement |
| **2. Sandbox** | 3-10 | Integration testing with synthetic data | 1-2 engineering days |
| **3. Pilot** | 10-24 | Live with [LENDER_PILOT_COUNT] borrowers | Underwriting team trains on report format |
| **4. Production** | Day 24+ | Full rollout | Monitoring + optimization |

**Total time to production: ~3 weeks from signed agreement.**

---

## Security & Compliance

| Area | Status/Detail |
|------|---------------|
| **Encryption at rest** | AES-256 |
| **Encryption in transit** | TLS 1.3 |
| **Data residency** | US (AWS us-east-1) |
| **SOC 2 Type II** | [In progress — target completion: TARGET_COMPLETION_DATE] |
| **GDPR** | Compliant (data processing agreement available) |
| **Borrower consent** | Granular, revocable, time-bound |
| **Data retention** | 90 days post-account closure |
| **Audit trail** | Full API request/response logging (90 days) |
| **Penetration testing** | Quarterly, results available under NDA |

---

## Supported Platforms (Current)

| Platform | Connection Type | Data Retrieved | Status |
|----------|----------------|---------------|--------|
| Uber | OAuth | Earnings, trips, ratings, tenure | ✅ Live |
| DoorDash | OAuth | Earnings, deliveries, ratings, tenure | ✅ Live |
| Lyft | OAuth | Earnings, rides, ratings, tenure | ✅ Live |
| Upwork | OAuth | Earnings, contracts, hours, tenure | ✅ Live |
| Instacart | OAuth | Earnings, batches, ratings, tenure | ✅ Live |
| Grubhub | OAuth | Earnings, deliveries, ratings | Beta |
| Amazon Flex | OAuth | Earnings, blocks, tenure | Beta |
| Fiverr | API | Earnings, orders, reviews | Development |

*More platforms added monthly. Contact us for priority additions.*

---

## Who Should Use Krostio Verifier

| Lender Type | Use Case | Fit |
|-------------|----------|-----|
| **Credit unions** | Mortgage + personal loans for members | High — serve existing member base better |
| **Fintech lenders** | Income verification for underwriting decisions | High — API-native, easy integration |
| **Mortgage lenders** | Self-employed borrower income proof | High — underserved demographic |
| **Auto lenders** | Income verification for auto loans | Medium — growing gig driver population |
| **DeFi protocols** | On-chain credit/underwriting | Medium — on-chain attestation fits naturally |
| **Rental platforms** | Tenant income verification | High — shareable link ideal for leasing |
| **BNPL providers** | Affordability checks | Medium — complements existing checks |

---

## Next Steps

1. **Review API docs:** [https://krostio.vercel.app/docs/api](https://krostio.vercel.app/docs/api)
2. **Contact partnerships:** [partners@krostio.com](mailto:partners@krostio.com)
3. **Start a pilot:** 14-day free trial with sandbox access

**[Request API Access →](mailto:partners@krostio.com)**

---

*Krostio Verifier is currently in beta. [BETA_LENDER_COUNT] financial institutions are actively piloting the platform. We are not a credit bureau or credit decisioning engine — lenders retain full discretion.*
