---
title: "Pre-Launch Email Drip Sequence — Phase 2"
author: "Marketing Team"
date: "2026-05-16"
status: "final"
segment: "Newly signed-up users who haven't connected a platform"
sequence_length: "7 emails (Day 0, 1, 3, 5, 8, 11, 14)"
goal: "Activate → Connect → Share → Convert"
---

# Email Drip Sequence: Pre-Launch Nurture for Krostio

## Overview

| Email | Day | Trigger | Goal Metric |
|-------|-----|---------|-------------|
| 0 — Welcome | Day 0 | Signup completed | Click "Connect first platform" |
| 1 — Platform Prompt | Day 1 | No platform connected within 24h | Click "Connect now" |
| 2 — Social Proof | Day 3 | Still no platform connected | Click "See what others earn" |
| 3 — Diversity | Day 5 | 1+ platforms connected, <2 | Connect second platform |
| 4 — Share | Day 8 | Score computed | Share score with lender |
| 5 — Upgrade | Day 11 | Trial active (or free tier) | Start Pro trial |
| 6 — Win-back | Day 14 | Trial ended, not converted | Click "Reactivate" |

---

## Email 0: Welcome — Day 0

**Trigger:** User signs up on waitlist or creates account
**Goal:** Orient user + connect first platform

**Subject Line:** Welcome to Krostio — your gig income finally counts
**Preview Text:** Here's how to check your Krost Score in 2 minutes

**Body Outline:**

```
Hey {{first_name}},

Thanks for joining Krostio. You're part of a community of gig workers
who are tired of being told their income "doesn't count."

Here's what happens next:

1. Connect your first platform (Uber, DoorDash, Upwork, Instacart, etc.)
   → Takes 30 seconds via secure OAuth
   → We never see your password

2. Get your Krost Score (300-850)
   → Based on 9 factors across your earnings
   → Not a credit score — an income quality score

3. Share your verified income with lenders, landlords, anyone
   → Shareable link + PDF report
   → No more dump-and-pray bank statements

Start with one platform:
[CTA Button: Connect Your First Platform →]

It's free. No credit check. No commitment.

You've already taken the hardest step — proving your income exists.
Now let's show them the numbers.

— The Krostio Team
```

**Success Metric:** Click-through rate on "Connect Your First Platform" > 40%

---

## Email 1: Platform Prompt — Day 1

**Trigger:** 24 hours since signup, no platform connected
**Goal:** Overcome inertia, drive first connection

**Subject Line:** Your Krost Score is waiting
**Preview Text:** 2 minutes to see how lenders see your income

**Body Outline:**

```
Hey {{first_name}},

You signed up for Krostio yesterday, but haven't connected a platform yet.

We get it — you're busy driving, delivering, or freelancing.
This takes less time than most Uber trips.

Connect one platform. Any platform.

[CTA Button: Connect Now — Takes 2 Minutes →]

After you connect, we'll show you:
✓ Your current Krost Score
✓ How your income looks to lenders
✓ What you can do to improve it

Most users who connect one platform feel a sense of relief.
Finally, someone who sees their full picture.

— The Krostio Team

P.S. Still unsure? Here's what {{user_type}} drivers typically score:
[PERSONALIZED_STATS_PLACEHOLDER]
```

**Success Metric:** Click-through rate > 25%
**Personalization:** Use platform if known from signup source (e.g., "Uber drivers typically score 620-720")

---

## Email 2: Social Proof — Day 3

**Trigger:** 72 hours since signup, no platform connected
**Goal:** Reduce skepticism, activate through social proof

**Subject Line:** {{first_name}}, 2,400 gig workers already use Krostio
**Preview Text:** Here's what they're saying about their scores

**Body Outline:**

```
Hey {{first_name}},

You're not the only gig worker who's tired of being invisible to lenders.

2,400 gig workers have already connected their platforms
and generated Krost Scores. Here's what they're saying:

{{testimonial_1}}
— {{testimonial_1_author}}, {{testimonial_1_platform}} driver, {{testimonial_1_city}}

{{testimonial_2}}
— {{testimonial_2_author}}, {{testimonial_2_platform}} freelancer, {{testimonial_2_city}}

{{testimonial_3}}
— {{testimonial_3_author}}, {{testimonial_3_platform}} courier, {{testimonial_3_city}}

The average Krost Score among beta users is {{average_score}}.
Want to see where you stand?

[CTA Button: Check Your Score →]

— The Krostio Team
```

**Success Metric:** Click-through rate > 20%
**Note:** Testimonials marked {{testimonial_*}} are [PLACEHOLDER] — replace with real user quotes before launch.

---

## Email 3: Diversity — Day 5

**Trigger:** User has 1 platform connected, fewer than 2
**Goal:** Connect a second platform to improve score

**Subject Line:** One platform is good. Two is better.
**Preview Text:** How adding a second platform boosts your Krost Score

**Body Outline:**

```
Hey {{first_name}},

You've connected {{connected_platform}}. Nice work.

Here's something most people don't realize: your Krost Score goes up
when you connect multiple platforms.

Why? Because lenders see platform diversity as income stability.
If DoorDash volume drops, your Uber or Upwork income can compensate.

Right now, you're showing lenders only {{connected_platform}}.
But you might earn on {{potential_platforms}} too.

Add it in 30 seconds:

[CTA Button: Connect Another Platform →]

Users with 2+ platforms score an average of {{score_boost}} points higher.

Every platform is another proof point.

— The Krostio Team
```

**Success Metric:** Second platform connection rate > 30%
**Personalization:** Recommend specific platforms based on user's known earnings patterns or popular combos (e.g., "DoorDash + UberEats drivers earn 22% more on average")

---

## Email 4: Share — Day 8

**Trigger:** Krost Score computed, link generated
**Goal:** Drive share-to-lender action, validate product

**Subject Line:** Your Krost Score is ready — here's how to use it
**Preview Text:** Share your verified income with one click

**Body Outline:**

```
Hey {{first_name}},

Your Krost Score is live: {{score}} ({{score_category}})

Here's what that means:
- Income consistency: {{consistency_rating}}
- Platforms verified: {{platform_count}}
- Monthly average: ${{monthly_average}}
- Data history: {{history_months}} months

Your shareable Verifier link is ready:
{{verifier_link}}

How to use it:

→ Applying for an apartment? Send the link to your leasing office.
→ Refinancing your car? Forward it to your credit union.
→ Getting a credit card? Upload it as proof of income.
→ Just curious? Bookmark it for your next loan application.

You can also download a PDF report from your dashboard.

Lenders who see a Krostio report tell us they approve applications
faster because the income data is structured and verified.

[CTA Button: Copy My Verifier Link →]

— The Krostio Team

P.S. On-chain optional: If you want the highest-trust version,
mint your Krost Passport on Base L2. Details in your dashboard.
```

**Success Metric:** Share link clicked/copied > 15%; PDF download > 10%
**Personalization:** Dynamic score, category, consistency, platform count, monthly average, history months

---

## Email 5: Upgrade — Day 11

**Trigger:** User has active free trial (or on free tier) and has connected at least 1 platform
**Goal:** Convert to paid (Pro $19/mo or Starter $9 one-time)

**Subject Line:** You've seen your score — here's what you're missing
**Preview Text:** Unlimited reports, 5 platforms, and on-chain Passport

**Body Outline:**

```
Hey {{first_name}},

You've been using Krostio on the free plan. Here's what's available
when you upgrade:

| Feature | Free | Starter ($9 one-time) | Pro ($19/mo) |
|---------|------|----------------------|--------------|
| Platforms | 1 | 3 | Unlimited (5+) |
| Reports | Summary | 1 PDF download | Unlimited reports |
| Verifier links | 1 (summary) | 1 | Unlimited, real-time |
| Krost Passport | — | — | ✓ (on-chain, soul-bound) |
| Priority support | — | email | in-app chat + email |

Which one fits you?

→ Just need one PDF for a pending application? Grab Starter for $9.
→ Planning to apply to multiple lenders? Pro pays for itself.

[CTA Button: See Plans & Pricing →]

Your score is {{score}}. Your income data covers {{history_months}} months.
Don't let a free-tier limit hold you back from the loan you deserve.

— The Krostio Team
```

**Success Metric:** Click to pricing page > 20%; conversion to paid > 5%

---

## Email 6: Win-back — Day 14

**Trigger:** Trial ended (or 14 days since signup with no conversion and no platform)
**Goal:** Last-chance conversion or re-engagement

**Subject Line:** Your Krostio access expires soon
**Preview Text:** Don't lose your score and data

**Body Outline:**

```
Hey {{first_name}},

Your Krostio trial {{is ending / has ended}}.

Here's what you'll lose if you don't upgrade:

→ Your Krost Score — {{score}} — will become inactive
→ Your Verifier links will stop updating
→ Your platform connections will require re-authorization

But here's the thing: your income data is still there.
Your platforms are still connected.
Your score is still computed.

One click reactivates everything.

[CTA Button: Reactivate My Account →]

If now isn't the right time, we understand. Your data will be safely
stored for {{retention_days}} days. You can always come back.

But if you're planning to apply for a loan, lease, or credit card
in the next few months, keeping your Krostio active means you're
ready to share verified income at a moment's notice.

— The Krostio Team

P.S. Still unsure? Reply to this email and tell us what's blocking you.
We read every response.
```

**Success Metric:** Re-activation click > 8%; reply rate > 2% (qualitative signal)
**Segmentation:** Two variants — one for users who connected platforms but didn't convert, one for users who never connected. Tailor CTA accordingly.

---

## Technical Notes for Implementation

### Trigger Conditions
| Email | Condition in Supabase/DB |
|-------|------------------------|
| 0 (Welcome) | `users.created_at` = NOW |
| 1 (Platform) | `users.created_at` < NOW - 1d AND `platform_connections.user_id` IS NULL |
| 2 (Social) | `users.created_at` < NOW - 3d AND `platform_connections.user_id` IS NULL |
| 3 (Diversity) | `platform_connections.user_id` COUNT = 1 AND 5 days since signup |
| 4 (Share) | `krost_scores.user_id` = user AND score IS NOT NULL |
| 5 (Upgrade) | `subscriptions.user_id` IS NULL AND `platform_connections.user_id` COUNT >= 1 |
| 6 (Win-back) | `subscriptions.user_id` IS NULL AND `users.created_at` >= NOW - 14d |

### Timing
- All emails send at 10:00 AM user's timezone (detect via signup geo-IP or browser timezone)
- If user converts (connects platform, upgrades, etc.), remove from subsequent emails in the sequence
- Win-back email only sends once, then user moves to monthly re-engagement cadence

### Placeholders to Fill Before Launch
- `{{testimonial_*}}` — real beta user quotes
- `{{average_score}}` — actual beta average
- `{{score_boost}}` — actual stat from multi-platform users
- `{{retention_days}}` — data retention policy (90 days recommended)
- `[BETA_USER_COUNT]` — current beta user count
- `[BETA_LENDER_COUNT]` — current lender pilot count

### A/B Testing Plan (Post-Launch)
| Email | Variant A | Variant B | Metric |
|-------|-----------|-----------|--------|
| Welcome | "check your score" | "see your income verified" | CTR |
| Platform | FOMO ("others scored X") | Utility ("apply for X") | CTR |
| Upgrade | Feature table | Comparison table | Conversion |
| Win-back | Scarcity ("lose access") | Empathy ("come back when ready") | Re-activation |
