# Lead Magnet — "Free Gig Worker Credit Score Check"

**Concept:** A short, interactive tool where gig workers connect one platform and get an instant credit score estimate.

## Why This Works

- **Zero friction** — No credit card, no signup wall. Just connect a platform and get your score.
- **Viral loop** — "My gig credit score is 723. Check yours free → [link]"
- **Lead capture** — After seeing their score, they're prompted to create a full profile to save it
- **Pre-launch validation** — Shows demand signal: how many workers want this?

## Flow

```
Landing Page → "Check Your Gig Worker Score"
    │
    ▼
Pick a platform (Uber/Lyft/DoorDash/etc.)
    │
    ▼
Connect (mock demo: "This would connect via [Platform] API")
    │
    ▼
Score Estimate Generated (animated meter: 300-850)
    │
    ├──→ See Score Breakdown (what affects it)
    ├──→ "Save Your Score" → Enter Email → Waitlist
    └──→ Share on Twitter/LinkedIn → Viral loop
```

## Score Card Output

After "connecting," show:

```
Your Gig Worker Credit Score Estimate
             723
         ─────────────
         Good (670-739)

Breakdown:
  Income Stability:  85/100  ━━━━━━━━━┅┅┅┅┅
  Monthly Avg:      $4,200  ━━━━━━┅┅┅┅┅┅┅┅
  Platform Mix:     3 apps  ━━━━━┅┅┅┅┅┅┅┅┅
  Tenure:         14 months ━━━━━━━━┅┅┅┅┅┅
  Trend:           Stable ↑  ━━━━━━━━━━━┅┅┅
```

## CTA After Score (Email Capture)

**Headline:** "Save Your Score — Get Early Access"

**Body:** "Create your profile to track your credit score as you earn. You'll also get early access when Krost launches."

**Form:** Email + Name + Role (Worker / Lender)

**Incentive:** "Plus, free access to premium scoring features for beta testers."

## Tech Implementation

- **Client component** at `/check-score` with 4-step state machine (`landing → connecting → result → email → saved`)
- **Score simulated client-side** based on 5 factors: income stability (30%), platform diversity (20%), earnings trajectory (20%), activity consistency (20%), platform tenure (10%)
- **Animated states:** Platform dots cycle during "connecting", gauge needle sweeps on result, breakdown bars fill in sequence
- **Conversion event:** Score computed → email captured via POST to `/api/waitlist`
- **Real version:** Would connect to actual gig platform API (Argyle/Plaid) for live earnings data

## Success Metrics

| Metric | Target |
|--------|--------|
| Landing page visits | 5,000 in first month |
| Score checks | 40%+ conversion from visit |
| Email signups | 15%+ of score checks |
| Social shares | 5%+ of score checks |
