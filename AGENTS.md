<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- **Next.js 16** (App Router) + TypeScript — always read `node_modules/next/dist/docs/` before coding
- **Tailwind CSS 4** — config is in `src/app/globals.css` via `@theme`; there is **no** `tailwind.config.js`
- **Supabase** (Auth + PostgreSQL) via `@supabase/ssr` — three client patterns exist:
  - `src/lib/supabase-browser.ts` — `createBrowserClient`
  - `src/lib/supabase-server.ts` — `createServerClient` with `await cookies()`
  - `src/lib/middleware-core.ts` — `createServerClient` wrapping request/response cookies
- **Stripe** billing — config in `src/lib/stripe.ts`
- **Blockchain** — Hardhat + Solidity in `blockchain/` directory (separate package.json), deploys to Base L2
- **PostHog** analytics via `src/lib/analytics-provider.tsx`
- **Vercel** deployment (vercel-cli in devDeps, `.vercel` in gitignore)

## Key commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint 9 flat config (`eslint.config.mjs`) |
| `npm run db:migrate` | Run `db/migration.sql` via psql |
| `npm run deploy:contract` | Deploy Solidity contract to Base Sepolia |

No test framework is configured. There is no typecheck script (lint is the only CI-like check).

## Architecture

- Route groups: `(auth)` = login/register/onboarding, `(dashboard)` = dashboard/billing/settings, `(marketing)` = pricing pages
- Path alias `@/*` maps to `src/*` (tsconfig paths)
- Middleware (`src/middleware.ts`) guards `/dashboard`, `/settings`, `/billing`; redirects role-based from `/`; sends OAuth users to `/onboarding`
- Scoring engine (`src/lib/scoring-engine.ts`) is a pure function — no external service
- All DB schema + RLS policies live in `db/migration.sql` (and `migration-002-waitlist.sql`)
- `scripts/run-migration.js` and `scripts/seed-data.js` are Node.js helpers (not part of build)

## Design system quirks

All in `src/app/globals.css` using Tailwind v4 `@theme`:
- Mastercard-inspired custom colors: `canvas-cream`, `ink-black`, `signal-orange`, `light-signal-orange`, `slate-gray`, etc.
- Custom radii: `pill` (999px), `stadium` (40px), `btn` (20px), `consent` (24px)
- Custom shadows: `elevation-1`, `elevation-2`, `elevation-3`
- Utility classes: `btn-ink`, `btn-outline`, `btn-signal`, `card-stadium`, `card-bordered`, `ghost-watermark`, `eyebrow-dot`, `input-pill`, `text-eyebrow`, `text-body`, `text-nav`, `text-footer-link`, `text-footer-header`
- Font: Sofia Sans (Google Fonts import), weight 450 is the body default

## Environment

24 vars are required — see `.env.example`. Supabase URL/keys, Stripe test keys, and Plaid sandbox credentials are all needed. The production `NEXT_PUBLIC_APP_URL` points to Vercel.

## DB tables

### v1 (migration.sql)
`profiles`, `platform_connections`, `income_records`, `credit_scores`, `lender_requests`, `waitlist` — all with RLS enabled. A trigger auto-creates a profile row on `auth.users` insert.

### v2 — Four-Pillar Platform (migration-v2.sql)
| Table | Pillar | Purpose |
|-------|--------|---------|
| `krost_scores` | Score | 300–850 income verification metric |
| `income_verifications` | Score | v1 consistency score (0–100) output |
| `ledger_entries` | Ledger | Unified earnings across all platforms |
| `reports` | Verifier | Generated PDFs with shareable links |
| `report_views` | Verifier | Access log for shared reports |
| `lender_orgs` | B2B | Lender organization accounts + API keys |
| `passports` | Passport | Mirrors on-chain SBT state |
| `attestation_history` | Passport | Immutable attestation log |

Run both migrations with `npm run db:migrate` (concatenates v1 + v2).

## Blockchain

- `blockchain/` has its own `package.json`
- Solidity 0.8.20 with optimizer (200 runs)
- `@nomicfoundation/hardhat-toolbox` v5
- Networks: `baseSepolia` and `base`
- Contract: `IncomeAttestation.sol` — on-chain score attestation
