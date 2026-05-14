# Week 3 Launch Sprint — Solo Founder Playbook

> Krost — Decentralized credit scoring for gig workers
> Production: https://krost.xyz
> Goal: 50 paying customers in 30 days, $5K budget, 3-person team

---

## Pre-Launch: 5-Minute Manual Gate Check

Three gates auto-passed (Stripe products, Stripe webhook, Google OAuth). Confirm these 2 yourself before going live:

1. **Checkout test** — Open https://krost.xyz/register → sign up → go to `/dashboard/billing` → click "Start Free Trial" on Gig Worker → use `4242 4242 4242 4242` / any future date / any CVC → confirm Stripe success page → return to `/dashboard/billing` and verify status shows "Active"
2. **Waitlist test** — Open `/check-score` → submit your email → check Supabase `waitlist` table for the new row

If both pass, ship.

---

## Asset 1: Reddit Post (r/gigwork)

**Title:** *I built a tool that turns your Uber/DoorDash income into a credit score lenders actually accept*

**Body:**

```
Hey r/gigwork — been gigging for 3 years (Uber + DoorDash + occasional Fiverr).
Got rejected for an auto loan last month. Bank said "no W-2, no deal" even though
I clear $4-5k/mo on the apps.

Got tired of explaining gig income to underwriters who don't understand it,
so I built Krost.

It works like this:
1. Connect your platforms (Uber, DoorDash, Lyft, Upwork, Fiverr supported)
2. We pull last 24 months of earnings via the platforms' APIs
3. Generate a 300-850 credit score based on YOUR data — income stability,
   platform diversity, tenure, trajectory
4. Score is cryptographically attested on Base L2 so it can't be faked
5. Share it with lenders via a single link

Lenders get a verifiable proof of income that took 30 seconds, not a
3-week document chase. We get treated like the small businesses we are.

It's $29/mo for workers (14-day free trial, no card needed for the trial).

Free score preview at https://krost.xyz/check-score —
just enter your email, see what you'd score before signing up.

Would love feedback from this community — what would make this more useful?
What lenders should we integrate next? Any platforms I missed?
```

**Subreddit rotation (post 1 every 48 hours):**

| Day | Subreddit | Slight angle change |
|---|---|---|
| 0 | r/gigwork | the build story (above) |
| 2 | r/UberDrivers | "tired of bank denials? built this..." |
| 4 | r/doordash_drivers | "for those of us applying for auto loans..." |
| 6 | r/Upwork | "freelancer credit scoring — your earnings count" |
| 8 | r/povertyfinance | "alt credit for the underbanked — feedback wanted" |

**Rules to honor:**
- Don't post the same text. Rewrite the hook for each sub.
- Engage every comment within 2 hours for the first 24h.
- Don't mention pricing in the first paragraph — let people ask.
- Add a disclaimer in the comments: "Founder here, happy to answer Q's."

---

## Asset 2: Twitter / X Thread

**Tweet 1 (hook):**
```
Banks reject 50M gig workers because they can't see a W-2.

We don't have W-2s — we have receipts.

I built a tool that turns 24 months of Uber/DoorDash/Fiverr income into
a verifiable credit score that lenders can't ignore.

Here's how it works ↓
```

**Tweet 2:**
```
The problem:

If you earn $5k/mo on Uber, your bank doesn't see income — they see
"unverifiable contractor payments."

Same with DoorDash, Lyft, Instacart, Upwork, Fiverr.

You can be making 6 figures across 4 apps and still get rejected for a $400 credit card.
```

**Tweet 3:**
```
The fix:

1. Connect your gig platforms
2. We pull 24 months of earnings via API
3. Run them through a 4-factor model:
   • Income stability
   • Platform diversity
   • Tenure
   • Trajectory
4. Output a 300-850 score lenders recognize
```

**Tweet 4:**
```
The "decentralized" part:

Your score gets cryptographically attested on Base L2.

Means:
• It can't be faked
• It can't be retracted by us
• You own it — share with whoever you want
• Revoke any lender's access in one click
```

**Tweet 5:**
```
Pricing:

Gig workers: $29/mo (14-day free trial, no card)
Lenders: $99/mo (50 verifications)

But you don't need to pay to see your score — free preview at
[link to /check-score]

Just enter your email. See where you'd land.
```

**Tweet 6 (CTA):**
```
We're live today.

Help us get this to the 50M gig workers who've been told "no W-2, no loan."

🔗 https://krost.xyz

RTs appreciated. Replies even more. What lenders should we onboard next?
```

**Tweet 7 (founder context, optional):**
```
Some context:

I gig'd for 3 years. Got rejected for an auto loan in March despite
$5k/mo income. Spent April reading every research paper on alt credit scoring.

Built this in 3 weeks. Stack: Next.js, Supabase, Stripe, Base L2.
3-person team. $5k budget.

Building in public from here. AMA.
```

---

## Asset 3: 60-Second Demo Script (Loom / OBS)

**Hook (0:00–0:05):**
> "If you've ever been rejected for a loan because you're a gig worker — this is for you."

**Problem (0:05–0:15):**
> Open a screenshot of a rejection email or a bank statement showing "Uber Earnings" as undefined income.
> "Banks see this. They don't know what to do with it. 50 million Americans get treated like ghosts because of this."

**Product walkthrough (0:15–0:45):**
> Switch to screen recording.
> "I built Krost. Watch."
> – Land on the homepage. *"Free score check — no card needed."*
> – Click "Check Your Score Free" → enter `worker@example.com` → land on the score reveal page.
> – Show the 300-850 dial and the 4-factor breakdown.
> – *"This is what a lender would see. Verifiable. On-chain. Yours."*
> – Click "Connect Uber" → fake the OAuth flow (or use a screenshot).
> – Show the "Share Score" button → copy the link.

**Close (0:45–1:00):**
> Back on camera.
> "It's $29 a month after a free trial. The score preview is free forever. Link's in the description. If you've been told 'no W-2, no loan' — try it. Let me know what your score is."

**Filming tips:**
- Record at 1080p, 30fps
- Use Riverside.fm or Loom Pro for the 4K export
- Background: clean wall, natural light, eye-level camera
- Wear what you'd wear to a coffee shop, not a suit
- One take. Don't edit. Authenticity > polish.

**Upload to:** YouTube, Twitter (cropped to 2:20 max), TikTok (cropped to 60s vertical), LinkedIn (60s native).

---

## Asset 4: Waitlist Email

**Subject:** *Your gig income is now a credit score. We're live.*

**Body:**

```
Hey,

You signed up to know when Krost went live. We're live.

When you joined, banks were rejecting you for loans because your Uber, DoorDash,
or Fiverr income didn't fit on a W-2. We just shipped the fix.

→ Connect your platforms in 30 seconds
→ Get a 300-850 credit score based on YOUR actual earnings
→ Score is attested on-chain so lenders can verify it instantly
→ Share with any lender via one link

What's in it for you as an early signup:

• 50% off your first 3 months: code EARLY50 at checkout
• Priority support — reply to this email and you'll get me, the founder
• Free integration request: tell me what platform you want supported next

Get your score → https://krost.xyz/check-score

Free to check. $29/mo after a 14-day trial. Cancel anytime.

Thanks for waiting.

— [Founder Name]
Krost
```

**Send via:** Loops.so or Resend. Don't use Mailchimp on day 1 — deliverability for new domains is awful there.

**Send time:** Tuesday or Wednesday at 10am ET — your audience is awake but not yet driving.

---

## Asset 5: Product Hunt Listing

**Tagline (60 chars max):**
> Turn your gig income into a credit score lenders can't ignore

**Description (260 chars):**
> Banks reject 50M gig workers because they can't see W-2s. Krost pulls your earnings from Uber, DoorDash, Fiverr, Upwork (and more), generates a verifiable 300-850 credit score, and attests it on-chain so any lender can trust it.

**Gallery images (4 required):**
1. **Hero**: dark stadium-framed hero from your landing page (full width screenshot)
2. **Score reveal**: 300-850 dial + the 4-factor breakdown card
3. **Lender view**: example shared score link from a lender's perspective
4. **Pricing**: the two-card pricing section ($29 / $99)

**Maker comment (post when you list):**
```
Hi PH! Founder here. Built this in 3 weeks after getting rejected for an auto loan
despite earning $5k/mo on Uber + DoorDash. Banks couldn't verify gig income, so
I built the verifier. It's $29/mo for workers, free preview at /check-score.

Three things I'd love feedback on:
1. The on-chain attestation — does it feel like a feature or a gimmick?
2. The $29 price point — fair or too high?
3. Which platforms should we integrate next? (Currently: Uber, Lyft, DoorDash, Upwork, Fiverr)

Ask me anything!
```

**Launch day:**
- List at 12:01am PT (start of PH's UTC day)
- Tweet the listing at 6am PT (when EU/East Coast wakes up)
- Post in r/SideProject and r/EntrepreneurRideAlong at 9am ET
- Email waitlist at 10am ET
- Don't pay for upvotes. Don't ask friends to vote. PH detects this.

---

## Day-by-Day Cadence (Days 1-30)

| Day | Action | KPI |
|---|---|---|
| 1 | Reddit r/gigwork + Twitter thread + Waitlist email + PH listing | 100 signups |
| 2 | Engage every PH comment within 30 min | 200 signups, 5 paying |
| 3 | Reddit r/UberDrivers | 300 signups |
| 5 | Reddit r/doordash_drivers | 400 signups, 12 paying |
| 7 | First analytics review — which channel drives paying users? | 500 signups, 18 paying |
| 10 | Customer interview #1-3 — what surprised them? | 22 paying |
| 14 | Pricing experiment — A/B test $19 vs $29 worker plan | 30 paying |
| 18 | Add second customer interview round (5 more) | 36 paying |
| 21 | Build the most-requested integration (probably Lyft or Instacart) | 42 paying |
| 25 | Re-pitch to lenders — pivot if traction is worker-only | 46 paying |
| 30 | Ship a v2 marketing push: testimonials from paying users | **50 paying** |

---

## What to Do When (Realistic Scenarios)

**Scenario A: Reddit post hits 100+ upvotes**
→ Pin the comment with the link. Reply to every comment within an hour for 24h. Run a follow-up post 7 days later: "Update — you all asked for X, we built it."

**Scenario B: 200 signups, 0 paying after 48 hours**
→ Hard problem. The lead magnet works but the value prop in the dashboard doesn't justify $29. Read the customer interviews. Most likely fix: improve the lender-sharing UX (the share button needs to be the hero of `/dashboard/worker`, not buried).

**Scenario C: Lenders aren't signing up at all**
→ Expected. Lender acquisition is enterprise sales, not Reddit. Skip lender marketing in month 1. Focus on workers. When you have 50+ paying workers, cold-email 30 small credit unions with: "Here are 50 verified gig workers in your service area. Want to underwrite them?"

**Scenario D: A subreddit bans you for self-promotion**
→ Accept it. Don't argue with mods. Move to a less-moderated equivalent (r/sidehustle, r/Entrepreneur). Don't post-and-delete — that's worse.

---

## Budget Allocation ($5K)

| Line item | Spend | Why |
|---|---|---|
| Supabase Pro | $25 | Required for production RLS |
| Vercel Pro | $20 | Edge for international load |
| Stripe fees (pass-through) | $0 | Customers pay |
| Loom Pro for demos | $15 | One month |
| Domain + email | $50 | One year |
| Reserved for Reddit ads (week 3-4) | $1,500 | Pay only if organic stalls |
| Reserved for PH launch boost | $0 | Don't pay for PH visibility |
| Reserved for founder time / coffee | $890 | You're going to burn out otherwise |
| **Emergency fund** | **$2,500** | For pivots / bug bounties / lender outreach mailers |

**Don't** spend on:
- Pre-launch ads (you have no signal yet)
- Logo redesign (yours is fine)
- A second landing page (one is enough)
- "Growth tools" (most of them are tax on small teams)

---

## Tracking Stack

Already configured (PostHog EU). Define these events on day 1:

1. `score_preview_started` — fires on `/check-score` page view
2. `email_submitted` — fires on waitlist form submit
3. `signup_completed` — fires on `/register` form submit
4. `checkout_started` — fires on Stripe redirect
5. `subscription_active` — fires from Stripe webhook on `customer.subscription.created`
6. `score_shared` — fires when worker copies share link

Build a Funnel in PostHog: preview → email → signup → checkout → active.
Your job for the first 30 days is to identify the step with the biggest drop and fix it.

---

## What "Done" Looks Like

By day 30 you should have:
- [ ] 50 paying customers across worker + lender plans
- [ ] At least 10 customer interview notes documented
- [ ] One iteration on the worker dashboard based on those interviews
- [ ] At least 2 platforms integrated beyond launch baseline
- [ ] Cleared the $1,450 in MRR threshold ($29 × 50)
- [ ] A path to 100 in month 2 (paid channel that works, organic post that hit, or referral loop)

If you hit 50, raise the price to $39 in month 2. If you hit 75+, raise to $49. Pricing is the easiest experiment you can run and you're underpricing.

Good luck.
