# Krostio — Full Deployment & Codebase Disparity Report

## Foundation Finding: Two Different Codebases

| Aspect | Live (krostio.com) | Local (W:/krostio-v2) |
|--------|-------------------|----------------------|
| **Framework** | Vite + React SPA | Next.js 16 App Router |
| **Router** | react-router 7.15.1 | Next.js file-based routing |
| **Build system** | Vite | `next build` |
| **Config** | No vercel.json | `next.config.ts` (standalone output) |
| **CSS** | Tailwind v4.3.0 | Tailwind v4.1.11 |
| **API layer** | None (SPA only) | 27 API routes under `app/api/` |
| **Auth** | None | Supabase Auth (proxy.ts) |
| **Database** | None | 18 Supabase tables |
| **State** | LIVE at krostio.com | NOT DEPLOYED |

## What the Live Site Serves

krostio.com returns a 2.9KB HTML shell + 194KB JS bundle (Vite SPA). Every sub-route returns 404:
- krostio.com/check-score → 404
- krostio.com/login → 404
- krostio.com/about → 404
- krostio.com/dashboard → 404
- app.krostio.com → DNS failure (never configured)

The live site is essentially a static landing page with no backend.

## What the Local Next.js App Has (Ready but Undeployed)

- 27 API routes (auth, ledger, score, reports, passport, stripe, plaid, platform)
- 6 marketing pages (/, /about, /blog, /check-score, /privacy, /terms)
- 3 auth pages (/login, /register, /onboarding)
- 8 dashboard pages (/dashboard/*)
- proxy.ts with Supabase auth protection (Next.js 16 convention)
- Full scoring engine (9-factor, 300-850 range)
- PDF report generation (react-pdf)
- Stripe billing integration
- Supabase database schema (18 tables)
- Plaid + Argyle integrations
- PostHog analytics

## Blocker Hierarchy for Product Video

1. **No deployment exists** → can't record at any URL
2. **Truncated .env keys** → need real Supabase + Stripe keys
3. **Not a git repo** → can't push to Vercel
4. **No Vercel project linked** → no deployment target
5. **Missing /pricing page** (PRD spec) → gap in demo flow
6. **Ledger routes query legacy tables** → data flow broken end-to-end
