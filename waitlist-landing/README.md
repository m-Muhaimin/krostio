# Krost Waitlist Landing

Standalone, framework-free, single-page waitlist + lead-magnet landing for
Krost. Mirrors the main app's Cohere-inspired design system (see
`../src/app/globals.css`) — same tokens, same components, copied verbatim
into plain CSS so this page ships with zero build step.

## Files

| File         | Purpose                                                                |
| ------------ | ---------------------------------------------------------------------- |
| `index.html` | Markup: hero, lead-magnet report preview, how-it-works, dark CTA, FAQ. |
| `styles.css` | Krost design system — tokens, type roles, buttons, cards, agent console. |
| `script.js`  | Email validation + POST to `/api/waitlist`. Idempotent, graceful errors. |
| `vercel.json`| Static-host headers + caching. Drop-in for `vercel deploy`.            |

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

**Same-origin deploy** (e.g. served from `krost.xyz` alongside the Next.js
app): no config needed.

**Separate-origin deploy** (this static page on `join.krost.xyz`, app on
`krost.xyz`): point the form at the absolute API URL in one of two ways.

1. Inline override before `script.js` in `index.html`:

   ```html
   <script>window.KROST_API = 'https://krost.xyz/api/waitlist';</script>
   <script src="script.js"></script>
   ```

2. Per-form override on either `<form>` tag:

   ```html
   <form id="waitlist-form" data-api="https://krost.xyz/api/waitlist">
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

Then visit `https://krost.xyz/join`. Same-origin, so the form works out of
the box.

## Anatomy — three lead-magnet sections

1. **Hero** — Cohere-style monumental headline + sub + inline email capture.
   Below the fold: the agent-console mockup card (same component from the
   main app homepage) so the page feels native.
2. **Free report** — the lead magnet itself. Numbered 4-point breakdown
   (score, 12-mo income, consistency, partner lenders) + tilted 3D PDF
   preview card. This is the value exchange that earns the email.
3. **How it works + Dark CTA + FAQ** — three steps, a dark `ink-black`
   conversion band with a second email field, then a five-question FAQ
   covering the friction objections (credit pull? real lenders? data?).

Plus: announcement bar, three-zone sticky nav, three-column footer — all
verbatim from the main app's design system.

## Editing copy

All copy lives inline in `index.html`. Search for the section comments
(`SECTION 1 — HERO`, `SECTION 2 — LEAD MAGNET`, etc.). Numbers used:

- `60 million Americans` — hero sub
- `2,400+ gig workers already on the list` — dark CTA
- `5,000` — waitlist cap in the announcement bar
- `724`, `$58,420`, `94%` — agent-console mock result (also `724` on the report card)
- `Three pilot lenders` — FAQ

Update all of these when real numbers are available.

## Design-system parity

If you change a token in `src/app/globals.css` you should mirror it here in
`styles.css`. The relevant tokens are at the top of the file inside the
`:root { … }` block. Components covered:

- `btn-primary`, `btn-primary-light`
- `input-pill` (+ `input-pill-dark` variant added here for the dark CTA)
- `card-media`, `agent-console`, `agent-console-chip`
- `chip-coral-outline`
- `announcement-bar`
- `eyebrow-dot`, `text-mono-label`, `text-display-hero`, `text-display-section`, `text-heading-section`, `text-footer-link`, `text-footer-header`

## Accessibility

- Semantic landmarks (`<header>`, `<section>`, `<footer>`).
- Skip-target focus on hash links.
- `role="status"` + `aria-live="polite"` on form feedback.
- Form labels are `aria-label` on the email inputs (placeholder is not the label).
- `prefers-reduced-motion` disables smooth scroll + transitions.
- Color contrast on `slate` (#75758a) against canvas meets WCAG AA for body
  text; the muted footer/disclaimer copy (#93939f) is reserved for 12 px
  metadata only.

## What's intentionally NOT here

- No React, no Next.js, no bundler. This is HTML + CSS + JS.
- No analytics tag. Add PostHog (`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`) in
  `index.html` `<head>` when you wire conversion tracking.
- No images. The hero "media" is a CSS-only agent console mock and the
  "report preview" is a CSS-only document card — both ship at zero
  bandwidth cost beyond the Google Fonts request.
