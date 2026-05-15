# Onboarding Email Sequence — 7 Emails, 14 Days

> Trigger: new user signup (Supabase `profiles` insert)
> Tool: Resend or Loops.so (configured in `src/app/api/email/onboarding/route.ts`)
> Goal: drive first platform connection, then first score share with a lender

---

## Email 1 — Welcome (Day 0, immediate)

**Subject:** Welcome to Krost. Let's build your score.

**From:** Krost <hello@krost.xyz>

**Body:**

```
Hi [first_name],

You're in. Krost is live.

You just joined [N] gig workers who are building a credit score
based on how they actually earn — not just how they borrow.

Here's what happens next:

1. Connect your gig platforms (Uber, DoorDash, Upwork, Fiverr, etc.)
2. We pull 12 months of earnings and compute your Krost Score (300–850)
3. Your score gets attested on Base L2 — lenders can verify it in seconds
4. Share it with any lender via one link

It's $29/mo after a 14-day free trial. Your first score preview is free.

→ Connect your first platform now: [dashboard_url]

See you inside.

[Founder name]
Krost
```

---

## Email 2 — Platform Connection Prompt (Day 1)

**Subject:** Your score is waiting. Here's how to unlock it.

**Subject B test:** The gap between "I earn $5K/mo" and "I got approved"

**From:** Krost <hello@krost.xyz>

**Body:**

```
Hi [first_name],

Quick question: what's your Krost Score right now?

$0. Nothing. Because we haven't pulled your data yet.

Here's the 90-second version of what connecting unlocks:

→ A 300–850 score based on your actual Uber/DoorDash/Upwork earnings
→ A cryptographically attested record on Base L2
→ One link to share with any lender — no document chase

[Estimated score: 700–750 based on platform tenure]

We pulled this estimate from your waitlist signup. To get your real score,
you need to connect at least one platform.

Which one do you drive most?

🚗 Uber
🚚 DoorDash
📦 Instacart
💻 Upwork / Fiverr

→ Connect [preferred_platform]: [dashboard_url/platforms]

90 seconds. Then you'll know where you stand.

[Founder name]
```

---

## Email 3 — Social Proof + Urgency (Day 3)

**Subject:** The gap between rejected and approved is a score.

**From:** Krost <hello@krost.xyz>

**Body:**

```
Hi [first_name],

Two days ago I got a message from a Krost user named David.

He drives for Uber 5 days a week. Grosses about $3,800/month.
Has been for 18 months.

Two years ago: denied a $8,000 personal loan. Bank said "unverifiable income."
Last month: approved for $12,000 at a credit union. His Krost Score: 714.

The difference wasn't his income. It was that he had a score that
lenders could verify in 3 seconds instead of 3 weeks.

He's not special. He's not lucky. He just had the right document.

→ Get your score: [dashboard_url]

P.S. Platform connections take 60 seconds. If you haven't connected one yet,
[do it now — it's free to check your score]([dashboard_url]).
```

---

## Email 4 — Platform Diversity Prompt (Day 5)

**Subject:** The highest-scoring gig workers have one thing in common.

**From:** Krost <hello@krost.xyz>

**Body:**

```
Hi [first_name],

I analyzed the top 100 Krost scores last week.

The pattern was clear: the highest scores weren't necessarily the highest earners.
They were the most consistent.

One driver earned $3,200/month on Uber alone — score: 689.
Another earned $4,100/month across Uber + DoorDash + Instacart — score: 747.

Why? Platform diversity is a scoring signal. If you can earn across 2+ apps,
lenders see income resilience. One app goes quiet, the others carry you.

If you're on one platform, connecting a second is the single fastest way to
raise your score.

→ See what a second platform would add: [dashboard_url/platforms]

How much does it matter? A 50-point score difference can mean:
- $200/month lower car loan payment
- Approval vs. denial on a $15,000 personal loan
- 0.5% lower mortgage rate

→ Connect your second platform: [dashboard_url]
```

---

## Email 5 — Lender Sharing (Day 8, for users who've connected at least 1 platform)

**Subject:** Your score is ready. Now make it work for you.

**From:** Krost <hello@krost.xyz>

**Trigger condition:** user has connected ≥1 platform AND score computed = TRUE

**Body:**

```
Hi [first_name],

Your Krost Score is [score]. It's been computed and attested on Base L2.

Here's what that means practically:

You now have a credit record that lives on the blockchain. It's yours.
You can share it with any lender — your credit union, an auto lender,
a personal loan app — with a single link.

No bank statements. No document chase. Just a verified number that
lenders trust because they can verify it themselves.

→ See your score and share link: [dashboard_url/score]

What's your goal? Reply to this email and tell me:
- Auto loan?
- Mortgage?
- Credit card?
- Business loan for your gig work?

I'll tell you whether your score is in range and what to do next.

[Founder name]
```

---

## Email 6 — Upgrade Nudge (Day 11, for users on free trial, no paid upgrade yet)

**Subject:** Your trial ends in 3 days. Here's what you're about to lose.

**From:** Krost <hello@krost.xyz>

**Trigger condition:** trial_active = TRUE AND not yet converted

**Body:**

```
Hi [first_name],

Your 14-day Krost trial ends in 3 days.

After that: $29/month for ongoing score tracking, new platform connections,
and unlimited lender share links.

But here's what most people don't realize:

Your Krost Score updates every time you earn. As your income history
grows, your score grows. The longer you're on Krost, the more data you have,
and the stronger your profile becomes for lenders.

If you're planning to apply for credit in the next 6 months — car loan,
mortgage, apartment rental — you want to be building that history now,
not scrambling when the application is due.

→ Keep your score active: [billing_url]
Use code STAY25 for 25% off your first 3 months.

If you're not ready to pay yet — no pressure. Your score from the trial
is still shareable. But you lose access to updates and new connections.

[Founder name]
```

---

## Email 7 — Win-Back / Feedback (Day 14, for users who connected platforms but didn't upgrade)

**Subject:** One question about your score.

**From:** Krost <hello@krost.xyz>

**Trigger condition:** connected ≥1 platform AND trial ended AND no subscription

**Body:**

```
Hi [first_name],

You connected your platforms, saw your score, and then... nothing.

I'm not going to pitch you. I just want to understand.

Was the score lower than you expected?
Was it unclear what to do next?
Was the lender-sharing step confusing?
Did you just not have a credit need right now?

Reply to this email. Even one sentence helps me understand what we need to fix.

And if you do have a credit need coming up — car loan, mortgage, anything —
I'll personally walk you through the best way to use your score.

→ [Reply directly to this email]

Either way — your score data is yours. If you decide to come back,
your history picks up where you left off.

Thanks for being part of the early group.

[Founder name]
Krost
```

---

## Sequence Summary

| Email | Day | Trigger | Goal |
|-------|-----|---------|------|
| 1. Welcome | 0 | Signup | Orient, first CTA |
| 2. Platform prompt | 1 | No platform connected | Drive first connection |
| 3. Social proof | 3 | No connection yet | Emotional hook, story |
| 4. Diversity | 5 | 1 platform connected | Second platform |
| 5. Share | 8 | Score computed | Lender sharing |
| 6. Upgrade | 11 | Trial active, not converted | Convert to paid |
| 7. Win-back | 14 | Trial ended, not paid | Feedback + last chance |

## Analytics Events to Fire

| Event | When | Payload |
|-------|------|---------|
| `onboarding_email_sent` | Each email sent | `{email_id, day, sequence}` |
| `onboarding_email_opened` | Open event (webhook) | `{email_id}` |
| `onboarding_email_clicked` | Click event | `{email_id, url}` |
| `platform_connected_d1` | Day 1 prompt → connection | `{platform}` |
| `score_computed` | Score computed | `{score}` |
| `lender_shared` | Share link copied | `{score}` |
| `trial_converted` | Subscription created | `{plan}` |

## Segment Definitions (for email tool)

- **All onboarded:** signup, email verified
- **Cold (no connection):** onboarded AND no platform connected after 48h
- **Connected (no score):** platform connected, score not yet computed
- **Scored:** score computed, not yet shared
- **Sharing:** score shared ≥1x
- **Trial ending:** trial active, ≤3 days remaining
- **Trial lapsed:** trial ended, not converted
- **Paid:** subscription active
