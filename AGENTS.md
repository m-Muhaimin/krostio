# Krostio Platform — Agent Reference

## Authoritative Specification

This project is built according to **PRD v3.0** (May 2026). The PRD is the single source of truth for architecture, data models, build sequence, and technical constraints. Reference it before implementing any feature.

**Key Documents:**
- PRD v3.0 — Technical specification (supersedes ALL prior PRDs and README design guidance)
- `DESIGN.md` — Visual design system (Cohere-inspired: ink black, canvas, Space Grotesk + Inter)
- `src/app/globals.css` — Tailwind v4 @theme tokens (production truth for design values)

## Architecture Overview

Krostio is a **four-pillar platform**:
1. **Krost Score** (300-850) — 9-factor creditworthiness from gig income data
2. **Krost Ledger** — Multi-platform earnings aggregation
3. **Krost Verifier** — PDF reports + shareable links
4. **Passport** — On-chain soul-bound credential on Base L2

### Route Groups
```
(marketing)/ — Public pages (/, /pricing, /about)
(auth)/     — Login, register, onboarding
(dashboard)/— Protected pages (dashboard, ledger, score, reports, passport, billing, settings, lenders, notifications)
```

### API Routes
Functions ingest/platform/score/ledger/reports/stripe/passport handlers under `app/api/`.

## Current Build Status

**Phase 0 — Foundation:** Completed. Build passes (28 routes). Auth, dashboard, API routes, scoring engine, PDF reports, Stripe billing all wired.

**Build output:**
- `proxy.ts` (Next.js 16 convention, replaces middleware.ts)
- 14 API routes: auth/callback, chat, ingest/argyle/webhook, ledger/entries, ledger/summary, platform/connect, platform/connections, reports/generate, score/current, score/history, stripe/checkout, stripe/status, stripe/webhook
- 10 dashboard pages + 3 auth pages + landing
- Proxy protects `/dashboard/*`, redirects `/login`/`/register` when logged in

**Remaining Phase 0 tasks:**
- Argyle SDK integration with onboarding + webhook signature verification
- UX polish for mobile sidebar

## Database

18 tables in Supabase:
- `profiles` — User profiles with subscription fields
- `platform_connections` — Connected gig platforms
- `income_verifications` / `ledger_entries` — Earnings records
- `krost_scores` — Score snapshots over time
- `reports` — Generated report records
- `report_views` — Access log for shared links
- `passports` — On-chain credential references
- `attestation_history` — On-chain update log
- `lender_orgs` — B2B lender accounts
- Legacy: `income_records`, `lender_requests`, `waitlist`
