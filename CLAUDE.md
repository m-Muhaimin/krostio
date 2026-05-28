@AGENTS.md

# Krostio — Claude-specific notes

## Project identity
- Product is **Krostio** (never "Krost" alone)
- Legal entity: **SuprBuild, LLC** (DBA Krostio)
- Domain: krostio.com

## Key files to know
| File | Purpose |
|------|---------|
| `src/proxy.ts` | Next.js middleware (not `middleware.ts`) |
| `src/lib/auth-utils.ts` | `getCurrentUser()` for server components/API routes |
| `src/lib/auth-guard.ts` | `requireRole()` for route protection |
| `src/lib/jwt.ts` | Custom JWT signing/verification |
| `src/lib/supabase-server.ts` | Service-role DB client (bypasses RLS) |
| `src/lib/supabase-browser.ts` | Anon-key DB client (RLS enforced) |
| `src/lib/scoring-engine.ts` | 0–100 consistency score algorithm |
| `src/lib/plaid-sync.ts` | Plaid data sync + gig platform detection |
| `src/lib/paddle.ts` | Paddle billing configuration |
| `src/lib/email.ts` | Email templates (Nodemailer) |
| `src/lib/middleware-core.ts` | Session middleware logic |
| `dashboard-mockup.html` | Source of truth for all dashboard CSS classes |
| `src/app/globals.css` | Tailwind 4 theme + all custom CSS classes |

## Must-not-touch files
- `src/proxy.ts`
- `src/lib/middleware-core.ts`
- `src/lib/auth-utils.ts`
- `src/lib/auth-guard.ts`
- `src/lib/jwt.ts`
- `src/lib/password-utils.ts`

## Dashboard CSS conventions
- NEVER use Tailwind utility classes in dashboard pages — use mockup classes from `dashboard-mockup.html`
- Page structure: `.pg-header` > `.pg-title` + `.pg-sub` (left-aligned, icon on left)
- Cards: `.card` > `.card-head` (.card-title + .card-sub) + `.card-body`
- Metrics row: `.metrics-row` > `.metric-card` (`.mc-eyebrow` + `.mc-value`)
- Tables: `.ledger-table` or plain `<table>` with `.stmt-table-filter-bar` filters
- Animations: `.fade-up` + `.d0`–`.d7` delay classes
- Buttons: `.btn-primary`, `.btn-outline`, `.btn-ink`, `.btn-generate`

## Statements page
- Route: `/dashboard/worker/statements` (was `/reports`)
- Shows 4 metric cards (Total Deposits, Net Total, Avg/Transaction, Platforms Active)
- Full transaction history table with filters

## Report page
- Route: `/dashboard/worker/report`
- Krostio Income Verification Report — score hero, factor chips, platform breakdown
- Generate PDF action bar at bottom

## Critical rules
- `sendEmail()` must be `await`ed — never fire-and-forget
- All dashboard pages are server components except connections, billing, and settings
- `krost/` subdirectory is stale — do not touch
- Typecheck is disabled — do not re-enable
