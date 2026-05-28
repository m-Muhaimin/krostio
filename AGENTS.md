<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Brand
- **Name:** Krostio (never "Krost" alone)
- **Entity:** SuprBuild, LLC (DBA Krostio)
- **Domain:** krostio.com · **Email:** support@krost.app · **Twitter:** @krostapp

## Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (`NODE_OPTIONS=--dns-result-order=ipv4first`) |
| `npm run build` | Production build |
| `npm run lint` | ESLint 9 |
| `npm run db:migrate` | Apply auto-migrations via Supabase API |
| `npx vercel --prod` | Deploy to production |

## Key facts
- **No tests.** No test runner configured. Typecheck disabled in `next.config.ts` (permissionless v0.3.5 mismatches) — do not re-enable.
- **ESLint 9** config: `eslint.config.mjs` — extends `eslint-config-next/core-web-vitals` + `typescript`. ~2k pre-existing errors across the repo; check new files only.
- **No CI** — no `.github/workflows/`.
- **`krost/`** subdirectory is a stale copy (just .env stubs) — do not touch.
- **`CLAUDE.md`** is a sibling instruction file; AGENTS.md takes precedence.

## Auth (custom JWT, not Supabase Auth)
`Google OAuth (PKCE) + email/password` → `jose` HS256 JWT → `krost_session` cookie.
- `JWT_SECRET` env var (falls back to `SUPABASE_JWT_SECRET`)
- Middleware at `src/proxy.ts` (not `middleware.ts`) exports `updateSession as proxy` from `src/lib/middleware-core.ts`
- Protected routes: `/dashboard`, `/settings`, `/billing` — auto-creates profile on first visit
- Server / API routes: `getCurrentUser()` from `@/lib/auth-utils`; `requireRole(['gig_worker'])` from `@/lib/auth-guard`
- DB: `supabase-server.ts` (service-role, bypasses RLS) for server/API; `supabase-browser.ts` (anon-key, RLS) for browser
- Profiles: `id` defaults to `gen_random_uuid()` (no FK to `auth.users`)
- **Auth files must not be touched:** `proxy.ts`, `middleware-core.ts`, `auth-utils.ts`, `auth-guard.ts`, `jwt.ts`, `password-utils.ts`

## Billing (Paddle, not Stripe)
`paddle.ts` at `src/lib/paddle.ts`. Sandbox mode (`PADDLE_ENVIRONMENT=sandbox`), API at `sandbox-api.paddle.com`.
- `PADDLE_WEBHOOK_SECRET` not set → webhook skips signature verification (logs warning)
- `PADDLE_ONE_TIME_PRICE_ID` may not exist → checkout endpoint may fail
- Plans: Free ($0), Pro Monthly ($29.99/mo), Pro Annual ($129.99/yr), Single Report ($6.99 one-time)

## CSS — Tailwind 4 + mockup class system
- **Tailwind 4** with `@theme` in `globals.css` — no `tailwind.config.js`. Fonts: Space Grotesk (display), Inter (body 450), JetBrains Mono (mono)
- **Dashboard:** custom CSS from `dashboard-mockup.html` (source of truth, ~1128 lines) — NOT Tailwind utilities
- **Landing page:** uses mockup CSS classes (`.hero-grid`, `.dash-preview`, `.stat-band`, `.feat-dark-grid`, `.score-card-dark`, `.testi-card`, `.faq-grid-2col`) from `globals.css` in `@layer utilities`
- Key colors: `--color-cream` (bg), `--color-coral` (accent), `--color-deep-green` (banners), `--color-soft-stone` (tint), `--color-muted-slate` (labels), `--color-hairline` (borders), `--color-chart-bg` (#17171e, dark card surfaces)

## Landing page (`src/app/page.tsx`)
Server component. 14-section merged structure from `krostio-landing-mockup.html` reference:
announcement → nav → hero (2-col + dash-preview card) → platform strip → how-it-works (4-step grid) → stat band → score demo (deep green) → features dark grid → score explainer (2-col) → research/blog → testimonials → pricing → FAQ (2-col grid) → CTA → footer (dark)

## Directory structure
| Path | Purpose |
|------|---------|
| `src/proxy.ts` | Next.js middleware |
| `src/app/(dashboard)/` | Protected dashboard pages |
| `src/app/(auth)/` | Login/register |
| `src/app/(marketing)/` | Landing, learn, lenders, privacy, terms |
| `src/app/api/` | All API routes |
| `src/lib/` | Core utilities (auth, jwt, paddle, plaid, email, scoring) |
| `db/` | SQL migrations (15 files) |
| `scripts/` | Migration runner, seed, health checks |
| `blockchain/` | Solidity 0.8.20, Hardhat, Base L2 (Sepolia + Mainnet) |
| `dashboard-mockup.html` | Source of truth for dashboard CSS |

## Dashboard pages
Server components except billing client components, `connections-ui.tsx` (Plaid Link), and settings.
- Layout in `(dashboard)/layout.tsx` — auto-creates profile, passes `role`/`emailVerified`
- Routes: `/dashboard/worker/{statements,report,score,ledger,connections,analytics,alerts,privacy}` + `/dashboard/settings` + `/dashboard/billing`
- Sidebar: Dashboard, Earnings, Statement, Report, Connections, Analytics, Settings, Privacy
- Topbar (right): Connect Plaid button + New Report button (no action buttons in sidebar)

## Plaid
- Sandbox-only (`PLAID_ENV=sandbox`). Test user `user_credit_profile_good` (gig income) or `user_bank_income` (wide variety). `ins_3` (Chase) recommended. `ins_1` returns `INSTITUTION_NO_LONGER_SUPPORTED`.
- Flow: `POST /api/plaid/link-token` → `usePlaidLink` → `POST /api/plaid/exchange`
- MFA step-up required before Plaid Link for MFA-enabled users
- Platform detection is automatic after exchange

## DB migrations
Auto-applied sequentially: `migration.sql` → `migration-v2.sql` → `migration-010-email-password.sql` → `migration-011-paddle.sql` → `migration-012-email.sql` → `migration-013-mfa.sql`
- `migration-002.sql` through `migration-009.sql` exist but are NOT auto-applied — run manually if needed
- `scripts/run-migration.js` has a hardcoded plain-text Supabase password — do not commit changes to this file

## Email (Nodemailer)
- SMTP via env vars (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`). Unset → `console.warn` skip.
- **CRITICAL:** `sendEmail()` must be `await`ed — Vercel kills serverless functions after response is sent, aborting SMTP handshake on fire-and-forget.

## Blockchain (`blockchain/`)
Separate `package.json` with Hardhat. Solidity 0.8.20, deploys to Base L2.
```bash
cd blockchain && npm run compile
cd blockchain && npm run test
cd blockchain && npm run deploy:base-sepolia
cd blockchain && npm run deploy:base
```
