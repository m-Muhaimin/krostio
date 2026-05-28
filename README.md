# Krostio

Income verification for gig workers and freelancers. Connect your gig platforms (Uber, Lyft, DoorDash, Instacart, etc.) via Plaid, get a 0–100 income consistency score, and share a lender-ready report — you own your data.

**Operated by SuprBuild, LLC (DBA Krostio).**

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + custom mockup CSS classes |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT (jose, HS256) — Google OAuth (PKCE) + email/password |
| Billing | Paddle |
| Platform data | Plaid (sandbox) |
| Blockchain | Solidity 0.8.20 on Base L2 (Sepolia + Mainnet) via Hardhat |
| PDF | `@react-pdf/renderer` |
| Email | Nodemailer (SMTP) |
| Analytics | PostHog |

## Quick Start

```bash
npm install
cp .env.example .env.local
# fill in your env vars
npm run dev
```

### Required env vars

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings |
| `JWT_SECRET` | Any 256-bit secret (or `SUPABASE_JWT_SECRET`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `PLAID_CLIENT_ID` / `PLAID_SECRET` / `PLAID_ENV=sandbox` | Plaid Dashboard |
| `PADDLE_VENDOR_ID` / `PADDLE_API_KEY` / `PADDLE_ENVIRONMENT=sandbox` | Paddle Dashboard |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Your email provider |

Full list in `.env.example`.

### Database

Migrations are auto-applied via Supabase Management API:

```bash
npm run db:migrate
```

Foundation schema in `db/migration.sql` + `db/migration-v2.sql`.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint 9 |
| `npm run db:migrate` | Apply Supabase migrations |
| `npx vercel --prod` | Deploy to production |

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, register, MFA challenge
│   ├── (dashboard)/         # Dashboard shell + worker pages
│   │   └── dashboard/worker/
│   │       ├── page.tsx             # Worker dashboard overview
│   │       ├── earnings/            # Earnings page
│   │       ├── statements/          # Transaction statement (was /reports)
│   │       ├── report/              # Income verification report
│   │       ├── score/               # Consistency score breakdown
│   │       ├── ledger/              # Detailed ledger
│   │       ├── connections/         # Platform connections
│   │       ├── analytics/           # Analytics
│   │       ├── alerts/              # Alerts
│   │       └── privacy/             # Privacy controls
│   ├── (marketing)/         # Landing, learn, lenders, pricing, privacy, terms
│   ├── api/                 # All API routes
│   └── page.tsx             # Landing page
├── components/              # Reusable UI components
├── lib/                     # Core utilities (auth, scoring, plaid, paddle, email)
├── proxy.ts                 # Next.js middleware (not middleware.ts)
└── types/                   # TypeScript types
dashboard-mockup.html        # Source of truth for dashboard CSS classes
blockchain/                  # Hardhat + Solidity contracts
db/                          # SQL migrations
```

## Auth Flow

```
Google OAuth (PKCE) or email/password → sign custom JWT (jose, HS256) → krost_session cookie
```

- Middleware at `src/proxy.ts` (not `middleware.ts`)
- Server components / API routes use `getCurrentUser()` from `@/lib/auth-utils`
- Role guard: `requireRole(['gig_worker'])` from `@/lib/auth-guard`
- DB queries use service-role client (`supabase-server.ts`) — RLS bypassed
- Profiles table: no FK to `auth.users`; `id` defaults to `gen_random_uuid()`
- MFA via TOTP (`otplib`)

## Scoring

The 0–100 income consistency score factors:
1. **Consistency** — regularity of deposits
2. **Income level** — annualized gross income
3. **Trajectory** — month-over-month growth/decline
4. **Platform diversity** — number of distinct income sources
5. **Tenure** — length of earnings history

Scores can optionally be attested on-chain via `IncomeAttestation.sol` on Base L2.

## Pricing (Paddle)

| Plan | Price |
|------|-------|
| Single Report | $6.99 |
| Pro Monthly | $29.99/mo |
| Pro Annual | $129.99/yr |
