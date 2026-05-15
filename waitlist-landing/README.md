# Krostio Waitlist Landing

Standalone, framework-free, single-page waitlist + lead-magnet landing for
**Krostio** — the four-pillar financial identity platform for gig workers.

Mirrors the `DESIGN.md` Mastercard-inspired design system — warm cream canvas,
Sofia Sans, extreme pill radii, ink black CTAs — copied verbatim into plain CSS
so this page ships with zero build step.

## Files

| File | Purpose |
| ---- | ------- |
| `index.html` | Markup: hero, lead-magnet report preview, four-pillar how-it-works, dark CTA, FAQ. |
| `styles.css` | Krostio design system — DESIGN.md tokens, type roles, buttons, cards, agent console. |
| `script.js` | Email validation + POST to `/api/waitlist`. Idempotent, graceful errors. |
| `vercel.json` | Static-host headers + caching. Drop-in for `vercel deploy`. |

## Run locally

No build. Open it directly:

```bash
# From the project root
cd waitlist-landing
python -m http.server 8080
# → http://localhost:8080
```

Or just double-click `index.html`. The form will POST to a relative
`/api/waitlist` — set `window.KROST_API` (see below) if you need to point at
the running Next.js dev server on `:3000`.

## Wire to the waitlist API

The form POSTs to `/api/waitlist` (the same endpoint Next.js exposes at
`src/app/api/waitlist/route.ts`, writing into the Supabase `waitlist`
table from migration 002).

**Same-origin deploy** (e.g. served from `krostio.app` alongside the Next.js
app): no config needed.

**Separate-origin deploy** (this static page on `join.krostio.app`, app on
`krostio.app`): point the form at the absolute API URL in one of two ways.

1. Inline override before `script.js` in `index.html`:

   ```html
   <script>window.KROST_API = 'https://krostio.app/api/waitlist';</script>
   <script src="script.js"></script>
   ```

2. Per-form override on either `<form>` tag:

   ```html
   <form id="waitlist-form" data-api="https://krostio.app/api/waitlist">
   ```

If the API lives on a different origin, the Next.js route handler must allow
CORS for that origin. Easiest path: add the static page to the same Vercel
project as the app, or front both with the same domain.

## Deploy

### Option A — Vercel static (recommended)

```bash
cd waitlist-landing
vercel deploy --prod
```

The included `vercel.json` ships sane security headers and 1-hour cache on
assets.

### Option B — Drop into the Next.js app's `public/`

The static page can be served from the main app at `/join`:

```bash
mkdir -p ../public/join
cp -r ./* ../public/join/
```

Then visit `https://krostio.app/join`. Same-origin, so the form works out of
the box.

## Anatomy — four sections + FAQ + footer

1. **Hero** — Monumental headline + sub + inline email capture. Agent-console
   mockup shows all four pillars: Score, Ledger, Verifier, Passport.
2. **Free report** — The lead magnet. 4-point breakdown maps to the four
   pillars (Score, Ledger, Verifier report, Passport preview) + tilted PDF
   preview card. The value exchange that earns the email.
3. **Four-pillar How it works** — One step per pillar, laid out as a 4-column
   grid on desktop.
4. **Dark CTA + FAQ** — Dark `ink-black` conversion band with second email
   field, then a 7-question FAQ covering platform positioning, Passport,
   on-chain attestation, data privacy.

Plus: announcement bar, sticky nav, three-column dark footer.

## Editing copy

All copy lives inline in `index.html`. Search for the section comments.
Numbers used:

- `76 million Americans` — hero sub
- `4,800+ gig workers already on the list` — dark CTA
- `5,000` — waitlist cap in the announcement bar
- `724`, `$58,420`, `94%` — agent-console mock result (also `724` on the report card)
- `Three pilot lenders` — FAQ

Update all of these when real numbers are available.

## Design-system parity

Built to the `DESIGN.md` Mastercard-inspired spec:

| Token | Value | Notes |
| ----- | ----- | ----- |
| Canvas cream | `#F3F0EE` | Page background — never pure white |
| Ink black | `#141413` | Primary CTAs, headlines, footer |
| Signal orange | `#CF4500` | Eyebrow dots, consent actions only |
| Light signal | `#F37338` | Decorative accents, console score |
| Slate gray | `#696969` | Muted secondary text |
| Font | Sofia Sans | Body 450, headlines 500 |
| Radii | 9999px / 40px / 20px | Pill / stadium / btn |

Components covered:

- `btn-ink`, `btn-signal`
- `input-pill` (+ `input-pill-dark` variant)
- `card-media`, `agent-console`, `agent-chip`
- `chip-signal-outline`
- `announcement-bar`
- `eyebrow`, `eyebrow-label`, `hero-headline`, `display-headline`, `section-headline`, `footer-link`, `footer-header`

## Accessibility

- Semantic landmarks (`<header>`, `<section>`, `<footer>`).
- Skip-target focus on hash links.
- `role="status"` + `aria-live="polite"` on form feedback.
- Form labels are `aria-label` on the email inputs (placeholder is not the label).
- `prefers-reduced-motion` disables smooth scroll + transitions.
- Color contrast on `slate-gray` (#696969) meets WCAG AA for body text.

## What's intentionally NOT here

- No React, no Next.js, no bundler. This is HTML + CSS + JS.
- No analytics tag. Add PostHog (`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`) in
  `index.html` `<head>` when you wire conversion tracking.
- No images. The hero "media" is a CSS-only agent console mock and the
  "report preview" is a CSS-only document card — both ship at zero
  bandwidth cost beyond the Google Fonts request.
