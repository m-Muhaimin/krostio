# Krost — Product Hunt Launch Playbook

Last updated: 2026 launch prep. Owner: founder. Status: pre-launch checklist.

This is the full operating manual for launching Krost on Product Hunt. It assumes a solo or small-team founder with a $5K budget and a 3-week runway. It is written to be executed top-to-bottom without further research.

Krost is at https://krostio.vercel.app. Product: gig workers connect their bank via Plaid, Krost detects deposits from 20 platforms (Uber, DoorDash, Etsy, Mercari, etc.), produces an Income Consistency Score (0–100), annualized income, and a trajectory label, then renders a shareable PDF income verification report. Pricing: $19/mo Pro, $9 one-time PDF, $99/mo Lender Pro, $199/mo Lender Scale.

---

## 1. Launch Strategy

### Best day and time

Launch **Tuesday, Wednesday, or Thursday at 12:01 AM Pacific Time**. Avoid Monday (low maker quality, you compete with weekend backlog hunts), avoid Friday (engagement drops by Sunday and your 24-hour window straddles a low-energy period), and avoid the week of any major US holiday or fintech conference (Money 20/20, Finovate).

12:01 AM PT is non-negotiable for one reason: Product Hunt's daily leaderboard resets at midnight Pacific. Launching at 12:01 AM gives you the full 24 hours on the front page. Launching at 8 AM PT means you've already lost 8 hours of leaderboard time to whoever shipped at midnight. The math is simple and the people who beat you understand it.

The downside of 12:01 AM PT is that you, the maker, will be awake from before midnight through at least 6 AM PT to respond to early comments. The first 60 minutes set the trajectory. Plan to sleep 4 PM – 11 PM PT on launch day so you can be sharp from midnight onward. Coffee staged.

### Pre-launch timeline (T-30 to T-0)

**T-30 to T-22 (Week 1 — foundation)**
- Audit the live product end-to-end. Walk through onboarding as a brand new user. Fix any P0 bugs. The PH community will find every dead link.
- Lock down legal copy: privacy, terms, refund policy. PH commenters will ask.
- Draft your maker comment (section 2 below) and sit with it for a week. The best launch comments read like they were written, not generated.
- Set up analytics. PostHog should be capturing: visit → register → connect bank → score generated → PDF generated → upgrade. You need this funnel visible by launch day.
- Create a Twitter/X account if you don't have one yet (@krostHQ or similar). Post nothing fintech-specific yet. Post 2–3 thoughts per week about the actual problem (gig income, 1099 underwriting, FICO gaps for self-employed).

**T-21 to T-15 (Week 2 — content)**
- Ship the 5 SEO learn pages (already done — /learn/doordash-income-proof, /learn/uber-mortgage, etc.).
- Write 2 long-form pieces specifically aimed at the PH audience: one founder-narrative on IndieHackers ("Why I'm building income verification for gig workers"), one technical piece on dev.to or your own blog ("Detecting gig income from bank deposits — the regex dictionary approach").
- Record your demo video. Don't outsource this — it'll show. Loom or QuickTime over a clean browser window. Real cursor movements, no jump cuts.
- Build the Product Hunt teaser page (PH lets you create one ~10 days before launch). Use it.

**T-14 to T-8 (Week 3 — warm-up)**
- Start posting on Reddit (see section 4). Establish presence — don't promote yet.
- DM 3 potential hunters with a soft "Hey, working on something gig-economy-focused, would love your thoughts" — see section 5 for the template. Most hunters say no. That's fine.
- Email your waitlist (if you have one) with a "we're launching on Product Hunt in two weeks" heads-up. Don't ask for upvotes yet — that's a PH rule violation and a karma-killer.
- Post on IndieHackers about your build process. The IH community shows up on PH consistently.
- Soft-launch on Twitter with a teaser thread: "76 million Americans earn 1099 income. Most can't qualify for a basic auto loan. Here's why — and what I'm shipping in two weeks." Tag no one yet.

**T-7 to T-3 (final week — taper and rest)**
- Stop pushing new features. Bug fixes only. The codebase needs to be calm.
- Day T-5: post on r/SideHustle and r/SideProject with the "what I built" angle. These subs welcome maker stories. Don't post in r/personalfinance yet — wait for launch day, see section 4.
- Day T-3: tell your existing customers/waitlist they'll see a PH launch on a specific date. Provide the direct link to your maker profile (NOT the product link — that's also a PH rule violation pre-launch).
- Day T-2: rehearse your launch-day playbook (section 5). Have your tweet thread, LinkedIn post, Reddit posts, and 5 PH comment responses written and saved as drafts.

**T-0 (launch day)** — see section 5 for the hour-by-hour.

### Hunter vs DIY tradeoffs

A **hunter** is a PH user with a large following who submits your product on your behalf. Hunters who launch fintech products well include Chris Messina (massive reach, but selective), Kevin William David (workflow-heavy, mostly SaaS), and Jiaona Zhang (consumer + B2C fintech). They are not for hire — they pick what they find genuinely interesting.

**Pros of using a hunter:** their followers get pinged on launch day, you start with 50–500 baseline upvotes from their network, comments arrive faster which surfaces you higher.

**Cons:** hunters increasingly want to know the product is good, not just launchable. Sending a cold DM with "please hunt my product" is the worst possible opener. They get 20 of those a day and ignore all of them.

**DIY launch tradeoff:** you start at 0 but you keep 100% of the narrative. For a small product like Krost (consumer-targeted, indie-built, no Series A), DIY usually beats a half-hearted hunter. The PH community respects "I built this myself and I'm here in the comments." A hunter intro that reads like a press release ("Excited to introduce…") actively repels engagement in 2025.

**Recommendation: DIY launch.** Spend the saved energy on Reddit and Twitter (section 4) instead. If a hunter you respect organically offers to hunt — say yes. Don't chase.

### Handling the 24-hour comment momentum

Comments are the single most important signal to PH's ranking algorithm. Upvotes matter, but a product with 200 upvotes and 80 thoughtful comments will beat a product with 400 upvotes and 10 comments. Optimize for conversation.

Rules for the maker on launch day:
1. **Respond within 5 minutes to every comment for the first 6 hours.** This is the highest-leverage activity you have.
2. **Don't thank-bomb.** "Thanks for the kind words!" is dead air. If someone leaves a substantive comment, respond with substance. If they leave a one-liner, react with a 👍 only — you can't manufacture engagement out of nothing.
3. **Bring receipts.** If someone says "this looks like X" — link to a screenshot of the actual difference. If they say "I don't trust Plaid" — link to your privacy page. Comments with hard links rank higher and convert better.
4. **Don't argue.** If someone is hostile or wrong, respond once with the facts and disengage. PH is not Reddit. Maker-vs-commenter slap-fights tank engagement and your reputation simultaneously.
5. **Tag the right people.** If someone asks "does this work with [Company]?" and a founder of that company is on PH, @-mention them. They often respond, which doubles your thread's visibility.

The 24-hour engagement curve looks like: massive spike 12–4 AM PT (East Coast morning), steady climb 6 AM – noon PT (West Coast morning + Europe afternoon), plateau noon – 6 PM PT, second mini-spike 6–9 PM PT (East Coast evening browse), tail-off after midnight. Stay engaged through the 6 PM PT spike. It often decides top-5 placement.

---

## 2. PH Listing Content — copy-paste ready

### Tagline (60 char max) — 3 variants

1. `Income verification for gig workers in 60 seconds.` — 51 chars
2. `Krost — a credit-style score for gig and 1099 income.` — 54 chars
3. `Connect your bank. Prove your gig income. Get the loan.` — 56 chars

**Recommended:** variant 1. The "60 seconds" anchors the value, "gig workers" qualifies the audience, "income verification" sets the category. Variant 2 hints at credit scoring which is legally fraught (Krost does not produce a FICO). Variant 3 is the strongest direct-response copy but reads slightly hype-y for PH.

### Description (260 char max) — 3 variants

1. `76 million Americans earn 1099 income. Most can't qualify for a basic auto loan because there's no pay stub. Krost connects your bank, detects gig deposits from 20 platforms, and generates a verifiable income report you can hand to any lender.` — 240 chars

2. `For drivers, sellers, freelancers, and anyone with 1099 income. Krost scans your bank deposits, scores your income consistency 0–100, and produces a PDF income verification report. $9 one-time or $19/mo for unlimited.` — 220 chars

3. `Lenders ask for pay stubs. You don't have any. Krost turns your gig deposits into a verified income score and a shareable PDF — built for DoorDash drivers, Etsy sellers, Uber drivers, and the 76M Americans the W-2 economy left behind.` — 234 chars

**Recommended:** variant 1. Opens with the stat (76M is the unlock — it makes people stop scrolling), explains the gap in one sentence, summarizes the product. Variant 3 is more emotional but slightly longer. Variant 2 leads with pricing which is a tactical mistake on PH — discuss money in the maker comment, not the headline.

### First comment (maker launch comment) — full 340-word draft

```
Hey Product Hunt 👋

I'm Mahmud, and I've been building Krost for the last few months. Quick context for why this exists:

In 2024 I helped a friend apply for an auto loan. He delivers for DoorDash and sells refurbished electronics on Mercari. Between the two, he clears about $68K a year. He has good credit. He got denied three times, at three different banks, because he couldn't produce "income documentation in standard format." His bank statements showed the money. The lenders' underwriting systems just didn't know what to do with deposits labeled DOORDASH INC and MERCARI MARKETPLACE.

That's roughly the experience of 76 million Americans who earn 1099 income. The W-2 economy has pay stubs. The gig economy has bank deposits and a shrug.

Krost is a small fix to that:
- You connect your bank via Plaid (read-only, takes ~30 seconds).
- We scan your deposit history and identify income from 20 gig platforms — rideshare, delivery, marketplaces, freelance, asset rental.
- We compute an Income Consistency Score (0–100), an annualized income figure, and a trajectory label.
- You get a PDF income verification report you can email to any lender, landlord, or underwriter.

Not a credit score. Not a replacement for FICO. It's the documentation layer that the gig economy has been missing — a way to say "this income is real, here's the receipts."

What's working: the score is genuinely useful for borrowers with steady gig income but no W-2 history. The PDF is short, shareable, and explains itself in lender-friendly language.

What's not working yet: only US bank coverage (Plaid limitation), the lender directory has 6 example listings rather than real partners (I'm working on this), and we don't yet support direct platform integrations like Uber's API — everything is detected from deposit descriptions, which is roughly 95% accurate but not perfect.

I'd love feedback, especially from anyone who's been on either side of this — gig worker who got denied, or a lender who's seen these applications come across their desk. Roast freely.

— Mahmud
```

Why this works: it opens with a real story (PH loves "I built this because…"), it's specific (not "the gig economy" — DoorDash and Mercari, $68K, three denials), it admits limitations without burying the lead, it ends with a specific feedback ask. No emoji walls, no hashtags, no exclamation marks. Roughly the length PH expects — long enough to show care, short enough to read on mobile in 90 seconds.

### Topic tags — pick 3–5

PH lets you pick up to 5 topics. Choose:

1. **Fintech** — primary category. Where lenders, fintech operators, and most of the relevant audience browse.
2. **SaaS** — secondary. Captures the recurring-revenue audience who evaluate products from a business model lens.
3. **Productivity** — tertiary. This sounds odd for a financial product, but income verification IS a productivity tool for the people who use it (faster loan applications, less paperwork). The Productivity topic gets more browse traffic than Fintech.
4. **Privacy** — defensive choice. Anyone evaluating a Plaid-powered product cares about data handling, and being in this category signals you've thought about it.

**Skip:** Web3, AI, Developer Tools. Krost is none of those things and the cross-promo bots in those categories will spam your launch with low-quality comments.

### Gallery image captions — 5 images

1. **The score** — `Your Income Consistency Score. 0–100. Updated every time we sync your bank.`
2. **The platforms detected** — `Krost detects income from 20 gig platforms — Uber, DoorDash, Etsy, Mercari, Shopify, and more.`
3. **The PDF report** — `Every Krost user can generate a shareable PDF income report. Free tier: 1 report. Pro: unlimited.`
4. **The lender directory** — `Browse lenders who accept Krost income verification. Personal loans, auto, mortgage, business credit.`
5. **The pricing** — `$9 one-time report. $19/month for unlimited verification + auto-refresh. Free to try.`


---

## 3. Asset Specs + Creative Direction

### Thumbnail — 240x240 PNG

What goes in it: the Krost K-mark on a deep-green (#0F3D2E) background, with the wordmark "krost" centered below in white. No tagline, no extra elements. The thumbnail is rendered at ~50px on mobile feeds — anything more than a logo is unreadable.

If you're feeling slightly clever: animated GIF version where a small "0–100" score ticks from 0 to 73 over 1.5 seconds and freezes. Animations on PH thumbnails increase CTR ~15% but only when subtle. Avoid bouncing, flashing, or rotating — those get flagged as spammy.

**Spec:** 240x240px, PNG (or GIF ≤ 2MB), sRGB color profile, transparent background NOT recommended (PH renders thumbnails on white sometimes and on dark mode others — solid background reads better on both).

### Gallery images — 1270x760 PNG x5

Frame-by-frame:

**Image 1: Hero / score screen.** Background: clean white. Center: a large mocked Krost dashboard showing a worker's score of 78/100, annualized income of $54,200, trajectory "Stable & growing," and a small chart showing weekly deposits over 12 weeks. Top-left corner: small Krost logo. Use the real product UI screenshot if you can — designed mockups always look fake on PH.

**Image 2: Platforms detected.** A 4x5 grid of platform logos (Uber, Lyft, DoorDash, UberEats, Grubhub, Instacart, Fiverr, Upwork, Freelancer, Turo, Airbnb, Amazon Flex, Shopify, Etsy, Mercari, Poshmark, eBay, Depop, StockX, Whatnot). Each logo desaturated to ~60% so the Krost K-mark in the center pops. Subtitle: "Detected automatically from your bank deposits." This is the image that makes someone say "wait, Etsy and Mercari too?"

**Image 3: PDF report screenshot.** A photorealistic mockup of the PDF report opened on a laptop. Show the cover page with the user's name (use "Sarah Chen, sample report"), score, annualized income, and the first page of the platform breakdown. Lender-friendly typography. Background: muted desk surface with a coffee cup and a notebook — sells the "real document" feeling.

**Image 4: Lender directory.** Screenshot of the /lenders directory page showing the 6 lender cards (Kashable, Oportun, LendingClub, Carvana, Rocket Mortgage, Fundera). Filter sidebar visible. Caption: "Browse lenders who accept Krost income verification." Honest disclosure: if these are still placeholder partners at launch, show a small footnote inside the image: "Example listings — partner integrations coming." PH commenters will catch the lack of disclosure otherwise.

**Image 5: Pricing.** Three-column pricing layout: Free / Pro $19 mo / Single Report $9. Below each: the key feature. Below the columns: small text "No upsell traps. Cancel any time."

### Demo video — 45-60 seconds, 16:9 MP4

Storyboard, 14 frames:

1. **0:00–0:03** — Black screen, white text: "76 million Americans earn 1099 income."
2. **0:03–0:06** — Same screen, text fades to: "Most can't prove it to a lender."
3. **0:06–0:09** — Cut to a stock photo of a DoorDash driver in a car. Caption: "Marcus delivers for DoorDash. Sells on Mercari. Made $68K last year."
4. **0:09–0:13** — Generic loan denial screen. Caption: "Denied for an auto loan. Three times."
5. **0:13–0:17** — Cut to Krost landing page. Cursor moves to "Get started" button, clicks.
6. **0:17–0:22** — Plaid Link flow: pick a bank, log in, authorize. Speed 2x.
7. **0:22–0:27** — Loading screen on Krost ("Analyzing 12 months of deposits…"). Real-time, ~5 seconds.
8. **0:27–0:32** — Score reveal: 78/100. Caption: "Income Consistency Score."
9. **0:32–0:37** — Pan to platforms detected: "Uber, Lyft, DoorDash, Mercari, Etsy."
10. **0:37–0:42** — Click "Generate PDF Report." PDF renders. Show the cover page.
11. **0:42–0:47** — PDF in an email draft, sent to a lender. Subject: "Income verification — auto loan application."
12. **0:47–0:50** — Cut to the lender directory page. Six lender cards.
13. **0:50–0:55** — Marcus's hand on a steering wheel of a newer car. Caption: "Krost income verification — for the workers the W-2 economy left behind."
14. **0:55–0:60** — Logo card: "krost.app — try it free."

No voiceover. Caption every spoken-equivalent moment. Background music: something instrumental and not stock-y. Avoid the "uplifting corporate" cliche.

**File specs:** MP4 H.264, 1920x1080, 30fps, 8–15 Mbps bitrate. PH max file size: 1280x720 minimum, keep under 50MB so it loads on mobile.

### Logo files

- **K-mark only**, 512x512 PNG, transparent — for favicons, app icons, social avatars
- **Wordmark + K-mark**, 1200x400 PNG, transparent — for press kits
- **K-mark + wordmark inverted (white on dark)** — for dark-mode displays and the PH thumbnail
- **Square Krost lockup**, 1200x1200 PNG — for Instagram/LinkedIn

All should be SVG-sourced. Generate PNG variants from SVG, not the other way around.


---

## 4. Pre-Launch Promotion Plan

### Week-by-week audience building (T-30 to T-0)

**T-30 to T-22:** Establish presence. Don't promote. Post 2–3x per week on Twitter/X about the gig income problem (not Krost). Comment thoughtfully on 5–10 fintech threads daily. Follow and engage with 20 key fintech accounts: @plaidio, @argyle_io, @pinwheel_api, @method_fi, @trovedata, @rampcapital (for B2B finance reach), @AndrewYNg (broader tech but adjacent), plus 5 fintech journalists (Mary Ann Azevedo at TechCrunch, Lucinda Shen at Axios, Jeff Kauflin at Forbes).

**T-21 to T-15:** Content week. Ship one IndieHackers post (founder story), one technical blog (the detection-from-deposits methodology), and one Twitter thread (the 76M-Americans hook). Don't mention PH yet.

**T-14 to T-8:** Soft warm-up. Tell your network individually — not broadcast — that you're launching soon. Email 5 people who'd care personally and ask if they'd be willing to comment on launch day. Personal asks convert; broadcast asks get ignored.

**T-7 to T-3:** Reddit drops (see below) and waitlist email. This is where you start trading the goodwill you've built.

**T-2 to T-0:** Sleep. Cancel anything else on your calendar for launch day + 1.

### Channels — what works where

**Twitter/X:** Strongest channel for fintech PH launches. Founder threads with screenshots beat link-only tweets 4:1. Tag PH (@ProductHunt) in launch-day tweet. The Twitter→PH funnel converts at ~3-5% depending on follower quality. If you have <500 followers, this channel will produce 20-50 upvotes max — useful but not decisive.

**LinkedIn:** Sleeper channel for B2B-adjacent products. Lender-side audience is on LinkedIn, not Twitter. One well-written launch-day LinkedIn post can produce 30-100 upvotes from fintech professionals who don't browse PH casually but will when prompted. Post in the morning ET, not PT.

**Reddit:** Highest variance. r/SideHustle and r/SideProject welcome maker content if you follow the format. r/personalfinance and r/Frugal are STRICT about self-promo (banned unless you become a sustained contributor first). r/UberDrivers and r/doordash_drivers are mid-strict — promotional posts get removed by automod unless framed as a question or genuinely useful tool.

**IndieHackers:** Smaller audience but extremely loyal. A founder narrative post on IH the morning of launch produces 50-200 upvotes from a community that genuinely shows up.

**Hacker News:** Don't post the launch link as "Show HN" on PH launch day — you split your attention and HN typically doesn't surface fintech well. Post a Show HN three days AFTER your PH launch when the conversation has matured and you have data/screenshots to share.

### Tweet thread template — launch day (10 tweets)

```
1/ 76 million Americans earn 1099 income. Most can't qualify for a basic auto loan.

Today I'm launching Krost — income verification for the gig economy.

We're live on Product Hunt: [LINK]

Here's why it exists 🧵
2/ Last year my friend Marcus tried to buy a used car.

He delivers for DoorDash. Sells refurbished electronics on Mercari. Made about $68K. Good credit.

He got denied three times. Three different banks. The reason: no pay stubs.
3/ The gig economy has no pay stubs.

Your money is in your bank account. The lender's underwriting system doesn't know what to do with deposits labeled DOORDASH INC or MERCARI MARKETPLACE.

So you get a denial, even when the income is there.
4/ Krost is the documentation layer the gig economy has been missing.

You connect your bank via Plaid (read-only, ~30 seconds).

We scan your deposits. We identify income from 20 gig platforms — rideshare, delivery, marketplaces, freelance, asset rental.
5/ We compute three things:

- Income Consistency Score (0–100)
- Annualized income
- Trajectory: stable, growing, declining

Plus a PDF income verification report you can email to any lender.
6/ The 20 platforms we detect today:

Uber, Lyft, DoorDash, UberEats, Grubhub, Instacart, Fiverr, Upwork, Freelancer, Turo, Airbnb, Amazon Flex, Shopify, Etsy, Mercari, Poshmark, eBay, Depop, StockX, Whatnot.

If we miss yours, tell me and I'll add it.
7/ What it is NOT:

- Not a credit score (we don't replace FICO)
- Not a loan
- Not financial advice

It's documentation. Lender-friendly, verifiable, regenerable every month.
8/ Pricing:

- Free: 1 income report
- $9: single PDF report (one-time)
- $19/month: unlimited reports + auto-refresh

There's a lender directory at krostio.vercel.app/lenders — we earn referral fees when you connect with a lender, that's how this can stay cheap for workers.
9/ What I'm honest about:

- US-only at launch (Plaid limitation)
- Detection is ~95% accurate, not perfect
- Lender directory listings are examples — I'm still signing real partners
- We are MVP and there are rough edges

Roasting is welcome. Feedback is the point.
10/ If this resonates: upvote on Product Hunt today, tell a gig-working friend, or just reply with what's broken about gig income for you.

[PH LINK]

Thanks for reading. Building in public is terrifying. Doing it anyway.
```

### LinkedIn post template — launch day

```
For the past few months I've been quietly building a product called Krost. Today we're launching on Product Hunt, and I want to share why.

76 million Americans earn 1099 income — rideshare drivers, delivery workers, Etsy sellers, freelancers, Airbnb hosts, anyone the W-2 economy left behind. They earn real money, often very steady money. But when they try to qualify for an auto loan, a mortgage, or even a basic line of credit, they hit a wall: "We need pay stubs."

The gig economy doesn't have pay stubs.

I watched a friend get denied three times for an auto loan despite clearing $68K a year between DoorDash and Mercari. Good credit. Steady income. Wrong format.

Krost is the documentation layer that gap has been missing. You connect your bank (read-only via Plaid), we identify income from 20 gig platforms, and we generate a verifiable income report — a Consistency Score, an annualized figure, and a PDF you can hand to any lender.

This is not a credit score. It's not a replacement for FICO. It's a paper trail for income that the standard verification flow ignores.

If you work in lending, underwriting, or fintech: I'd love your eyes on this. The current 1099-borrower experience is broken in obvious ways, and I think there's a real product opportunity for whoever closes the gap thoughtfully.

If you ARE a gig worker — try it. Tell me what's wrong. The whole point is making this useful for the people who need it.

[PH LINK]
```

### Reddit post drafts

**r/SideHustle (loose self-promo rules, must add value):**

```
Title: Built a tool to prove gig income to lenders — feedback wanted

Body: Hey r/SideHustle. I've been working on a thing for the last few months and launched it today: krost.

The problem I'm trying to solve: most lenders still ask for "pay stubs" when you apply for an auto loan, mortgage, personal loan, etc. Gig workers don't have pay stubs. So even with great income and good credit, gig workers get denied or kicked into "alternative documentation" purgatory.

Krost connects your bank (read-only, Plaid), looks at deposits over the last 12 months, identifies income from 20 gig platforms (Uber, DoorDash, Etsy, Mercari, etc.), and spits out:
- An Income Consistency Score (0–100)
- An annualized income figure
- A PDF income verification report you can email to a lender

There's a free tier (1 report). Paid is $9 one-time or $19/mo for unlimited.

I'd love feedback from anyone here who's tried to get a loan or apartment as a gig worker. What did you have to provide? What didn't work? Would something like this have helped?

Not affiliated with Plaid, not affiliated with any lender. Just a small thing trying to fix one specific annoyance.

(Mods — if this violates self-promo, please remove. Happy to share without a link if needed.)
```

**r/UberDrivers (strict — frame as utility):**

```
Title: Tool for proving Uber income for loans/apartment applications — does this seem useful?

Body: Wanted to ask the community here before going further. I've built a tool that scans your bank account and pulls out your Uber deposits (plus Lyft, DoorDash, Instacart if you do those) and generates an income verification report you can send to lenders or landlords.

The reason I built it: a friend of mine got denied for an auto loan despite making $68K driving + selling on Mercari. The lender wanted "pay stubs" which obviously don't exist for gig work.

Question for you: when you've applied for things that require income verification, what have you actually had to provide? Bank statements? Tax returns? Uber's tax docs? Did it work?

Trying to figure out if this fills a real gap or if there's already a standard workaround everyone uses.

Not selling anything here, genuinely just want to know if I'm building the right thing.
```

**r/personalfinance (strictest — ask only, no link):**

```
Title: Gig workers — how do you prove income when applying for loans?

Body: Trying to understand what the standard workflow actually looks like in 2026.

If you do gig work (Uber, DoorDash, Etsy, Instacart, anything 1099), and you've applied for an auto loan, mortgage, personal loan, or apartment in the last year — what did the lender/landlord ask for?

Specifically interested in:
- Did they accept tax returns alone?
- Did they want bank statements + tax returns?
- Did they reject you and tell you to come back with "W-2 income"?
- Did they use a third-party verification service (Truework, Argyle, etc.)?

Asking because I think there's a real gap here but I don't want to build something solving a problem nobody actually has.
```

### Waitlist email blast template

Subject: `Krost is live on Product Hunt today`

```
Hey —

A few months ago you signed up for the Krost waitlist. Today we're live on Product Hunt:

[LINK]

You can use Krost right now at krostio.vercel.app — connect your bank, get your Income Consistency Score, generate your first PDF income report for free.

Two specific asks if you have a minute:

1. Try it and tell me what's broken. I'd rather hear it from you than from a stranger on PH.
2. If you find it useful, an upvote on Product Hunt today is the single most valuable thing you can do — it surfaces Krost to more gig workers who need this.

Thanks for getting on the waitlist back when this was an idea. It's a real product now.

— Mahmud
Founder, Krost
```


---

## 5. Launch Day Playbook (hour-by-hour, all times PT)

### 11:30 PM (day before) — Final pre-flight

- Open PH submission draft. Re-read every field. Check the URL — krostio.vercel.app — opens cleanly.
- Open 3 browser tabs: PH dashboard, Krost production site, your Twitter compose window.
- Have ready: tweet thread (drafted), LinkedIn post (drafted), 3 Reddit posts (drafted), maker comment (drafted, copy-able).
- Coffee made. Phone on do-not-disturb except for the 5 people you actually want to hear from.

### 12:01 AM — Submit

- Click "Submit" on PH. Verify the listing is live (it can take 60–90 seconds to render).
- Post your maker comment immediately. First-comment placement matters.
- Send the tweet thread. Pin tweet 1 to your profile.
- Send the LinkedIn post.
- Email the waitlist blast.

### 12:30 AM – 4 AM — East Coast wake-up window

- Respond to every comment within 5 minutes.
- Post to IndieHackers (founder narrative) around 1 AM PT — IH's audience skews East Coast and overlaps strongly with PH's morning browsers.
- Drop the r/SideHustle post at 2:30 AM PT (5:30 AM ET — catches the East Coast morning commute).
- Refresh your PH dashboard every 10 minutes. Note your rank.

### 4 AM – 8 AM — Europe afternoon, US East coffee

- This is your highest-volume window. Comments come fast. Stay sharp.
- Drop the r/UberDrivers post at 5 AM PT (8 AM ET — drivers checking phones between morning runs).
- Tweet a thread-update at 6 AM PT: "We're at #X on PH this morning, here's what people are asking the most…" — Twitter algorithm loves live updates.

### 8 AM – 12 PM — West Coast morning

- DM the 3 hunters/influencers who haven't engaged yet. Soft ask: "We're live, would love your thoughts if you have 60 seconds." Don't ask for upvotes directly.
- Drop the r/personalfinance question post at 9 AM PT (mid-morning everywhere). Important: the r/personalfinance post is an ASK, not a pitch — do not link to Krost in it. The credibility you build there spills over.
- Reply to every press contact who's seen the tweet. Press follow-ups in section 6.

### 12 PM – 4 PM — Midday plateau

- This is when your comment-response time matters most. Front-page rank churns rapidly here.
- Repost the tweet thread to LinkedIn with a different angle (e.g., focus on the lender side of the problem instead of the worker side).
- If you're in the top 5, screenshot it and post on Twitter as social proof.
- If you're NOT in the top 5, don't panic. Top-10 on PH still produces meaningful traffic and credibility.

### 4 PM – 9 PM — East Coast evening browse

- Second-biggest engagement spike. Comment volume often doubles between 5–7 PM PT.
- Stay at your desk. This is when "tipping point" decisions get made by indecisive voters.
- Post a thread-update tweet at 6 PM PT summarizing the most interesting feedback you've received.

### 9 PM – 11:59 PM — Final hours

- Don't beg for upvotes. PH penalizes "we need just X more upvotes!" posts hard.
- Thank people who showed up in a quiet, personal way: reply to commenters with what specifically helped you.
- At 11:55 PM, send one final tweet: "Last 5 minutes of the PH launch. Thank you to the [N] people who showed up today. Here's what's next…"

### Response templates for common PH questions

**Q: "How is this different from Plaid?"**
> Plaid is the rails — they connect to banks and surface raw transaction data. Krost sits on top of Plaid. We take that transaction data, identify which deposits came from gig platforms (using a regex dictionary across 20+ platforms), aggregate by week and month, and produce a Consistency Score plus a lender-friendly PDF. Plaid by itself is just plumbing — Krost is the documentation layer for the gig-income use case.

**Q: "How is this different from Argyle/Truework/Pinwheel/Method?"**
> Those are B2B platforms — lenders pay to access employment and income data via integrations with Uber, Lyft, DoorDash, etc. directly. They serve lenders, not workers. Krost is the inverse: a worker-facing tool that produces verification YOU control and YOU send to lenders. We also detect retail/marketplace income (Etsy, Mercari, Poshmark, Shopify, eBay) which none of the B2B platforms cover — those are gig income for a huge slice of the population.

**Q: "Privacy?"**
> Plaid is read-only. We never see your bank password (Plaid handles auth, OAuth-style). We store transaction descriptions and amounts in encrypted Supabase. We don't sell data, don't share with third parties, and don't run ads. Privacy policy: krostio.vercel.app/privacy. You can delete your account and all data with one click.

**Q: "Available in [country]?"**
> US-only today. Plaid's coverage outside the US is patchy and the gig-platform regex dictionary is US-specific. International is on the roadmap but not next quarter. If you're in [Canada/UK/EU/AU] and want to be notified when we launch there, drop your email at krostio.vercel.app and I'll keep you in the loop.

**Q: "Why not just use Plaid Income directly?"**
> Plaid Income is great for employed income. It pulls payroll data from a few hundred US employers. It does NOT detect gig deposits well — they show up as generic ACH transfers, not as identified income. Krost's contribution is the gig-platform detection layer. If you have a regular W-2 job, Plaid Income is fine. If you drive Uber and sell on Etsy, Plaid Income misses 80% of what you earn.

**Q: "Is this a credit score?"**
> No. It's an Income Consistency Score (0–100). It measures how steady and substantial your gig income is. Lenders use it as supplemental documentation alongside your traditional credit score (FICO), not as a replacement. We're careful about this distinction for regulatory reasons (FCRA/ECOA) and because conflating the two would be misleading.

### Hunter outreach DM template (if going that route)

```
Hey [Name] — long-time follower. I'm launching Krost on Product Hunt next [Day]. It's income verification for gig workers — connects to your bank via Plaid, identifies deposits from 20+ gig platforms (Uber, DoorDash, Etsy, Mercari), generates a Consistency Score and a lender-ready PDF.

The reason I'm reaching out specifically to you: [one specific reason — they hunt fintech B2C, they wrote about a similar problem, etc.]. Not asking you to hunt — happy to do it myself — but if you have any thoughts on how I'm positioning this, I'd value them.

Live preview at krostio.vercel.app. Maker comment draft below if it'd help to read it.
```

Three fintech B2C hunters known to engage with founder-built products:
1. **Chris Messina** (@chrismessina) — broad fintech reach, picky. Approach with substance only.
2. **Jiaona Zhang** (@jiaonazhang) — consumer + B2C focus, engages with thoughtful makers.
3. **Andrew Gazdecki** (@agazdecki) — indie/bootstrap audience, fintech-friendly, responsive to DMs.

---

## 6. Post-Launch — Day 2 and beyond

### KPIs to track

**Day 1 (launch day):**
- PH rank (top 5 / top 10 / top 50)
- Total upvotes
- Total comments
- Maker comment upvotes
- Site traffic (PostHog: source = producthunt.com)
- Signups
- Connected-bank rate (signup → Plaid Link complete)
- Score-generated rate (Plaid Link → score visible)
- PDF report-generation rate
- Paid conversions (free → $19/mo or $9 one-time)

**Day 2–7:**
- Retention: did Day 1 signups come back?
- Referral traffic (which channels are still sending people)
- Press mentions (Google "krost income verification" daily)
- Twitter mentions / quote-tweets

**Day 8–30:**
- Cohort retention from PH cohort vs. organic
- LTV signals: how many PH signups upgraded?
- Direct lender contact (lenders reaching out wanting to be in the directory)

### Day 2 follow-up content

The day after launch, post a "what I learned" tweet thread. Numbers, screenshots, the surprising feedback. PH cares about what happens after the hype — sustained engagement on Day 2 doubles your "trending" surface time.

Also: a longer write-up on IndieHackers or your own blog, titled something like "What launching on Product Hunt taught me about [the gig income problem]." This is link-bait, but the good kind — it gives other indie founders a reason to share you.

### Press follow-up

If you make top 5, email these fintech reporters within 48 hours of launch. They don't cover unlaunched products, but they DO cover products that just had a big PH moment.

1. **Mary Ann Azevedo** (TechCrunch fintech) — covers indie fintech launches regularly. Email: maryann@techcrunch.com (verify before sending — TechCrunch email format changes). Subject: "PH top-5 fintech launch — Krost, income verification for gig workers."
2. **Jeff Kauflin** (Forbes, fintech beat) — covers credit access stories.
3. **Lucinda Shen** (Axios Pro Rata) — covers fintech funding and product launches, friendly to founders.
4. **Penny Crosman** (American Banker) — banking-side reporter, covers lender-tech.
5. **Polina Marinova Pompliano** (The Profile) — newsletter focus, but huge fintech reader base. Submit via her newsletter contact form.

Email template:

```
Subject: Krost — income verification for gig workers — PH top-5 launch yesterday

Hi [Name],

Quick note: we launched Krost on Product Hunt yesterday and ended up #[N] for the day. Krost is income verification specifically for the 76 million US gig workers — connects a bank via Plaid, identifies deposits from 20 gig platforms (Uber/DoorDash/Etsy/Mercari/etc.), produces a Consistency Score and a lender-ready PDF.

The angle that resonated on PH and might be interesting to your readers: traditional income verification (Argyle, Truework, Pinwheel) is B2B — built for lenders, not workers. Krost flips the model. Workers control their own verification and shop it to lenders. And we detect retail/marketplace income (Etsy, Mercari, eBay, Poshmark) which the existing players don't cover at all.

[STATS: X signups in 24 hours, Y connected banks, Z paid conversions]

Happy to send the full PH thread, demo video, or a 15-minute walkthrough. krostio.vercel.app.

— Mahmud
Founder, Krost
```

### Badge usage

If you hit top 5, PH gives you an embed badge. Use it:
- Footer of krostio.vercel.app
- Top of /pricing page
- LinkedIn cover image
- Email signature

If you hit #1, the badge is permanent and high-value. Don't be subtle — it earns trust with both gig workers AND lenders evaluating the directory.

---

## 7. Competitive Landscape

The income verification market is mostly B2B, mostly aimed at lenders, and mostly ignores the gig-income use case at the worker level. Here's where Krost sits relative to real competitors:

**Argyle** — Series B-funded, ~$60M raised, B2B-only. Direct API integrations with rideshare and delivery platforms. Lenders pay per verification. No worker-facing product. Strong on Uber/Lyft/DoorDash, weak on marketplaces (Etsy/Mercari). Krost difference: worker controls the verification, plus retail platform coverage.

**Truework** — Series B, $35M+ raised, B2B income/employment verification. Strong on W-2 employment, partnerships with major HR platforms. Weak on gig income (they rely on platform APIs that don't always exist for smaller platforms). Krost difference: bank-deposit detection works for any platform, not just ones with APIs.

**Pinwheel** — Series B, ~$50M raised, payroll-connection focus. Strongest in the payroll-rerouting use case (switching direct deposit). Has expanded into income verification but optimized for W-2 + 1099 contractors at major platforms. Krost difference: smaller-platform and retail coverage; worker-pays-not-lender model.

**Plaid Income** — Plaid's own product. Free or near-free to integrate for lenders. Strong on W-2 (pulls payroll records from 1000+ US employers). Weak on gig (deposits show up as generic ACH transfers, not identified income). Krost difference: we identify gig deposits Plaid misses, then format them lender-ready.

**Trove** — Series A, raised by Atlanta Ventures. Aggregates financial data from gig platforms via direct API. B2B model, lender-paid. Smaller market presence than Argyle. Krost difference: bank-deposit detection works without platform API access, which means Krost covers smaller and emerging platforms (Whatnot, StockX, Depop) that Trove doesn't.

**MX Pathfinder** — MX is a large incumbent in bank data aggregation (often the alternative to Plaid for credit unions). Pathfinder is their employment/income product. B2B, sold to credit unions and community banks. Krost difference: consumer-facing.

**Method Financial** — Series A, ~$16M raised, focused on credit and debt data more than income. Different product, different use case (think credit liability data, not income verification). Krost difference: not a direct competitor — Method handles the debt side, Krost handles the income side. There's a world where Krost partners with Method rather than competes.

**Krost's wedge:**

1. **Worker-first model** — every competitor above sells to lenders. Krost sells to workers. Workers pay $9 or $19, control their own data, and choose which lenders see it. This is the same playbook that made Mint successful in personal finance and Credit Karma successful in credit scores — going around the B2B gatekeepers to reach consumers directly.

2. **Retail/marketplace coverage** — Krost detects income from Etsy, Mercari, Poshmark, Shopify, eBay, Depop, StockX, and Whatnot. None of the B2B competitors cover these because there are no platform APIs to integrate with. Bank-deposit detection is the only way to capture this income, and it represents a meaningful slice of gig income for the under-30 cohort.

3. **Pricing** — $9 one-time and $19/mo is dramatically cheaper than competitor B2B pricing. The economics work because Krost's marginal cost per verification is near-zero (Plaid charges per linked account, not per verification) and the lender directory provides referral revenue on top.

4. **Speed-to-document** — under 60 seconds from sign-up to first PDF generation. B2B competitors integrate into lender flows that often take days. For a gig worker applying for an apartment or a small loan, "I can hand them a verified document in a minute" is a real product moment.

The honest competitive truth: if a major lender wants industrial-grade income verification at scale, they'll use Argyle or Plaid Income. Krost wins when the gig worker needs verification BEFORE the lender even asks — proactive documentation rather than reactive integration. That's a real market, growing fast, and currently underserved.

---

*Document maintained by founder. Update after launch with actuals — rank, upvotes, signups, conversions, lessons learned. Future launches use this as a baseline.*
