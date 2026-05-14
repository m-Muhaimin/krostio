# Why Traditional Income Verification Fails Gig Workers (And What to Do About It)

**For lenders, fintechs, and credit professionals.**

---

## The $1 Trillion Opportunity You're Missing

There are 64 million gig workers in the US alone. They earn over $1 trillion annually across platforms like Uber, Lyft, DoorDash, Fiverr, Upwork, and Instacart.

Yet most lenders cannot reliably serve this market.

Not because gig workers are bad borrowers — but because the income verification tools available today weren't designed for them.

## The Core Problem: Point-in-Time vs Persistent

Current income verification tools (Argyle, Plaid, Truv) work the same way:

1. Worker consents to data access
2. Tool pulls earnings from payroll or bank
3. Lender sees a snapshot
4. Repeat for every application

This works for salaried employees where income is stable and predictable. It fails for gig workers where:

- **Income varies weekly** — A snapshot from a slow week underreports true earning power
- **Platforms change** — Workers shift between Uber, DoorDash, Instacart based on demand
- **Multi-platform is the norm** — Most gig workers use 2-3 platforms; single-platform snapshots miss the full picture
- **No payroll infrastructure** — Gig platforms don't issue W-2s; traditional verification chains are broken

## The Hidden Cost of Bad Verification

| Problem | Cost to Lender |
|---------|---------------|
| Denying good borrowers | Lost revenue from 64M underserved consumers |
| Approaching bad borrowers | Default risk from inadequate data |
| Manual underwriting | $50-200 per application in overhead |
| Re-verification friction | 40%+ drop-off when workers must re-verify for each product |

## What Alternative Credit Scoring Changes

Alternative credit scoring for gig workers shifts from *point-in-time income verification* to *persistent, worker-owned credit profiles*.

### The Difference

| Dimension | Traditional Verification | Alternative Scoring |
|-----------|------------------------|-------------------|
| Data source | Payroll, bank statement | Live gig platform APIs |
| Frequency | One-time snapshot | Continuous, updated earnings |
| Scope | Single source | Multi-platform aggregation |
| Worker consent | Per-inquiry | Owned by worker, shared on-demand |
| Score output | Raw income data | 300-850 credit score |
| Portability | Re-verify each time | Portable, persistent identity |

## The Lenders Already Doing This

Forward-thinking lenders are already piloting gig-income-aware credit products:

- **Credit unions** like Addition Financial and Desert Financial offer gig-worker-specific loan products
- **Fintech lenders** like Upstart and LendingClub incorporate alternative data into scoring
- **DeFi protocols** are exploring undercollateralized lending backed by real-world income data

The missing piece? A reliable, standardized way to verify gig income and convert it into a credit score that any lender can query.

## The Technical Architecture

A modern gig worker credit scoring system has three layers:

### 1. Data Aggregation Layer
Connects to gig platforms via their APIs (or via middleware like Argyle). Aggregates earnings across platforms into a normalized income history.

### 2. Scoring Engine
Applies ML/statistical models to generate a 300-850 score based on:
- Income stability (consistency across weeks)
- Average monthly earnings
- Platform diversity
- Earnings trajectory
- Worker tenure

### 3. Verification Layer
Lenders query scores through an API. Workers authorize each query. The verification layer can optionally use zero-knowledge proofs to confirm score thresholds without revealing raw income data.

## Why Decentralization Matters for Lenders

Decentralized (on-chain) credit scoring offers lenders three advantages:

1. **Verifiable without trust** — The score is computed transparently; lenders can verify the logic
2. **No vendor lock-in** — The worker owns their score; any lender can query it without negotiating with a central data broker
3. **Cross-platform consistency** — A single score from all gig platforms, standardized across lenders

## The Business Case

For a typical mid-size lender (5,000 applications/month):

| Metric | Before | After |
|--------|--------|-------|
| Gig worker approvals | 12% of applicants | 35% of applicants |
| Manual review cost | $40/app | $5/app |
| Application drop-off | 55% | 25% |
| New addressable market | — | +$50M/year in origination |

## Getting Started

You don't need to build your own gig income scoring engine. Krost provides a lender API that returns verified credit scores for any gig worker who consents.

**[Join the Lender Waitlist →]**

*Krost is a decentralized platform for gig worker alternative credit scoring. Lenders query scores through a simple API. Workers own their data. Everyone wins.*
