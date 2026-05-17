# Krostio — Phase 0 Gap Closure Plan (PRD v3.0 Checkpoint)

## CRITICAL BLOCKERS (Product Video Recording)

### 1. app.krostio.com — DNS FAILURE
- **Issue:** Subdomain doesn't resolve. "Could not resolve host"
- **Fix:** Vercel project domain config or DNS CNAME record needed
- **Priority:** P0 — No video without this

### 2. krostio.com/check-score — 404 NOT FOUND
- **Issue:** Route exists locally at `app/(marketing)/check-score/page.tsx` but live deploy returns 404
- **Fix:** Re-deploy from main branch or Vercel rewrite rule
- **Priority:** P0 — Key conversion surface for product video

### 3. Proxy.ts auth protection missing
- **Issue:** No middleware/proxy.ts — dashboard routes are publicly accessible
- **Priority:** P1 — Security risk + inconsistent user flow in video

### 4. Pricing page missing
- **Issue:** PRD requires `app/(marketing)/pricing/page.tsx` — doesn't exist
- **Priority:** P1 — Visible in product tour

## API ROUTE FIXES

### 5. Ledger routes querying wrong tables
- ledger/summary, ledger/entries, ledger/export all query `income_records` instead of `ledger_entries`
- reports/generate queries `income_verifications` — inconsistent
- **Priority:** P1 — Breaks end-to-end data flow in demo

### 6. Missing ingest routes
- ingest/[platform]/sync — manual re-sync
- ingest/csv-upload — CSV import
- **Priority:** P2 — Phase 1 addition

## LIBRARY FIXES

### 7. Missing middleware-core.ts
- No middleware pattern for auth protection
- **Priority:** P1 — Security

### 8. proxy.ts needs creation
- Next.js 16 convention replaces middleware.ts
- Dashboard route protection

## DEPLOYMENT

### 9. Vercel deployment from working branch
- Need to push and trust that Vercel picks up .env variables
- Real API keys are in Vercel dashboard, not local .env

## HANDOFF MAP

```
┌─────────────────────────────────────────────────────┐
│                Sprint 0.5 — Product Video Sprint     │
│                  May 17 → May 20                     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Frontend Subagent          Backend Subagent          │
│  ┌──────────────────┐     ┌──────────────────┐        │
│  │ • /pricing page  │     │ • Ledger table    │       │
│  │ • proxy.ts       │     │   migration       │       │
│  │ • /check-score   │     │ • Missing ingest   │       │
│  │   verification   │     │   routes           │       │
│  │ • Design checks  │     │ • Stripe webhook   │       │
│  └──────────────────┘     └──────────────────┘        │
│                                                       │
│  DevOps Subagent              Doc Subagent             │
│  ┌──────────────────┐     ┌──────────────────┐        │
│  │ • Vercel config  │     │ • Update AGENTS.md│       │
│  │ • DNS fix        │     │ • Document live   │       │
│  │ • .env restore   │     │   endpoint URLs   │       │
│  │ • Deploy         │     │ • API reference   │       │
│  └──────────────────┘     └──────────────────┘        │
│                                                       │
└─────────────────────────────────────────────────────┘
```
