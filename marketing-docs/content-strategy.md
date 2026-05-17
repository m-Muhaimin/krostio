---
title: "Content Strategy — Phase 2 Pre-Launch GTM"
author: "Marketing Team"
date: "2026-05-16"
status: "final"
version: "1.0"
---

# Content Strategy: Krostio Phase 2 Pre-Launch GTM

## 1. Topic Cluster Model

### Problem Cluster
| Cluster | Core Topic | Supporting Keywords | Content Types |
|---------|-----------|-------------------|--------------|
| **The W-2 Trap** | Gig workers can't prove income | "gig worker loan denied", "1099 income verification", "no W-2 no mortgage" | Blog posts, Twitter threads, Reddit posts, LinkedIn articles |
| **Credit Invisibility** | 64M workers invisible to traditional credit | "no credit score for gig workers", "alternative credit data", "unbanked gig workers" | Explainer videos, infographics, lender-facing one-pagers |
| **Income Instability Myth** | Banks assume gig income is unstable | "gig economy income verification", "self-employed mortgage denied", "freelancer income proof" | Data-driven posts, case studies, lender API docs |

### Solution Cluster
| Cluster | Core Topic | Supporting Keywords | Content Types |
|---------|-----------|-------------------|--------------|
| **Krost Score** | Gig-worker credit scoring | "gig worker credit score", "alternative scoring model", "freelancer creditworthiness" | Landing page, blog posts, product demos, email nurture |
| **Multi-Platform Aggregation** | Combine earnings across platforms | "aggregate Uber DoorDash income", "multi-platform earnings report", "unified gig income" | Comparison tables, how-to guides, social graphics |
| **Verifiable Credentials** | Shareable income verification | "shareable income report", "on-chain credential", "income verification link" | Product walkthrough, FAQ, press releases |

### Category Cluster
| Cluster | Target Segment | Channel Focus | Content Angle |
|---------|---------------|--------------|--------------|
| **Worker Education** | Gig workers (Uber, DoorDash, Upwork, etc.) | Reddit, Twitter, TikTok, blog | "You deserve credit for your work" |
| **Lender Enablement** | Credit unions, fintech lenders, DeFi protocols | LinkedIn, email, partnerships | "Stop leaving money on the table" |
| **Industry Commentary** | Fintech media, investors, analysts | LinkedIn, PR, podcasts | "This is the next frontier of credit" |

---

## 2. ORB Distribution Plan

### Owned Channels
| Channel | Asset | Frequency | Goal |
|---------|-------|-----------|------|
| **Blog (krostio.vercel.app/blog)** | SEO-optimized posts | 2x/week | Organic traffic → waitlist signups |
| **Email List** | 7-email drip sequence | Automated | Onboarding → first platform connect → share → convert |
| **Landing Page** | Hero + 4 pillars + CTA | Always live | Waitlist conversions |
| **Twitter/X (@krostio)** | Threads, replies, polls | Daily | Brand awareness, community building |

### Rented Channels
| Channel | Asset | Frequency | Goal |
|---------|-------|-----------|------|
| **Reddit (r/gigwork, r/UberDrivers, r/doordash_drivers, r/Upwork)** | Problem-focused posts | 3x/week per sub (rotating) | Drive signups from active gig workers |
| **LinkedIn** | Lender-facing articles | 2x/week | B2B partnerships, lender interest |
| **Facebook Groups (gig worker communities)** | Resource posts | 2x/week | Community trust → signups |
| **Product Hunt** | Launch post | Launch day | Initial traction spike |

### Borrowed Channels
| Channel | Asset | Frequency | Goal |
|---------|-------|-----------|------|
| **Guest posts (fintech blogs)** | Thought leadership | 1x/month | Backlinks + authority |
| **Podcast appearances** | Founder interviews | 2/month pre-launch | Credibility + narrative |
| **Newsletter mentions** | Pitches to fintech newsletters | Weekly outreach | Referral traffic |
| **Affiliate/referral** | Gig worker influencers | Ongoing | Scaled acquisition |

---

## 3. Editorial Calendar — 14-Day Pre-Launch Sprint

| Day | Piece | Format | Distribution Channel | CTA |
|-----|-------|--------|---------------------|-----|
| **1** | "Why Gig Workers Get Denied for Loans" | Blog post (1500+ words) | Blog + Twitter thread + Reddit (r/gigwork) | "Check your Krost Score for free" |
| **2** | "The 64M invisible workers" | Twitter thread (8 tweets) | Twitter/X | "Follow @krostio to learn more" |
| **3** | "Traditional verification vs Krostio" | Comparison infographic | LinkedIn + Twitter + Instagram | "Try Krostio Verifier" |
| **4** | "Why Traditional Income Verification Fails" | Blog post (1200+ words, lender-facing) | Blog + LinkedIn | "Contact us for lender API access" |
| **5** | "I got denied for an apartment despite $8k/mo on Uber" | Reddit post | Reddit (r/UberDrivers) | Check your Krost Score link |
| **6** | Email drip Day 0 goes live | Welcome email | Email (automated) | "Connect your first platform" |
| **7** | "How Krostio calculates your score" | Twitter thread | Twitter/X | FAQ link → signup |
| **8** | "The cost of false negatives in lending" | LinkedIn article | LinkedIn | Lender one-pager download |
| **9** | "3 platforms, 1 score" | Social graphic | Twitter + Instagram | "Connect your platforms now" |
| **10** | "On-chain credentials explained" | Blog post | Blog + Twitter | "Mint your Krost Passport" |
| **11** | Reddit AMA prep + execution | AMA | Reddit (r/doordash_drivers) | "Ask me anything about gig income" |
| **12** | Lender one-pager distribution | Email outreach + DM | LinkedIn + email | "Schedule a pilot" |
| **13** | "How I got a mortgage as a gig worker" | Case study | Blog + Twitter + Reddit | "Start building your score today" |
| **14** | Pre-launch recap + waitlist push | Email + social recap | All channels | "Share Krostio with a friend" |

---

## 4. Success Metrics Table

| Metric | Target (14 days) | Tracking Method | Priority |
|--------|------------------|----------------|----------|
| Waitlist signups | [WAITLIST_TARGET] | Supabase DB | P0 |
| Blog post pageviews | 5,000+ total | Vercel Analytics | P1 |
| Email open rate | >40% | Supabase/email provider | P1 |
| Email click-through rate | >15% | Supabase/email provider | P1 |
| Platform connections | [CONNECTION_TARGET] | Supabase DB | P0 |
| Reddit post engagement | 50+ upvotes avg | Manual tracking | P2 |
| Twitter impressions | 50,000+ | Twitter Analytics | P2 |
| LinkedIn article views | 2,000+ | LinkedIn Analytics | P2 |
| Referral signups | [REFERRAL_TARGET] | Supabase DB | P1 |
| Lender inquiries | 5+ | CRM/email | P1 |

---

## 5. Content-to-Waitlist Funnel Tracking Plan

### Funnel Stages

```
Awareness (impressions, views)
  → Interest (clicks, reads, watches)
    → Consideration (waitlist signup)
      → Activation (platform connected)
        → Retention (score generated, share)
          → Revenue (paid conversion)
```

### Tracking Implementation

| Stage | Trigger | Event | Tool |
|-------|---------|-------|------|
| **Awareness** | User sees content | `content_impression` | UTM params, Twitter/Reddit native analytics |
| **Interest** | User clicks link | `content_click` | Short-link redirect (e.g., krostio.vercel.app/?ref=) |
| **Consideration** | User lands on page | `page_view` + `waitlist_signup` | Vercel Analytics + Supabase |
| **Activation** | User connects platform | `platform_connected` | Supabase event log |
| **Retention** | User views score | `score_computed` | Supabase event log |
| **Revenue** | User pays | `subscription_created` | Stripe webhook → Supabase |

### UTM Parameter Convention

```
?utm_source={channel}&utm_medium={format}&utm_campaign=phase2_launch&utm_content={piece_id}
```

| Channel | utm_source | utm_medium |
|---------|-----------|------------|
| Twitter/X | twitter | tweet / thread / reply |
| Reddit | reddit | post / comment / ama |
| LinkedIn | linkedin | article / post / dm |
| Email | email | drip / broadcast |
| Blog | blog | organic |
| Referral | referral | link / code |

### Attribution Windows

- Content click → signup: 30-day cookie
- Email click → signup: 7-day cookie
- Social view → signup: 1-day (no cookie, modeled)
- Referral: permanent (via referral code)

### Dashboard View (planned)

Build a Supabase query that joins:
- `waitlist_signups.created_at`
- `content_clicks.source`
- `platform_connections.user_id`
- `subscriptions.user_id`

This gives a full content-to-revenue funnel per channel.

---

*Update this document weekly during Phase 2. All bracketed targets need input from founding team before launch.*
