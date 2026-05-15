# Krost Email Templates

All email templates live here. They share a single HTML layout engine
(`_shared/layout.py`) that generates bulletproof table-based email HTML from
template data dicts. Run the generator once to emit all 13 `.html` files.

## Directory structure

```
email-templates/
├── _shared/
│   ├── layout.py          ← single generator script — run: python layout.py
│   └── base-styles.css   ← design-token reference (not used at runtime)
├── supabase/              ← 6 Supabase auth email templates
│   ├── confirm-signup.html
│   ├── invite.html
│   ├── magic-link.html
│   ├── change-email.html
│   ├── reset-password.html
│   └── reauthentication.html
├── transactional/        ← 7 Krost product emails
│   ├── welcome.html
│   ├── waitlist-confirmation.html
│   ├── score-ready.html
│   ├── lender-request.html
│   ├── lender-approved.html
│   ├── payment-receipt.html
│   └── payment-failed.html
└── README.md
```

## Quick-start

```bash
cd email-templates/_shared
python layout.py          # generates all 13 .html files
# or run from project root:
python email-templates/_shared/layout.py --out ../supabase ../transactional
```

The generator is idempotent — re-running overwrites with fresh output.

## Design system

All templates use the same Cohere-inspired tokens as `src/app/globals.css`.
Tokens are inlined directly in the generated HTML so every email is
self-contained (no external CSS requests in email clients).

| Token                  | Value                          |
|------------------------|--------------------------------|
| `--ink-black`          | `#17171c`                     |
| `--coral`              | `#ff7759`                     |
| `--soft-stone`         | `#eeece7`                     |
| `--border`             | `#d9d9dd`                     |
| `--muted-slate`        | `#93939f`                     |
| `--font-display`       | Space Grotesk                  |
| `--font-sans`          | Inter                         |
| `--font-mono`          | JetBrains Mono                 |
| `--radius`             | 6px (email-safe)              |

## Supabase auth templates

Supabase uses Handlebars-style variables. The 6 templates match the exact
filenames Supabase expects and contain the variables Supabase replaces at
send time. **Variable mapping:**

| Template                  | Supabase variable          |
|---------------------------|----------------------------|
| `confirm-signup.html`     | `{{ .ConfirmationURL }}`   |
| `invite.html`             | `{{ .ConfirmationURL }}`   |
| `magic-link.html`         | `{{ .ConfirmationURL }}`   |
| `change-email.html`       | `{{ .ConfirmationURL }}`   |
| `reset-password.html`     | `{{ .ConfirmationURL }}`   |
| `reauthentication.html`   | `{{ .Token }}`             |

**Setup in Supabase Dashboard:**

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. For each template, click **Edit** and paste the generated HTML
3. Under **Site URL**, set `https://krost.xyz` (or your deploy URL)
4. Set **Redirect URLs** to include `https://krost.xyz/**`
5. For `confirm-signup`, make sure **Enable email confirmations** is ON

When Supabase sends an auth email, it automatically substitutes
`{{ .ConfirmationURL }}` and `{{ .Token }}` with the real, time-limited,
single-use URLs/tokens before delivery.

> **Note:** The generated HTML files are self-contained — paste the raw
> HTML (not a URL). Supabase does not fetch templates from a URL.

## Transactional templates

These are sent from your own API routes (`src/app/api/...`). Wire them via
your email-sending library (Resend, Postmark, SendGrid, etc.).

Example — sending `score-ready.html` from an API route:

```ts
// src/app/api/gig-platforms/webhook/route.ts (or wherever score is computed)
import { renderScoreReadyEmail } from '@/lib/email-templates'
import { resend } from '@/lib/resend'   // your email lib

const html = renderScoreReadyEmail({ name: 'Jordan', score: 724, url: 'https://krost.xyz/dashboard/worker/score' })
await resend.emails.send({ from: 'Krost <hello@krost.xyz>', to: userEmail, subject: 'Your Krost Score is ready', html })
```

Each transactional template exports a `render*Email({ ... })` function
from `_shared/layout.py`. See the function signatures in `layout.py`.

## Testing locally

1. Generate all files: `python _shared/layout.py`
2. Open any `.html` in a browser — they are self-contained.
3. Test in real clients: use [Mailtrap](https://mailtrap.io) or
   [Resend API](https://resend.com) to send actual emails.

For Mailtrap inbox preview:
```bash
curl -X POST https://webhook.mailtrap.io/api/inject \
  -H "Api-Token: YOUR_MAILTRAP_TOKEN" \
  -F "file=@transactional/score-ready.html"
```

## Editing

All shared design decisions live in `_shared/layout.py`:
- `BRAND_NAME`, `BRAND_DOMAIN`, `LOGO_URL`
- `BRAND_COLORS` dict
- `FONT_IMPORTS` (Google Fonts — only fonts that work in email)
- `EMAIL_WIDTH = 600` (Gmail-safe)
- `BASE_TEMPLATE()` function (full HTML shell)

To add a new template:
1. Add a `def render_new_template(params): ...` function to `layout.py`
2. Call it in `main()` with the output path
3. Re-run `python layout.py`

Never edit generated `.html` files directly — they will be overwritten on the
next run.

## Dark mode

All templates use `[data-og]`-prefixed inline color declarations for
Gmail/Outlook dark mode. The light layout is the default; dark mode is
progressive enhancement. Do not remove the `data-og` attributes.

## Accessibility

- All text has ≥ 4.5:1 contrast ratio against its background.
- Images have descriptive `alt` text.
- Links are underlined in body text (not relied upon for identification).
- `role="presentation"` on decorative elements.
- `lang="en"` on the root `<html>` element.
