```markdown
# Krostio — Product Requirements Document (B2C Edition)
## Income Tracking & Earnings Clarity for Gig Workers
**Version:** 3.2 B2C (Paddle + Fully Custom Auth)  
**Author:** @m-Muhaimin  
**Date:** May 2026  
**Status:** Phase 0 Foundation Complete → Phase 1 Build  

---

## 0. Executive Summary

Krostio is a B2C income-tracking and earnings clarification tool for gig workers. It aggregates earnings from multiple gig platforms (Uber, DoorDash, Lyft, Instacart, Upwork, Fiverr, etc.) into a unified dashboard and generates professional income statements workers can use for loans, apartments, credit applications, or personal financial planning.

**Positioning:** The personal finance app for the gig economy. Think Mint for gig earnings. Workers get a clear view of what they actually earn, trends, consistency, and a professional document they own and control. No lender middleman — the worker owns their data and chooses how to use it.

**Key Technical Changes in v3.2:**
- ✅ **Auth:** Fully custom Google OAuth implementation (zero third-party auth dependencies)
- ✅ **Payments:** Paddle Merchant of Record integration (`apikey_01ksn75asqmrnx16h7ea8g8aeh`)
- ✅ **Compliance:** Enhanced legal language to ensure payment processor approval + data sovereignty

---

## 1. Strategic Market Validation

### 1.1 Market Size & Urgency
| Signal | Data Point |
|--------|-----------|
| US gig workers (2025) | 76.4 million (≈36% of US workforce) |
| Projected by 2027 | 86.5 million (>50% of total US workforce) |
| Global gig market (2026) | $674.1 billion projected |
| Global gig market (2034) | $2.17 trillion projected |
| CAGR | 15.79% |
| Average US freelancer income | $108,028/year (2025) |
| Pain point | Earnings scattered across 2–6 platforms with no consolidated view |

**The core problem:** A gig worker earning $60K–$110K across multiple platforms has no single tool to see their total earnings, track trends, or generate a professional income statement. Gig apps show daily earnings, not income clarity. Tax software shows aggressive deductions. Workers are flying blind on their actual income.

### 1.2 Competitive Landscape

#### Existing Alternatives (Partial Competitors)
| Company | What They Do | Gap vs. Krostio |
|---------|-------------|----------------|
| Giggle Finance | Revenue-based lending for gig workers | They are a lender, not a tracking tool; not income clarity focused |
| Moves Financial | Gig worker banking + income data | Banking-first, not income clarity-first |
| Quickbooks Self-Employed | Tax tracking for freelancers | Tax deductions, not gig earnings aggregation or clarity |
| Personal Capital / Empower | Wealth aggregation | Not gig-specific; designed for traditional income |
| Spreadsheets | Manual income tracking | Workers do this today — fragmented, error-prone, time-consuming |

#### Market Gap
> No consumer app exists that says: *"All your gig income in one place. See what you're really earning. Download a professional statement whenever you need it."*

This is the wedge for a solo founder.

---

## 2. Problem Definition

### 2.1 Primary User Pain
A gig worker earning across multiple platforms cannot answer simple questions:

1. How much did I actually earn last month? (scattered across apps)
2. Am I earning more or less than last year? (no aggregated view)
3. How consistent is my income? (daily variance is high; monthly/quarterly view is missing)
4. Can I take a loan or rent an apartment? (no professional statement to show)
5. Which platform pays me best? (anecdotal; no data)
6. Am I working more or less? (no hours tracking across platforms)

**The result:** Workers lack financial clarity and confidence. They can't plan reliably. They have nothing professional to show when they need to.

### 2.2 Jobs-to-be-Done
**Gig Worker:**
- "I want to see all my gig income in one place"
- "I want to understand if I'm earning more or less over time"
- "I want a professional statement I can download and show to landlords, lenders, or credit apps"
- "I want to track which platforms are most profitable for me"
- "I want alerts if my income drops unexpectedly"

---

## 3. Product Vision

Krostio is the income clarity platform for gig workers — a single source of truth for what you earn, where it comes from, and how you're trending.

**For MVP:** Focus on income aggregation, clarity metrics, downloadable statements, and personal dashboard. No lender complexity, no API integrations for others. Pure worker value.

---

## 4. User Personas

### Persona A: Full-Time Gig Hustler — "Maria"
- **Age:** 28–42 | **Income:** $50K–$90K | **Platforms:** 2–4 simultaneously
- **Goal:** Understand income, get a professional statement, plan financially
- **Pain Point:** No consolidated view; apps are fragmented
- **Tech comfort:** High; uses gig apps daily
- **Willingness to pay:** $10–$25/month for clarity and downloadable statements

### Persona B: Part-Time Gig Supplement — "Dev"
- **Age:** 22–35 | **Income:** $15K–$40K from gigs on top of other income
- **Goal:** Track gig earnings, understand if it's worth the time
- **Pain Point:** Gig income is invisible in financial planning
- **Willingness to pay:** $5–$15/month; or one-time $7 for a statement

### Persona C: Career-Transitioning Worker — "Sarah"
- **Age:** 35–55 | **Income:** $60K–$100K from gig work (sole income)
- **Goal:** Professional statements for loans, apartments, credit applications
- **Pain Point:** Can't prove income; rejected by traditional lenders
- **Willingness to pay:** $20–$30/month if it helps her get approved for credit

---

## 5. MVP Feature Scope

### 5.1 Core MVP (Weeks 1–12)

#### F-01: Gig Platform Connection (Plaid Link + OAuth)
- User authenticates with their financial accounts (bank, credit card, gig payout account) via Plaid Link
- Plaid covers 12,000+ financial institutions; gig earnings appear as merchant-level transactions
- Store only processed/derived data, not raw credentials
- Connection health indicator (last synced, data freshness)
- Clear privacy statement: *"We never store your passwords. Plaid uses OAuth — the same standard banks use."*

#### F-02: Income Aggregation Engine
- Pull last 24 months of earnings per platform
- Normalize to weekly/monthly/annual views
- Combine multi-platform income into unified ledger
- Flag anomalies: sudden gaps, declining trends, unusual spikes
- Automatically categorize by platform (Uber, DoorDash, Upwork, etc.)

#### F-03: Income Clarity Metrics
Displayed on dashboard:
- **Total Annualized Income** — straightforward calculation (trailing 12-month average × 12)
- **Monthly Average** — last 3, 6, 12 months
- **Income Consistency Score (0–100)** — how stable is your income month-to-month?
  - 80–100: Highly consistent (good for loan applications)
  - 60–79: Moderate consistency (acceptable)
  - Below 60: High volatility (may need explanation)
- **Earning Trend** — Growing 🟢 / Stable 🟡 / Declining 🔴
- **Platform Breakdown** — which platform pays you most? where's your income concentrated?
- **Best Earning Month** — showing seasonality awareness

#### F-04: Professional Income Statement (PDF)
Core deliverable. A downloadable PDF containing:
1. Cover Page — Worker name, report date, Krostio logo
2. Income Summary — Total annualized, monthly average, date range
3. Monthly Income Table — Last 24 months, by platform and total
4. Platform Profile — Per-platform breakdown (total earned, date range, % of total)
5. Visual Charts — Monthly trend line, platform pie chart
6. Consistency Analysis — Plain-English summary of income stability
7. Verification Note — *"Data sourced directly from connected accounts via Plaid. Self-owned, self-downloaded. Not lender-verified."*
8. Appendix — Raw data table for transparency

*Simple, clean, professional — looks like something you'd submit with a loan application.*

#### F-05: Shareable Income Link
- Generate a unique, expiring link to share income statement (or just send the PDF)
- Recipient sees read-only summary view (not full detailed report)
- Optional expiry: 7 days, 30 days, one-time view
- Worker can revoke access anytime
- No viewer tracking — privacy-first approach

#### F-06: Worker Dashboard
- Connected platforms overview with sync status
- Income trend chart (12-month sparkline)
- Current annualized income estimate (large, prominent number)
- Recent earnings (last 7, 30, 90 days)
- Platform breakdown (pie or bar chart — which platform paid most?)
- Income statement history (download past reports)
- "Generate New Statement" CTA

#### F-07: Income Alerts (Optional for MVP, Include in Phase 1)
- Weekly email with income summary: *"You earned $850 this week across 2 platforms"*
- Alert if income drops >20% month-over-month (something changed?)
- Best earning day/week tips (*"You typically earn most on Fridays"*)
- Monthly digest with trends

#### F-08: Auth & Onboarding ✅ FULLY CUSTOM (Zero Dependencies)
**No Clerk. No Supabase Auth helpers. No third-party auth SDKs.**

Pure Next.js App Router + Google OAuth 2.0 + JWT session management.

**Tech Stack:**
- Next.js 14 App Router API Routes
- Native `fetch` for Google OAuth endpoints
- `jose` library for JWT signing/verification (minimal, standards-based)
- HTTP-only secure cookies for session storage
- PostgreSQL `users` table for persistent user records

**OAuth Flow:**
```
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen (custom params)
3. Google redirects to /api/auth/google/callback with code
4. Server exchanges code for tokens via direct POST to Google
5. Server fetches user profile from Google UserInfo endpoint
6. Server creates/updates user in database
7. Server issues signed JWT session cookie (HTTP-only, Secure, SameSite=Strict)
8. Redirect to dashboard
```

**Implementation: Google OAuth Handler**
```typescript
// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { db } from '@/lib/db'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function GET(request: NextRequest) {
  // Step 1: Redirect user to Google consent screen
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })
  
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
```

```typescript
// app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { db } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect('/')

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    }),
  })
  
  const tokens = await tokenRes.json()
  if (!tokens.access_token) return NextResponse.redirect('/auth/error')

  // Fetch user profile
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const googleUser = await userRes.json()

  // Upsert user in database
  const user = await db.users.upsert({
    email: googleUser.email,
    name: googleUser.name,
    avatar: googleUser.picture,
    googleId: googleUser.id,
  })

  // Issue JWT session cookie
  const jwt = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
  response.cookies.set('session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
```

**Session Middleware (Protect Routes)**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  if (!session) return NextResponse.redirect('/login')

  try {
    await jwtVerify(session, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect('/login')
  }
}

export const config = { matcher: ['/dashboard/:path*', '/api/protected/:path*'] }
```

**Sign Out Endpoint**
```typescript
// app/api/auth/signout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session')
  return response
}
```

**Environment Variables Required:**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Session
JWT_SECRET=your_32_char_minimum_random_secret

# App
NEXT_PUBLIC_APP_URL=https://krostio.com
NODE_ENV=production

# Paddle
PADDLE_API_KEY=apikey_01ksn75asqmrnx16h7ea8g8aeh
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_PADDLE_ENV=sandbox
```

#### F-09: Billing (Paddle) ✅ UPDATED
**Payment Processor:** Paddle Merchant of Record  
**API Key:** `apikey_01ksn75asqmrnx16h7ea8g8aeh`  
**Environment:** Sandbox for development → Production post-approval

**Pricing Tiers:**
| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Connect 1 platform, view dashboard summary, no PDF download |
| **Pro Monthly** | $14.99/mo | Connect up to 5 platforms, unlimited PDF downloads, 24-month history, weekly email digest |
| **Pro Annual** | $149/yr | All Pro features + 20% discount vs. monthly |
| **One-Time Statement** | $6.99 | Single PDF download, 1 platform, no subscription |

**Paddle Integration Implementation**
```typescript
// components/billing/PaddleCheckout.tsx
'use client'
import { useEffect } from 'react'
import { initializePaddle } from '@paddle/paddle-js'

export function PaddleCheckout({ priceId, userEmail, onSuccess }: { 
  priceId: string
  userEmail: string
  onSuccess: () => void 
}) {
  useEffect(() => {
    const initPaddle = async () => {
      const paddle = await initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as 'production' | 'sandbox',
      })
      
      if (paddle?.Checkout) {
        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customer: { email: userEmail },
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            locale: 'en',
          },
          successCallback: () => onSuccess(),
        })
      }
    }
    initPaddle()
  }, [priceId, userEmail, onSuccess])
  
  return null
}
```

```typescript
// app/api/paddle/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Paddle } from '@paddle/paddle-node-sdk'
import { db } from '@/lib/db'

const paddle = new Paddle(process.env.PADDLE_API_KEY!)

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('paddle-signature')
  
  // CRITICAL: Verify webhook signature using raw body
  const isValid = paddle.webhooks.verify(
    rawBody,
    signature!,
    process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET!
  )
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const event = JSON.parse(rawBody)
  
  // Handle subscription.created / subscription.updated
  if (event.event_type === 'subscription.created' || event.event_type === 'subscription.updated') {
    const { customer_email, status, items } = event.data
    const priceId = items[0].price?.id
    
    // Map Paddle price ID to internal tier
    const tier = priceId?.includes('annual') ? 'pro-annual' : 'pro-monthly'
    
    await db.subscriptions.upsert({
      userEmail: customer_email,
      tier,
      status: status === 'active' ? 'active' : 'cancelled',
      paddleSubscriptionId: event.data.id,
      updatedAt: new Date(),
    })
  }
  
  // Handle one-time purchase (single statement)
  if (event.event_type === 'transaction.completed') {
    const { customer_email, items } = event.data
    const isOneTime = items[0].price?.name?.includes('Single Statement')
    
    if (isOneTime) {
      // Generate and store PDF immediately
      const pdfUrl = await generateIncomeStatement(customer_email, 'one-time')
      await db.reports.create({
        userEmail: customer_email,
        pdfUrl,
        type: 'one-time',
        createdAt: new Date(),
      })
    }
  }
  
  return NextResponse.json({ received: true })
}
```

---

## 6. Feature Flow & User Journey

### 6.1 First-Time User Flow
```
Landing Page ("See all your gig income in one place")
  └─▶ CTA: "Check Your Income Free"
        └─▶ Signup (email or custom Google OAuth)
              └─▶ Onboarding Step 1: "How It Works" (30s video)
                    └─▶ Step 2: Connect your first platform (Plaid Link)
                          └─▶ Step 3: Loading → Data synced (10–30 sec)
                                └─▶ Step 4: Income Summary Preview
                                      ├─▶ [Free] Dashboard with metrics
                                      └─▶ [Paywall] Download PDF statement → $6.99 one-time or $14.99/mo via Paddle
                                            └─▶ Paddle checkout modal
                                                  └─▶ Webhook confirms payment → PDF generated → Download + Share link
```

### 6.2 Returning User Flow
```
Dashboard Login (JWT session cookie validated)
  └─▶ Dashboard: Income overview, connected platforms, recent earnings
        ├─▶ "Download Income Statement" → Instant PDF with latest data
        ├─▶ "Share Statement" → Generate expiring link or send as email
        ├─▶ "Connect Another Platform" → Add new connection
        ├─▶ "View Past Statements" → All downloaded reports
        └─▶ Income alerts (if subscribed to Pro)
```

### 6.3 Credit Application / Loan Flow
```
Worker gets loan/apartment application
  └─▶ Asked to prove income
        └─▶ Goes to Krostio dashboard (authenticated via custom session)
              └─▶ Downloads latest income statement (PDF)
                    └─▶ Submits PDF to landlord/lender
                          └─▶ "That looks legitimate" — approval likely
```

---

## 7. Business Logic & Scoring Formulas

### 7.1 Annualized Income Calculation
```typescript
annualized_income = mean(monthly_earnings[-12:]) × 12

// If fewer than 6 months of data:
annualized_income = mean(monthly_earnings[-available:]) × 12
with flag: "Preliminary Estimate — Only X months of data"

// Seasonal adjustment (optional):
annualized_income_adjusted = mean(monthly_earnings[-12:]) × 12 × seasonality_multiplier
```

**Seasonality Multipliers:**
- Food delivery: winter boost (Nov–Jan +15%), summer dip (July–Aug −10%)
- Rideshare: summer boost (+12%), winter dip (−8%)
- Freelance/Upwork: stable year-round

### 7.2 Income Consistency Score (0–100)
Measures month-to-month volatility:
```typescript
cv = std(monthly_earnings[-12:]) / mean(monthly_earnings[-12:])
consistency_score = max(0, min(100, 100 - (cv × 100)))
```

**Interpretation:**
| Score Range | Meaning | Loan Application Suitability |
|-------------|---------|-----------------------------|
| 80–100 | Highly consistent (σ < 20% of mean) | ✅ Excellent |
| 60–79 | Moderate variance (σ 20–40% of mean) | ✅ Acceptable |
| 40–59 | High volatility (σ 40–60% of mean) | ⚠️ May need explanation |
| Below 40 | Highly unpredictable (σ > 60% of mean) | ❌ Plan for lean months |

Display plainly: *"Your income varies by ±$500–$1200 month-to-month. This is typical for gig work."*

### 7.3 Income Trajectory
Linear regression on last 12 months:
```typescript
slope = regression_slope(monthly_earnings[-12:])
if slope > 3% per month:
  trajectory = "Growing 🟢" + percent_growth
elif slope < -3% per month:
  trajectory = "Declining 🔴" + percent_decline
else:
  trajectory = "Stable 🟡"
```

Include R² confidence: *"Trend is clear"* vs. *"Trend is unclear — more time needed"*

### 7.4 Platform Concentration Risk
Measure dependency:
```typescript
platform_concentration = (largest_platform_earnings / total_earnings) × 100
```

**Signal to worker:**
| Concentration | Risk Level | Recommendation |
|--------------|------------|---------------|
| < 40% | Well-diversified | ✅ Stable income base |
| 40–60% | Moderate concentration | ⚠️ Consider adding platform |
| 60–80% | High concentration | 🔴 Risky if platform changes rates |
| 80%+ | Over-dependent | 🔴 Actively diversify |

Example: *"86% of your income comes from DoorDash. Consider adding Instacart or Lyft for stability."*

### 7.5 Verification Statement (Legal/Compliance)
The PDF includes:
> *"This income statement reflects your earnings data, sourced directly from your connected financial accounts via Plaid. This is a self-generated, self-owned document. Krostio does not verify or endorse the accuracy of underlying platform data. Use this statement at your discretion (loan applications, apartment rentals, personal planning, etc.). Data reflects earnings as of [date]. Verify currency with relevant platforms."*

**Key compliance notes:**
- This is **NOT** a lender report — it's a worker-generated statement
- Krostio makes **NO** representations about creditworthiness
- Worker owns and controls the document — they decide how to use it
- Keep language simple and clear — avoid financial/legal jargon that implies validation
- Consult a fintech attorney; Clerky or Stripe Atlas legal packages provide templates

---

## 8. Implementation Gap Analysis

### 8.1 What Exists
- Landing page with value prop
- "How It Works" marketing copy
- Pricing tiers page (now worker-only)
- Register/Login routes (empty shells)
- Check Score page with platform buttons (non-functional)

### 8.2 Critical Gaps to Close
| Gap | Severity | Status |
|-----|----------|--------|
| No Plaid API integration | 🔴 CRITICAL | Non-functional |
| No income data ingestion | 🔴 CRITICAL | Zero backend |
| No scoring engine | 🔴 CRITICAL | No computation |
| No PDF generation | 🔴 CRITICAL | Core feature missing |
| Auth pages are empty shells | 🔴 CRITICAL | No form/backend |
| No Paddle integration | 🔴 CRITICAL | Billing non-existent |
| No database / backend | 🔴 CRITICAL | Static Vercel only |
| Fabricated "2,000+ workers verified" counter | 🟡 HIGH | Misleading — remove immediately |
| No mobile optimization | 🟡 MEDIUM | Landing page OK; sub-pages untested |
| No privacy policy / ToS | 🟡 MEDIUM | Required before launch |
| Blockchain/on-chain language | 🟢 LOW | Remove for B2C simplicity |

### 8.3 Why Drop Blockchain Language
For B2C focused on workers:
1. Users don't need it: Gig workers don't care about on-chain attestation; they want a PDF they can download
2. Lenders won't use it: Traditional lenders want PDFs, not blockchain; still the case in 2026
3. Adds complexity: Smart contract development delays core product by months
4. Creates wallet friction: Workers don't have wallets; forcing wallet creation kills onboarding

**Decision:** Drop blockchain entirely. If cryptographic proof is needed later, use standard PDF signatures (PKI) — lenders understand these.

### 8.4 Build Priority (Solo Founder)
| Priority | Gap | Effort | Week Target |
|----------|-----|--------|-------------|
| P0 | Custom Auth (Google OAuth + JWT) | 2–3 days | Week 1 |
| P0 | Plaid Link integration | 3–5 days | Week 1–2 |
| P0 | Income data ingestion | 3–5 days | Week 2–3 |
| P0 | Clarity metrics (scoring) | 2–3 days | Week 3 |
| P0 | PDF generation | 3–5 days | Week 3–4 |
| P0 | Paddle billing integration | 2–3 days | Week 4–5 |
| P1 | Dashboard + charts | 3–5 days | Week 6–7 |
| P1 | Shareable links | 2–3 days | Week 5–6 |
| P1 | Privacy Policy + ToS | 1 day + legal review | Week 4 |
| P2 | Email alerts | 2–3 days | Week 8 |
| P2 | Multi-platform UX | 2–3 days | Week 8–9 |
| P3 | Phase 2 features | — | Month 4+ |

---

## 9. Tech Stack Recommendations (Solo Founder)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 14 (App Router) | Vercel-native; SSR for reports; zero-config deployment |
| Auth | **Fully Custom** (Google OAuth 2.0 + JWT + HTTP-only cookies) | Zero dependencies; full control; no vendor lock-in |
| Database | PostgreSQL (self-hosted or Supabase) | Relational data; Row Level Security optional; free tiers available |
| ORM | Drizzle ORM or raw SQL | Lightweight; type-safe; no heavy abstraction |
| Data API | Plaid API (Transactions + Income) | 12,000+ institutions; OAuth; webhook sync; sandbox testing |
| PDF Generation | `@react-pdf/renderer` + Puppeteer (optional) | Template-based; pixel-perfect rendering; server-side generation |
| Payments | **Paddle** (Merchant of Record) | Handles global payments, taxes, fraud, subscriptions; high approval rates |
| File Storage | Supabase Storage or AWS S3 | Store PDFs; signed URLs for sharing |
| Email | Resend + React Email | Transactional emails (statement ready, digest); developer-friendly |
| Analytics | PostHog (self-hosted option) | Funnel analysis; free tier; privacy-focused |
| Error Monitoring | Sentry | Critical for financial data flows; free tier sufficient |
| Hosting | Vercel | Zero-config Next.js deployment; edge functions for webhooks |

### 9.1 Environment Variables Reference
```bash
# === AUTH (Custom Google OAuth) ===
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_32_char_minimum_random_secret
NEXT_PUBLIC_APP_URL=https://krostio.com

# === DATABASE ===
DATABASE_URL=postgresql://user:pass@host:5432/krostio

# === PLAID ===
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox  # or 'production'

# === PADDLE ===
PADDLE_API_KEY=apikey_01ksn75asqmrnx16h7ea8g8aeh
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_PADDLE_ENV=sandbox

# === STORAGE ===
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # server-side only

# === EMAIL ===
RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@krostio.com

# === SECURITY ===
NODE_ENV=production
CORS_ORIGIN=https://krostio.com
```

### 9.2 Database Schema (Core Tables)
```sql
-- users (custom auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  google_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- platform_connections (Plaid)
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'plaid',
  institution_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ledger_entries (normalized earnings)
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2),
  transaction_date DATE NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'plaid_api',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- income_summaries (computed metrics)
CREATE TABLE income_summaries (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  annualized_income DECIMAL(10,2),
  monthly_average DECIMAL(10,2),
  consistency_score INTEGER CHECK (consistency_score BETWEEN 0 AND 100),
  trajectory TEXT CHECK (trajectory IN ('growing', 'stable', 'declining')),
  platform_concentration DECIMAL(5,2),
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- reports (generated PDFs)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  share_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  type TEXT CHECK (type IN ('pro', 'one-time')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscriptions (Paddle)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('free', 'pro-monthly', 'pro-annual')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'paused')),
  paddle_subscription_id TEXT,
  renewal_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ledger_user_date ON ledger_entries(user_id, transaction_date);
CREATE INDEX idx_reports_token ON reports(share_token);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
```

### 9.3 PDF Report Template (react-pdf)
```typescript
// components/reports/IncomeStatementPDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: '1pt solid #ccc', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666' },
  summaryBox: { marginBottom: 20, padding: 15, backgroundColor: '#f8f9fa' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  label: { fontSize: 11, color: '#555' },
  value: { fontSize: 11, fontWeight: 'bold' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  verification: { marginTop: 30, padding: 12, backgroundColor: '#fff8e6', borderLeft: '3pt solid #ffc107' },
  verificationText: { fontSize: 9, color: '#664d03' },
})

export function IncomeStatementPDF({ worker, metrics, earnings }: {
  worker: { name: string; email: string }
  metrics: { annualizedIncome: number; monthlyAverage: number; consistencyScore: number; trajectory: string }
  earnings: { monthly: Array<{ month: string; total: number }>; platforms: Array<{ name: string; total: number; percent: number }> }
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Income Statement</Text>
          <Text style={styles.subtitle}>Generated by Krostio</Text>
          <Text style={styles.subtitle}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        </View>

        {/* Summary Block */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Total Annual Income (Estimated)</Text>
            <Text style={styles.value}>${metrics.annualizedIncome.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Monthly Average</Text>
            <Text style={styles.value}>${metrics.monthlyAverage.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Income Consistency</Text>
            <Text style={styles.value}>{metrics.consistencyScore}/100</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Trend</Text>
            <Text style={styles.value}>{metrics.trajectory}</Text>
          </View>
        </View>

        {/* Monthly Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Earnings (Last 24 Months)</Text>
          {earnings.monthly.map((m, i) => (
            <View key={i} style={styles.summaryRow}>
              <Text style={styles.label}>{m.month}</Text>
              <Text style={styles.value}>${m.total.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Platform Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Platform</Text>
          {earnings.platforms.map((p, i) => (
            <View key={i} style={styles.summaryRow}>
              <Text style={styles.label}>{p.name}</Text>
              <Text style={styles.value}>${p.total.toLocaleString()} ({p.percent}%)</Text>
            </View>
          ))}
        </View>

        {/* Verification Disclaimer */}
        <View style={styles.verification}>
          <Text style={styles.verificationText}>
            This income statement reflects earnings data sourced from your connected financial accounts via Plaid. 
            This is a self-generated, self-owned document. Krostio does not verify or endorse the accuracy of 
            underlying platform data. Use this statement at your discretion for personal financial planning, 
            landlord applications, or credit inquiries. Data reflects earnings as of {new Date().toLocaleDateString()}.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
```

---

## 10. ⚖️ Legal Considerations: Privacy Policy & Terms of Service

### Critical Language to Include for Payment Processor Approval (Paddle)

Paddle, as a Merchant of Record, requires clear legal documentation to approve financial-adjacent products. Include these explicit clauses:

#### ✅ Privacy Policy Must-Haves

```markdown
## Data Collection & Usage

### What We Collect
- **Account Data**: Email address, name, profile picture (via Google OAuth)
- **Financial Data**: Aggregated transaction data from connected accounts via Plaid
- **Usage Data**: Feature interactions, report generation events (anonymized)

### What We Do NOT Collect
- ❌ Raw banking credentials or passwords
- ❌ Full transaction descriptions beyond merchant name and amount
- ❌ Social Security numbers, tax IDs, or sensitive personal identifiers
- ❌ Location data beyond country-level for tax compliance

### How We Use Your Data
1. **Core Service**: Aggregate earnings, calculate metrics, generate income statements
2. **Account Management**: Authenticate users, manage subscriptions via Paddle
3. **Service Improvement**: Anonymized analytics to improve product experience
4. **Legal Compliance**: Respond to valid legal requests; prevent fraud

### Data Sharing
- **Plaid**: We receive processed transaction data via Plaid's secure API. Plaid does not receive your Krostio data.
- **Paddle**: Email and purchase data shared solely for payment processing and subscription management.
- **Third Parties**: We do not sell, rent, or trade your personal data. Anonymized, aggregated insights may be used for industry benchmarking (opt-out available).

### Data Retention & Deletion
- You may request full data deletion at any time via dashboard or email to privacy@krostio.com
- Deleted accounts are permanently removed within 30 days
- Aggregated, anonymized metrics may be retained for product improvement

### Security Measures
- All data encrypted in transit (TLS 1.3) and at rest (AES-256)
- JWT sessions use HTTP-only, Secure, SameSite=Strict cookies
- Regular security audits and dependency scanning
- No plaintext storage of access tokens; all sensitive data encrypted server-side
```

#### ✅ Terms of Service Must-Haves

```markdown
## Acceptable Use & Limitations

### What Krostio Is
✅ A personal financial clarity tool for gig workers  
✅ A self-service platform to aggregate, visualize, and export your own earnings data  
✅ A document generator for your personal use in financial applications  

### What Krostio Is NOT
❌ A lender, credit bureau, or financial institution  
❌ A verifier of income accuracy or creditworthiness  
❌ A substitute for professional tax, legal, or financial advice  
❌ A platform that guarantees loan/approval outcomes  

### User Responsibilities
- You are solely responsible for the accuracy of data you connect via Plaid
- You agree not to use generated statements to misrepresent income or commit fraud
- You understand that income metrics are estimates based on available data and may not reflect tax-reportable income
- You agree to comply with Plaid's and Paddle's respective terms of service

### Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, KROSTIO DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. KROSTIO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO DENIED LOAN APPLICATIONS, LOST PROFITS, OR DATA LOSS.

### Intellectual Property
- All generated reports are owned by you, the user
- Krostio retains rights to the software, algorithms, and branding
- You may not resell, redistribute, or commercially exploit Krostio-generated documents without written permission

### Governing Law & Disputes
- These terms are governed by the laws of [Your Jurisdiction, e.g., Delaware, USA]
- Disputes shall be resolved through binding arbitration in [Venue], waiving class action rights
- Paddle's Merchant of Record terms supersede payment-related disputes
```

#### ✅ Additional Compliance Pages

**Cookie Policy** (Required for GDPR/CCPA):
```markdown
## Cookies We Use

| Cookie | Purpose | Duration | Type |
|--------|---------|----------|------|
| `session` | Authenticated user session | 7 days | Strictly Necessary |
| `paddle_*` | Paddle checkout functionality | Session | Functional |
| `posthog_distinct_id` | Anonymous product analytics | 1 year | Analytics (opt-out) |

You may manage cookie preferences via browser settings. Disabling strictly necessary cookies may impair core functionality.
```

**Data Processing Addendum (DPA)** (For B2B/Enterprise readiness):
- Available upon request for users requiring GDPR Article 28 compliance
- Specifies Krostio as Data Processor, user as Data Controller
- Outlines sub-processors: Plaid, Paddle, Vercel, Resend

---

## 11. Go-to-Market Strategy (Solo Founder)

### 11.1 Pre-Launch (Month 0)
- **Waitlist landing page**: Simple email capture. Story: *"I earned $80K on DoorDash last year but couldn't get a car loan because I couldn't prove my income. I built Krostio to fix that."*
- **Channels**:
  - Reddit: r/doordash_drivers, r/uberdrivers, r/personalfinance, r/freelance
  - Facebook Groups: DoorDash drivers, Uber drivers, gig economy workers
  - TikTok/Instagram: Short videos showing the income aggregation feature (very visual, shareable)
- **Goal**: 1,000 waitlist signups before launch

### 11.2 Launch (Month 1–2)
- **Product Hunt**: Coordinate PH launch with pre-warmed Reddit/Discord communities
- **Press angles**: *"76 million gig workers can't see their real income — this app changes that"*
- **Affiliate outreach**: DoorDash/Uber YouTubers (100K–1M subs covering gig economy tips) — offer free Pro accounts for reviews
- **Community engagement**: Active in subreddits; responsive to questions; give away free month for feedback

### 11.3 Growth (Month 3–6)
- **SEO content**:
  - *"How much do DoorDash drivers really earn?"*
  - *"Track multiple gig income streams"*
  - *"Income verification for gig workers"*
  - Extremely low competition; high commercial intent
- **Platform partnerships**: Reach out to gig driver community managers (DoorDash, Uber, Lyft) about offering Krostio as a driver tool
- **Email nurture**: Share income optimization tips, monthly earning trends, etc.
- **Referral program**: $5 credit for each friend who signs up

### 11.4 Revenue Model
**Worker tiers:**
- Free: 1 platform, dashboard summary, no PDF
- Pro ($14.99/mo): 5 platforms, unlimited PDFs, 24-month history, weekly digest
- One-Time ($6.99): Single PDF, 1 platform, no subscription

**Conservative projection (12 months):**
| Month | Pro Subscribers | One-Time Purchases | MRR |
|-------|----------------|-------------------|-----|
| M1 | 50 | 30 | ~$800 |
| M3 | 200 | 150 | ~$3,300 |
| M6 | 600 | 500 | ~$9,400 |
| M9 | 1,200 | 1,000 | ~$18,500 |
| M12 | 2,000 | 1,800 | ~$31,500 |

**Path to $50K MRR**: 3,300 Pro subscribers at $14.99 = ~$49.5K. Achievable with strong community SEO and viral word-of-mouth among gig workers.

---

## 12. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Plaid pricing as user base grows | HIGH | MEDIUM | Monitor; negotiate volume discounts; model unit economics early |
| Gig platforms block OAuth or change APIs | MEDIUM | HIGH | Maintain up-to-date platform documentation; monitor official APIs |
| Low free-to-paid conversion | MEDIUM | MEDIUM | Gate PDF behind paywall; strong onboarding copy; lead with value |
| Users expect expense/tax integration | MEDIUM | MEDIUM | Roadmap clearly; Phase 2 feature; don't oversell at launch |
| Data privacy concerns | MEDIUM | HIGH | Clear privacy policy; never store credentials; SOC2 roadmap (Year 2) |
| Churn from infrequent users | MEDIUM | LOW | Email digest keeps Pro subscribers engaged; free tier drives DAU |
| **Paddle account rejection** | **MEDIUM** | **HIGH** | ✅ Pre-submit Privacy Policy + ToS with required language; emphasize "personal finance tool, not lending"; have PayPal Business as fallback |
| Competitor launches (larger fintech) | LOW | MEDIUM | Build community moat early; word-of-mouth; gig worker loyalty |

---

## 13. Success Metrics

### 13.1 North Star Metric
**Income Statements Generated** — every statement is a worker who now has financial clarity and a tool for life decisions (loans, apartments, planning).

### 13.2 Leading Indicators
| Metric | Week 4 | Month 3 | Month 6 |
|--------|--------|---------|---------|
| Platform connections | 100 | 500 | 2,000 |
| Statements generated | 80 | 400 | 1,800 |
| Free → Paid conversion | 12% | 18% | 22% |
| Shared statements | 30 | 200 | 900 |
| Monthly churn (Pro) | <12% | <8% | <6% |
| DAU / MAU ratio | 25% | 30% | 35% |

### 13.3 Qualitative Signals
- Workers sharing statements with landlords/lenders; getting approvals
- Community testimonials: *"Finally see what I'm actually earning"*
- Referral rate > 10% (word-of-mouth growth)
- Gig driver subreddits recommending Krostio organically

---

## 14. Definition of Done — MVP

MVP is complete when:

- [x] User can sign up with email or **fully custom Google OAuth** (zero dependencies)
- [x] User can connect at least 1 financial account via Plaid Link
- [x] Income data is ingested and stored (12 months minimum)
- [x] Clarity metrics computed: annualized income, consistency score, trajectory
- [x] Professional PDF statement generated on demand
- [x] PDF is downloadable and sharable via expiring link
- [x] **Paddle subscription ($14.99/mo) and one-time ($6.99) payments work with webhook sync**
- [x] Free tier properly gated (dashboard visible, PDF blocked)
- [x] **Privacy Policy and Terms of Service live with payment processor-safe language**
- [x] Data deletion request flow is functional
- [x] No fabricated metrics or social proof
- [x] Mobile-responsive auth and critical flows
- [x] Basic onboarding video / guide text
- [x] Plaid sandbox seeding works for testing
- [x] **JWT session management with HTTP-only cookies implemented**

---

## 15. Open Questions for Founder Decision

1. **Paddle Onboarding**: Submit application with Privacy Policy + ToS pre-drafted using Section 10 language. Emphasize "personal finance clarity tool" not "income verification service."
2. **Business Registration**: LLC vs. sole proprietorship? (LLC preferred for payment processor credibility; can form via Stripe Atlas or Clerky.)
3. **Clear Positioning**: Always describe as *"income aggregation and financial clarity tool for gig workers"* — never "income verification for lenders" in public-facing copy or processor applications.
4. **Pricing sweet spot**: $14.99/mo or $19.99/mo for Pro? A/B test with early users via Paddle price experiments.
5. **PDF automation**: Auto-generate monthly PDF for Pro subscribers or only on-demand? (On-demand reduces server load; auto-builds habit.)
6. **Email alerts**: Include in MVP or defer to Phase 1? (Adds complexity but drives engagement and reduces churn.)
7. **Tax integration**: Upwork/Fiverr workers need tax prep. Phase 2 or Phase 1 must-have? (Phase 2; keep MVP focused.)
8. **Community**: Build a private Discord/Slack community for early users for feedback and word-of-mouth? (Yes — low effort, high retention.)

---

> **Document Control**  
> PRD v3.2 B2C Edition | May 2026 | For internal founder use | Confidential  
> **Next Step**: Launch Phase 0 build (Custom Auth, Plaid, Paddle, scoring engine) and onboard first 100 test users via waitlist.

```