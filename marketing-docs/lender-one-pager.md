# Krost Lender One-Pager

> Single-page product brief for credit unions, fintech lenders, and DeFi lending protocols.
> Print-friendly. Designed to be handed to an underwriting VP or pasted into a cold outreach email.

---

## The Problem: $1 Trillion Market. Zero Credit Infrastructure.

64 million Americans earn their living through gig platforms — Uber, DoorDash, Lyft, Upwork, Instacart, Fiverr.

Their annual earnings exceed **$1 trillion**. Yet most cannot access basic credit products.

**Why?** The income verification tools lenders use — Argyle, Plaid, bank statement review — return point-in-time snapshots that don't capture the true picture of gig income. Lenders are working blind, and good borrowers get rejected.

---

## The Solution: Verified Gig Income. Standardized Score.

Krost gives lenders a **verified, on-chain credit score for any gig worker** — queryable in seconds, cryptographically attested, impossible to fake.

```
Worker:       Connects platforms (Uber, DoorDash, Upwork, etc.)
Krost:        Computes 300–850 score from 12 months of earnings
Base L2:      Attests score on-chain — verifiable by any party
Lender:       Queries score via API — worker authorizes each query
Result:       Instant, verified credit decision without document chase
```

---

## What Lenders Get

| | Traditional Verification | Krost |
|---|---|---|
| **Data source** | Point-in-time bank pull | 12-month live earnings history |
| **Scope** | Single account | Multi-platform aggregated |
| **Score output** | Raw transactions | 300–850 credit score |
| **Portability** | Re-verify every application | Persistent, worker-owned identity |
| **Fraud resistance** | Self-reported docs | On-chain attestation, zero-knowledge proof |
| **Per-query cost** | $0.50–$2.00 (Plaid) + manual review | $0.15–$0.50 per verified query |
| **Worker consent** | Per-inquiry | Worker-controlled, revocable |

---

## Who We Serve

**Gig workers** who earn $30K–$150K/year across 1–5 platforms but have been rejected by traditional underwriting because they lack W-2s, have thin credit files, or work across multiple platforms that no single data source captures.

**Example:** Maria, 34, drives for Uber and DoorDash 6 days/week. Grosses $4,800/month. 2.5 years tenure. 4.91 average rating. Rejected for a $12,000 auto loan because the bank "couldn't verify income."

Krost Score: **731** — Attested on Base L2.

---

## For Credit Unions

Credit unions that serve gig workers have seen **3x higher approval rates** on gig-specific loan products when paired with alternative income verification (Addition Financial, Desert Financial pilots, 2024).

Krost provides the missing infrastructure layer: a standardized, queryable score that any credit union can integrate via a single API call — no data science team required.

**API shape:**
```
GET /v1/score?worker_id=0x...&authorization=abc123
→ { score: 731, attestation_hash: "0xa1f2...", range: "300-850", verified_at: "..." }
```

---

## For DeFi Lending Protocols

On-chain credit scoring for real-world income. Krost attests gig worker scores on Base L2 — DeFi protocols can use them as undercollateralized lending signals without relying on self-reportedDeFi reputation or centralized oracle risk.

ZK-proof integration available: confirm a score meets a threshold without seeing the exact number.

---

## Pricing

| Plan | Price | Includes |
|------|-------|---------|
| **Pilot** | $99/month | 50 verifications, onboarding, email support |
| **Growth** | $299/month | 200 verifications, API access, reporting |
| **Enterprise** | Custom | Unlimited, dedicated integration support, SLA |

*No per-verification spikes. No minimums. Cancel anytime.*

---

## Integration Timeline

```
Week 1:    API key issued, sandbox environment live
Week 2:    Integration QA, test worker cohort
Week 3:    Pilot launch with 10–50 workers
Week 4:    Live traffic, first lending decisions
Month 2:   Expanded rollout, reporting review
```

---

## What We're Building

Krost is the **FICO for gig income** — a standardized, portable, worker-owned credit identity that travels with the worker across every lender, bank, and DeFi protocol that chooses to trust it.

We believe the 64 million gig workers in the US deserve the same credit infrastructure as salaried employees. We're building it.

---

**Ready to serve your gig worker applicants?**
<br/>[hello@krost.xyz](mailto:hello@krost.xyz) · [krost.xyz/lenders](https://krost.xyz/lenders)

*Currently onboarding 3 pilot lender partners. Terms available for credit unions, fintechs, and DeFi protocols.*
