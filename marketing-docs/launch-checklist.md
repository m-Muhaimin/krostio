# Krost — Launch Checklist
*Week 3 (Solo Founder) | Ship Day Readiness*

## Pre-Launch (24h before)

### Auth & Billing
- [ ] **Google OAuth** configured in Supabase (Auth → Providers → Google)
- [ ] **Stripe webhook endpoint** configured in Stripe dashboard
  - Endpoint: `https://krost.xyz/api/webhooks/stripe`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] **Stripe products verified** — both prices exist in Stripe dashboard
  - Gig Worker: `price_1TX2ODEH6MBmmGkXg5Dl4EiW` ($29/mo)
  - Lender: `price_1TX2OyEH6MBmmGkXLqDwPwBf` ($99/mo)
- [ ] **Test checkout flow** — sign up as new user, click upgrade, complete Stripe test payment
- [ ] **Test webhook** — use Stripe CLI or dashboard "Send test webhook" to verify profile updates

### Content Distribution
- [ ] **Reddit posts queued** for r/gigwork, r/UberDrivers, r/freelance (48h apart)
- [ ] **Twitter thread ready** "Your Uber earnings are building a credit score"
- [ ] **Demo video recorded** (60s Loom/OBS, text-driven)
- [ ] **Lead magnet tested** — /check-score flow works end-to-end
- [ ] **Waitlist API verified** — emails land in Supabase `waitlist` table

### Analytics
- [ ] **PostHog project created** at https://app.posthog.com
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` added to Vercel env
- [ ] **Pageview tracking active** — verify in PostHog live events
- [ ] **Conversion funnel set up** in PostHog:
  1. Pageview: `/check-score` → 2. Score generated → 3. Email captured → 4. Account created → 5. Subscription started

## Launch Day

### Ship
- [ ] **Final deploy** to Vercel production
- [ ] **Post on Reddit** (r/gigwork — problem post)
- [ ] **Post on Twitter/X** (thread)
- [ ] **Post on LinkedIn** (lender-facing thought leadership)
- [ ] **Post on Product Hunt** (if applicable — prepare listing 1 week before)

### Monitor
- [ ] **Error tracking** — check Vercel logs and PostHog for errors
- [ ] **Signups monitoring** — watch Supabase `profiles` table for new rows
- [ ] **Billing monitoring** — watch Stripe dashboard for new customers
- [ ] **Webhook health** — verify Stripe webhook deliveries in Stripe dashboard

### Respond
- [ ] **Reply to every Reddit comment** (within 2h = algorithm boost)
- [ ] **Reply to every Twitter reply**
- [ ] **Check waitlist** — email early signups with personal invite
- [ ] **Feature request capture** — start a public roadmap/feedback channel

## Post-Launch (Days 2-30)

| Day | Action |
|-----|--------|
| Day 2 | Post on Reddit r/UberDrivers |
| Day 3 | Post on r/freelance or r/doordash_drivers |
| Day 5 | Email waitlist: "We launched! Here's your invite" |
| Day 7 | Review analytics — top traffic sources + conversion bottlenecks |
| Day 10 | Iterate pricing if needed (14-day trial data) |
| Day 14 | Second content push — blog cross-posts, guest posts |
| Day 21 | Customer interviews (NPS survey, feature requests) |
| Day 30 | Review against 50-customer goal. Decide: pivot, persist, scale |

## Budget Tracking

| Phase | Budget | Spent | Remaining |
|-------|--------|-------|-----------|
| Week 1: Build | $2,500 | $2,500 | $0 |
| Week 2: Marketing | $1,500 | $1,100 | $400 |
| Week 3: Launch | $1,000 | $0 | $1,000 |
| **Total** | **$5,000** | **$3,600** | **$1,400** |

## Key Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Waitlist signups | 200+ | Supabase waitlist table |
| Completed registrations | 100+ | Supabase profiles table |
| Paid subscriptions | 50 | Stripe dashboard |
| Lead magnet conversion | 20% | PostHog funnel |
| Reddit post engagement | 50+ upvotes, 20+ comments | Reddit |
| Twitter thread impressions | 10K+ | Twitter analytics |
| Weekly active users | 30+ | PostHog DAU/WAU |
