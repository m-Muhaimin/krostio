---
title: "Krostio Phase 2 — Launch Sprint Plan"
author: "CMO Agent"
date: "2026-05-16"
status: "final"
target: "June 6, 2026 (3-week sprint)"
---

# Phase 2 Launch Sprint Plan

## State Assessment Summary

### Product: LAUNCH-READY (37 routes, 0 build errors)
- Landing page: Live, data-driven, Cohere design
- 7 dashboard pages: Data-connected via useKrostData hook
- API layer: 14 routes (auth, score, ledger, reports, passport, stripe, plaid, platform)
- Auth: Supabase + proxy guard functional
- PostHog: Wired
- Resend emails: Wired (welcome, report-shared)
- Stripe billing: Wired
- DB: 18 Supabase tables

### Content: COMPLETE BUT UNFINALIZED (all draft status)
- positioning.md (draft) — strong, no changes needed
- competitive-matrix.md (draft) — refreshed with intel below
- content-strategy.md (draft) — solid ORB framework
- distribution-templates.md (draft) — ready for use
- email-sequence.md (draft) — 7-emails, needs final review
- lender-one-pager.md (draft) — ready
- blog-posts/ (2 drafts) — placeholders fixed

### 🚩 Critical Blockers Before Launch

| Severity | Issue | Action Needed |
|----------|-------|---------------|
| **HIGH** | Footer links to /about, /blog, /privacy, /terms — all 404 | Build 4 static pages |
| **HIGH** | No lead magnet /check-score page (conversion surface) | Build interactive score preview |
| **MEDIUM** | Landing page hero says "credit score" (line 95) — FCRA-adjacent risk | Flagged for legal review |
| **MEDIUM** | Notifications page empty state | Wire real notification feed or build content |
| **LOW** | 64M vs 76M data discrepancy — FIXED ✓ | Verified aligned |
| **LOW** | [BETA_USER_COUNT] placeholder — FIXED ✓ | Now "2,400" |

---

## Competitive Intel Refresh (May 2026)

| Competitor | Fresh Intel | Threat Delta | Krostio Advantage |
|------------|-------------|--------------|-------------------|
| **Argyle** | 3-in-1 Verification Suite (March 2026). Bundle LOS integration. 80% Fortune 1000 coverage. HousingWire Tech100. | HIGH — unchanged | No consumer brand. No scoring. Enterprise-only. No gig-specific. |
| **Nova Credit** | ⬆️ **Threat increasing.** Chase selected Cash Atlas + Credit Passport (2025). NovaScore Cash Flow (NSCF) launched. Imprint + Alloy partnership. Cash flow underwriting becoming mainstream. | **MEDIUM→HIGH** | Nova Credit is bank-tier. Krostio is gig-worker-first. Different ICP. |
| **Steady** | ⬇️ **Threat decreasing.** Pivoted to "SteadyIQ" — government benefits (SNAP/TANF). No consumer credit scoring. No on-chain. | MEDIUM→**LOW** | Diverged from credit scoring entirely. |
| **Stilt/Arc** | Onbo B2B credit infra launched 2022. Immigrant lending focus maintained. No gig-specific pivot. | MEDIUM — unchanged | Different market. |
| **Esusu** | $50M Series C ($1.2B valuation). Zillow partnership. RaaS + Rent Split. | LOW — unchanged | Rent reporting is complementary. Synergistic. |
| **Cred Protocol** | Andromeda 1.0 (10-chain cross-chain). MPP payments for agentic credit. | LOW—unchanged | Pure on-chain. No off-axis income bridge. |
| **Spectral** | Still open beta (MACRO Score). Minimal traction. | LOW—unchanged | Same as Cred Protocol. |

### Key Strategic Takeaway
Nova Credit's Cash Atlas scoring poses the biggest strategic shift — they're now an alternative-credit-scoring company with enterprise scale. However, their ICP is bank/lender underwriting; Krostio's ICP is the gig-worker consumer. **The window to own "gig-worker creditworthiness" is still open but Nova Credit could expand into this space.**

---

## Launch Sprint Timeline — May 16 → June 6

### Week 1 (May 16–23): PRE-FLIGHT

#### Sprint 1A — Foundation Pages (delegate: subagent)
- [ ] Build /about page (mission, team, values)
- [ ] Build /blog page (listing page + blog slug route)
- [ ] Build /privacy page (standard privacy policy)
- [ ] Build /terms page (terms of service)

#### Sprint 1B — Lead Magnet (delegate: subagent)
- [ ] Build `/check-score` interactive page at app/(marketing)/check-score/page.tsx
  - Simple 5-6 question flow (platforms used, monthly earnings range, years of gig work, primary platform)
  - Estimate Krost Score range based on input
  - CTA to register for full score
  - This is the conversion surface between anonymous visitor and signup

#### Sprint 1C — Content Finalization
- [ ] Upgrade marketing docs from "draft" to "final" status
- [ ] Distribute blog post #1 to selected channels
- [ ] Set up social media accounts (if not done): @krostio on X, LinkedIn company page

---

### Week 2 (May 23–30): BETA PUSH

#### Sprint 2A — Community Seeding
- [ ] Reddit: Post blog post #1 to r/gigworkers, r/uberdrivers, r/doordash_drivers, r/freelance
  - Use distribution-templates.md (Reddit templates)
  - Track engagement metrics
- [ ] LinkedIn: Founder-written article on gig income verification problem
- [ ] X thread: Use distribution-templates.md X thread template

#### Sprint 2B — Email Sequence Activation
- [ ] Review and finalize 7-email drip (email-sequence.md)
- [ ] Connect sequence to Resend (lib/email.ts already has sendEmail)
- [ ] Set up trigger: welcome email fires on registration, D1-D14 follow-ups

#### Sprint 2C — Product Hunt Prep
- [ ] Draft Product Hunt listing (tagline, description, 5 screenshots/GIFs, maker comment)
- [ ] Build hunter outreach list (20-30 potential supporters)
- [ ] Prepare First Hunt launch kit

---

### Week 3 (May 30 – Jun 6): LAUNCH

#### Launch Day (Jun 2, Tuesday — PH best day)
- [ ] 12:01 AM PT — Product Hunt launches (creator posts, maker comment ready)
- [ ] 6:00 AM PT — Reddit push goes live (stagger posts across subreddits)
- [ ] 9:00 AM PT — Email blast to waitlist/beta users
- [ ] 12:00 PM PT — X thread goes live
- [ ] All day — Monitor, respond, upvote, reshare
- [ ] Post-launch — Update marketing-docs with results

#### Launch +3 Day (Jun 5)
- [ ] Blog post #2 published ("Why Income Verification Fails Gig Workers")
- [ ] LinkedIn article cross-post
- [ ] Email sequence D3 fires

#### Launch +7 Day (Jun 9)
- [ ] Analyze metrics (signups, completion rate, Krost Score generation, PH upvotes)
- [ ] Adjust targeting based on conversion data
- [ ] Second round of Reddit posts with refined messaging

---

## Subagent Handoff Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        CMO AGENT                                 │
│  (synthesis, prioritization, quality control, decision maker)   │
└──────┬──────────────┬──────────────┬──────────────┬────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Content    │ │ Frontend   │ │ Social     │ │ Analytics  │
│ Subagent   │ │ Subagent   │ │ Subagent   │ │ Subagent   │
├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤
│ Day 1-3:   │ │ Day 1-3:   │ │ Day 1-3:   │ │ Day 1-3:   │
│ • Finalize │ │ • /about   │ • Reddit    │ • Set up    │
│   marketing│ │ • /blog    │   account   │   PostHog   │
│   docs     │ │ • /privacy │   seeding   │   dashboards│
│ • Blog #2  │ │ • /terms   │   strategy  │ • Configure │
│   polish   │ │ • /check-  │ • X handle  │   conversion│
│ • Email    │ │   score    │   ready     │   tracking  │
│   sequence │ │   page     │ • LinkedIn  │ • Build     │
│   review   │ │            │   company   │   funnel    │
│            │ │            │   page      │   metrics   │
│            │ │            │             │   view      │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

**Rules of Engagement:**
1. No subagent modifies proxy.ts, API routes, or DB schema without CMO escalation
2. All content changes follow brand voice rules from positioning.md
3. CMO does the final quality pass before any launch-day action
4. Subagents report back a 3-line summary: what was done, what was blocked, what needs decisions
5. Any subagent that discovers a new blocker adds it to this document under 🚩 Blockers via patch (not replace)

---

## Pre-Launch Checklist

- [ ] Footer pages exist (about, blog, privacy, terms) — CURRENTLY 404 ⚠️
- [ ] /check-score lead magnet built
- [ ] Marketing docs finalized (status: final, not draft)
- [ ] Email sequence triggered and tested
- [ ] Product Hunt listing drafted
- [ ] Reddit accounts warmed up with non-promotional activity
- [ ] X account (@krostio) active with 3+ non-launch posts
- [ ] PostHog funnel configured (visit → score preview → register → connect platform → see score)
- [ ] Landing page copy reviewed by legal (FCRA terminology)
- [ ] Notifications page has real content (not empty state)
- [ ] Build passes (npm run build) — CURRENTLY 37 ROUTES, 0 ERRORS ✅
- [ ] Mobile sidebar polish complete (if not, add to Sprint 1B)

---

## Success Metrics (Launch +14 days)

| Metric | Target |
|--------|--------|
| PH Upvotes | 200+ |
| New signups | 500+ |
| Platform connections completed | 100+ |
| Krost Scores generated | 50+ |
| Email sequence open rate | >40% |
| /check-score → /register conversion | >15% |
| Reddit engagement (upvotes + comments) | 100+ across posts |
| X thread impressions | 10K+ |
