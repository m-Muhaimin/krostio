# KROSTIO PLATFORM — TECHNICAL PRD v3.0
## *Unified System Specification: Four-Pillar Financial Identity Platform for Gig Workers*

**Repository:** `github.com/m-Muhaimin/krostio`  
**Supersedes:** PRD v1.0 (income verification), PRD v2.0 (strategic refactor)  
**Document Type:** Unified Technical Specification  
**Audience:** AI coding agents, senior engineers, technical founders  
**Status:** Authoritative Build Directive  
**Date:** May 2026

---

## SYSTEM PROMPT: HOW TO READ THIS DOCUMENT

You are an AI coding agent or senior engineer building the Krostio platform. This document is your single source of truth. It consolidates strategic vision (PRD v2.0) with technical implementation patterns (existing codebase) into executable specifications.

**Reading Protocol:**
1. **Part I (Architecture)** defines the complete system structure — read this first to understand what you're building
2. **Part II (Data Models)** specifies every database table, API contract, and type definition — reference this when writing code
3. **Part III (Build Sequence)** dictates the exact order of implementation — never skip phases
4. **Part IV (Technical Constraints)** documents non-negotiable conventions — violating these breaks the system
5. **Part V (Integration Specs)** provides concrete implementation guidance for external services

**Document Conventions:**
- `Code snippets` are production-ready unless marked `// Example`
- **Bold terms** are defined concepts used consistently throughout
- Table schemas use TypeScript notation for clarity; translate to SQL/Supabase as needed
- All file paths relative to repository root unless prefixed with `/mnt/`

**Change Management:**
This document supersedes all prior PRDs. If conflict arises between v1.0, v2.0, or existing code comments, **this document wins**. Update `AGENTS.md` and `CLAUDE.md` to reference this PRD as the authoritative spec.

---

## PART I — SYSTEM ARCHITECTURE OVERVIEW

### 1.1 The Complete Mental Model

Krostio is a **four-pillar platform** that transforms gig worker income data into portable financial identity. Each pillar is a distinct product with independent value; together they create compounding network effects.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KROSTIO PLATFORM ARCHITECTURE                         │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────┐│
│  │  PILLAR 1      │  │  PILLAR 2      │  │  PILLAR 3      │  │  PILLAR 4  ││
│  │  krostioScore   │→→│  krostioLedger  │→→│  krostioVerifier│→→│  Passport  ││
│  │                │  │                │  │                │  │            ││
│  │  300-850 score │  │  Multi-platform│  │  PDF reports + │  │  On-chain  ││
│  │  from gig      │  │  earnings      │  │  shareable     │  │  soul-bound││
│  │  income signals│  │  aggregation   │  │  links         │  │  credential││
│  └────────────────┘  └────────────────┘  └────────────────┘  └────────────┘│
│         ↑                    ↑                    ↑                  ↑      │
│         └────────────────────┴────────────────────┴──────────────────┘      │
│                              Unified Data Layer                              │
│         (Supabase PostgreSQL + RLS + Real-time + Storage + Auth)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Flow (Left to Right):**
1. **Ledger** ingests earnings from gig platforms via Argyle API → stores in `ledger_entries`
2. **Score** computes 9-factor creditworthiness from `ledger_entries` → stores in `credit_scores`
3. **Verifier** generates PDF reports and shareable links from Score + Ledger → stores in `reports`
4. **Passport** mints on-chain attestation of Score to Base L2 → stores reference in `passports`

**Dependency Chain:**
- Score depends on Ledger (cannot compute score without earnings data)
- Verifier depends on Score + Ledger (report contains both)
- Passport depends on Score (only workers with score ≥580 can mint)
- Ledger is foundational; build it first

### 1.2 Technology Stack (Confirmed from Repository)

The following stack is **already committed** to the repository. Do not introduce alternatives without explicit architectural review.

| Layer | Technology | Location | Status |
|---|---|---|---|
| **Framework** | Next.js 16 (App Router) | `src/app/` | ✅ Scaffolded |
| **Language** | TypeScript 5.x | `tsconfig.json` | ✅ Configured |
| **Styling** | Tailwind CSS v4 | `src/app/globals.css` | ✅ Configured |
| **Database** | Supabase (PostgreSQL + Auth + Storage + Real-time) | `db/migration.sql` | ✅ Schema committed |
| **Authentication** | Supabase Auth (email + OAuth) | `src/lib/supabase-*.ts` | ✅ 3 client patterns |
| **Payments** | Stripe (4-tier billing) | `src/lib/stripe.ts` | ✅ Configured |
| **Analytics** | PostHog | `src/lib/analytics-provider.tsx` | ✅ Wired |
| **Blockchain** | Hardhat + Solidity 0.8.20 + Base L2 | `blockchain/` | ✅ Contract exists |
| **Gig Data** | Argyle API (primary) | `.env.example` | ⚠️ Keys defined, not implemented |
| **PDF Generation** | react-pdf (recommended) | Not yet installed | ❌ To implement |
| **Email** | Resend or SendGrid | `/email-templates/` | ⚠️ Templates exist, not wired |

**Critical Path Dependencies:**
1. Argyle SDK → enables Ledger
2. react-pdf → enables Verifier
3. Hardhat + ethers.js → enables Passport
4. Stripe → gates Pro/Annual tiers

### 1.3 Application Structure (Next.js 16 App Router)

```
src/app/
├── (auth)/
│   ├── login/page.tsx          # Email/password + OAuth login
│   ├── register/page.tsx       # New user signup
│   └── onboarding/page.tsx     # Post-signup: connect first platform via Argyle
│
├── (dashboard)/
│   ├── page.tsx                # Dashboard: Score + Ledger summary + CTA to connect platforms
│   ├── ledger/page.tsx         # Full ledger timeline, monthly rollups, CSV export
│   ├── score/page.tsx          # Score breakdown, factor analysis, improvement tips
│   ├── reports/page.tsx        # Generate new report, view history, manage shareable links
│   ├── passport/page.tsx       # Mint Passport, view attestation history, privacy controls
│   ├── settings/page.tsx       # Account settings, connected platforms, notifications
│   └── billing/page.tsx        # Stripe billing, plan management, upgrade flow
│
├── (marketing)/
│   ├── page.tsx                # Public landing page
│   ├── pricing/page.tsx        # 4-tier pricing table
│   ├── about/page.tsx          # About Krostio, mission, team
│   └── passport/[token]/page.tsx  # Public Passport viewer (SSR)
│
├── api/
│   ├── auth/callback/route.ts       # Supabase OAuth callback
│   ├── ingest/
│   │   ├── argyle/webhook/route.ts  # Argyle pushes income updates
│   │   ├── [platform]/sync/route.ts # Manual re-sync trigger
│   │   └── csv-upload/route.ts      # CSV ledger entry upload
│   ├── ledger/
│   │   ├── summary/route.ts         # GET: monthly rollup for current user
│   │   ├── entries/route.ts         # GET: paginated ledger entries
│   │   └── export/route.ts          # GET: CSV download
│   ├── score/
│   │   ├── current/route.ts         # GET: latest krostioScore + factors
│   │   └── history/route.ts         # GET: score over time
│   ├── reports/
│   │   ├── generate/route.ts        # POST: create PDF + link
│   │   ├── [id]/route.ts            # GET: report metadata
│   │   ├── [id]/pdf/route.ts        # GET: signed URL to PDF
│   │   ├── [id]/revoke/route.ts     # POST: revoke access
│   │   └── view/[token]/route.ts    # GET: public report viewer
│   ├── passport/
│   │   ├── mint/route.ts            # POST: initiate on-chain mint
│   │   ├── update/route.ts          # POST: push score update to chain
│   │   ├── [address]/route.ts       # GET: public Passport data
│   │   └── history/route.ts         # GET: attestation history
│   └── lender/                      # B2B API (Phase 2)
│       ├── verify/[token]/route.ts  # GET: lender queries report
│       └── api/score/route.ts       # GET: lender API key verification
│
└── lib/
    ├── supabase-browser.ts          # Client-side Supabase (React components)
    ├── supabase-server.ts           # Server-side Supabase (API routes, Server Components)
    ├── middleware-core.ts           # Middleware Supabase client
    ├── scoring-engine.ts            # Pure function: compute krostioScore
    ├── report-generator.tsx         # react-pdf: generate PDF reports
    ├── stripe.ts                    # Stripe client + webhook handlers
    └── analytics-provider.tsx       # PostHog provider
```

**Route Group Responsibilities:**
- `(auth)`: Unauthenticated pages; redirects logged-in users to `/dashboard`
- `(dashboard)`: Requires authentication; middleware enforces; all pages assume `user` exists
- `(marketing)`: Public pages; no auth required; SSR for SEO
- `api/`: Backend routes; use Server Components conventions; return JSON or streams

### 1.4 Database Architecture (Supabase PostgreSQL + RLS)

**Schema Files:**
- `db/migration.sql` — v1.0 schema (6 tables committed)
- `db/migration-v2.sql` — v2.0 additions (7 new tables, will be created in Part II)

**Row-Level Security (RLS) Principles:**
- **Every table** has RLS enabled
- **User-scoped tables** (`profiles`, `ledger_entries`, `credit_scores`, `reports`, `passports`) restrict rows to `user_id = auth.uid()`
- **Public-readable tables** (`reports` via `share_token`, `passports` via `wallet_address`) allow anonymous SELECT with conditions
- **Admin-only tables** (`lender_orgs`) require service role key

**Real-time Subscriptions:**
- `ledger_entries` publishes `INSERT` events → dashboard auto-updates when new income syncs
- `credit_scores` publishes `UPDATE` events → score widget refreshes without reload
- Enabled via Supabase Real-time; subscribe in React components using `supabase.channel()`

---

## PART II — COMPLETE DATA MODEL SPECIFICATION

### 2.1 Core Tables (v1.0 Schema — Already Committed)

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can read/update only their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: Auto-create profile on user signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**TypeScript Interface:**
```typescript
interface Profile {
  id: string;              // UUID from auth.users
  email: string;
  full_name: string | null;
  created_at: string;      // ISO 8601
  updated_at: string;
}
```

#### `platform_connections`
```sql
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,           -- 'uber' | 'doordash' | 'upwork' | 'lyft' | 'instacart'
  argyle_account_id TEXT,           -- Argyle's account identifier
  connection_status TEXT DEFAULT 'pending',  -- 'pending' | 'active' | 'error' | 'disconnected'
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections" ON platform_connections FOR ALL USING (auth.uid() = user_id);
```

**TypeScript Interface:**
```typescript
type Platform = 'uber' | 'doordash' | 'upwork' | 'lyft' | 'instacart' | 'fiverr' | 'grubhub' | 'amazon_flex';
type ConnectionStatus = 'pending' | 'active' | 'error' | 'disconnected';

interface PlatformConnection {
  id: string;
  user_id: string;
  platform: Platform;
  argyle_account_id: string | null;
  connection_status: ConnectionStatus;
  last_sync_at: string | null;
  created_at: string;
}
```

#### `income_records` (Deprecated in v2 — Use `ledger_entries`)
```sql
-- DO NOT USE: This table exists in v1 schema but is replaced by ledger_entries in v2
-- Keep for backwards compatibility during migration; will be dropped in Phase 2
CREATE TABLE income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Migration Path:**
1. Phase 0: Use `income_records` for MVP
2. Phase 1: Migrate all data to `ledger_entries`
3. Phase 2: Drop `income_records` table

#### `credit_scores`
```sql
CREATE TABLE credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
  score_tier TEXT NOT NULL,         -- 'elite' | 'strong' | 'building' | 'emerging'
  factors JSONB NOT NULL,            -- { income_score: 75, tenure_score: 60, ... }
  income_snapshot JSONB NOT NULL,    -- { avgMonthlyIncome: 5200, ... }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own scores" ON credit_scores FOR SELECT USING (auth.uid() = user_id);

-- Index for score history queries
CREATE INDEX idx_credit_scores_user_created ON credit_scores(user_id, created_at DESC);
```

**TypeScript Interface:**
```typescript
type ScoreTier = 'elite' | 'strong' | 'building' | 'emerging';

interface ScoreFactors {
  income_score: number;        // up to +80
  tenure_score: number;        // up to +70
  volatility_score: number;    // up to +60
  diversity_score: number;     // up to +50
  consistency_score: number;   // up to +50
  trajectory_score: number;    // up to +40
  tax_compliance: number;      // up to +25 (v2 addition)
  cross_platform_growth: number; // up to +20 (v2 addition)
  ledger_depth: number;        // up to +15 (v2 addition)
}

interface CreditScore {
  id: string;
  user_id: string;
  score: number;               // 300-850
  score_tier: ScoreTier;
  factors: ScoreFactors;
  income_snapshot: KrostScoreInputs; // from scoring-engine.ts
  created_at: string;
}
```

#### `lender_requests`
```sql
CREATE TABLE lender_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lender_email TEXT,
  request_type TEXT DEFAULT 'report',  -- 'report' | 'score_only'
  status TEXT DEFAULT 'pending',        -- 'pending' | 'approved' | 'denied' | 'expired'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lender_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own requests" ON lender_requests FOR ALL USING (auth.uid() = user_id);
```

**Note:** This table is superseded by `reports` table in v2 (shareable links replace lender requests). Keep for v1 compatibility.

#### `waitlist`
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,                    -- 'landing' | 'referral' | 'partnership'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS: Public insert for landing page
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON waitlist FOR INSERT WITH CHECK (true);
```

### 2.2 New Tables (v2.0 Schema — To Be Created)

#### `ledger_entries` (Replaces `income_records`)
```sql
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform Platform NOT NULL,
  gross_amount DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2),           -- after platform fees
  currency TEXT DEFAULT 'USD',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payment_date DATE,
  category TEXT,                      -- 'rides' | 'delivery' | 'freelance' | 'flex'
  platform_ref_id TEXT,               -- platform's payment ID for deduplication
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'api',          -- 'api' | 'manual' | 'csv_upload'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_ref_id)
);

ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ledger" ON ledger_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "API can insert ledger entries" ON ledger_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for query performance
CREATE INDEX idx_ledger_user_period ON ledger_entries(user_id, period_start DESC);
CREATE INDEX idx_ledger_platform ON ledger_entries(user_id, platform);

-- Materialized view for dashboard performance
CREATE MATERIALIZED VIEW ledger_monthly AS
SELECT
  user_id,
  platform,
  DATE_TRUNC('month', period_start) AS month,
  SUM(gross_amount) AS gross_total,
  SUM(net_amount) AS net_total,
  COUNT(*) AS payment_count
FROM ledger_entries
GROUP BY user_id, platform, DATE_TRUNC('month', period_start);

-- Refresh strategy: cron job every 6 hours or on-demand after large ingestion
CREATE INDEX idx_ledger_monthly_user ON ledger_monthly(user_id, month DESC);
```

**TypeScript Interface:**
```typescript
type LedgerSource = 'api' | 'manual' | 'csv_upload';
type EarningsCategory = 'rides' | 'delivery' | 'freelance' | 'flex' | 'other';

interface LedgerEntry {
  id: string;
  user_id: string;
  platform: Platform;
  gross_amount: number;
  net_amount: number | null;
  currency: string;
  period_start: string;        // YYYY-MM-DD
  period_end: string;
  payment_date: string | null;
  category: EarningsCategory | null;
  platform_ref_id: string | null;
  verified_at: string;
  source: LedgerSource;
  created_at: string;
}

interface LedgerMonthly {
  user_id: string;
  platform: Platform;
  month: string;               // YYYY-MM-01
  gross_total: number;
  net_total: number;
  payment_count: number;
}
```

#### `reports`
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,          -- 'standard_pdf' | 'quick_link' | 'api_response'
  score_snapshot JSONB NOT NULL,      -- CreditScore object at generation time
  ledger_snapshot JSONB NOT NULL,     -- LedgerSummary used in report
  pdf_path TEXT,                      -- Supabase Storage path
  share_token TEXT UNIQUE,            -- random 32-char token for public URL
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reports" ON reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view via token" ON reports FOR SELECT USING (
  share_token IS NOT NULL AND NOT is_revoked AND (expires_at IS NULL OR expires_at > NOW())
);

-- Generate share_token automatically
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(24), 'base64');
END;
$$ LANGUAGE plpgsql;

ALTER TABLE reports ALTER COLUMN share_token SET DEFAULT generate_share_token();
```

**TypeScript Interface:**
```typescript
type ReportType = 'standard_pdf' | 'quick_link' | 'api_response';

interface Report {
  id: string;
  user_id: string;
  report_type: ReportType;
  score_snapshot: CreditScore;
  ledger_snapshot: LedgerSummary;    // defined below
  pdf_path: string | null;
  share_token: string | null;
  expires_at: string | null;
  access_count: number;
  is_revoked: boolean;
  created_at: string;
}

interface LedgerSummary {
  total_platforms: number;
  avg_monthly_income: number;
  total_career_earnings: number;
  earliest_income_date: string;
  latest_income_date: string;
  monthly_breakdown: LedgerMonthly[];
}
```

#### `report_views`
```sql
CREATE TABLE report_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  viewer_email TEXT,
  viewer_ip TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE report_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Report owners view access logs" ON report_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM reports WHERE reports.id = report_views.report_id AND reports.user_id = auth.uid())
);

-- Trigger: Increment access_count on insert
CREATE OR REPLACE FUNCTION increment_report_access_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reports SET access_count = access_count + 1 WHERE id = NEW.report_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_report_view
  AFTER INSERT ON report_views
  FOR EACH ROW EXECUTE FUNCTION increment_report_access_count();
```

#### `lender_orgs` (Phase 2 — B2B)
```sql
CREATE TABLE lender_orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,                        -- email domain for auto-verification
  verified BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'starter',        -- 'starter' | 'growth' | 'enterprise'
  monthly_quota INTEGER DEFAULT 50,
  verifications_used INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS: Admin-only access via service role
ALTER TABLE lender_orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON lender_orgs FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

**TypeScript Interface:**
```typescript
type LenderPlan = 'starter' | 'growth' | 'enterprise';

interface LenderOrg {
  id: string;
  name: string;
  domain: string | null;
  verified: boolean;
  plan: LenderPlan;
  monthly_quota: number;
  verifications_used: number;
  stripe_customer_id: string | null;
  api_key: string;
  created_at: string;
  updated_at: string;
}
```

#### `passports`
```sql
CREATE TABLE passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  wallet_address TEXT UNIQUE,
  token_id TEXT,                      -- on-chain token ID (keccak256 hash)
  chain TEXT DEFAULT 'base',
  contract_address TEXT DEFAULT '0x...', -- deployed contract address
  minted_at TIMESTAMPTZ,
  last_attested_at TIMESTAMPTZ,
  attestation_count INTEGER DEFAULT 0,
  current_score INTEGER,
  score_tier ScoreTier,
  is_public BOOLEAN DEFAULT TRUE,     -- worker controls visibility
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE passports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own passport" ON passports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public passports" ON passports FOR SELECT USING (is_public = TRUE);

-- Index for public lookup by wallet
CREATE INDEX idx_passports_wallet ON passports(wallet_address) WHERE is_public = TRUE;
```

**TypeScript Interface:**
```typescript
interface Passport {
  id: string;
  user_id: string;
  wallet_address: string | null;
  token_id: string | null;
  chain: 'base' | 'base-sepolia';
  contract_address: string;
  minted_at: string | null;
  last_attested_at: string | null;
  attestation_count: number;
  current_score: number | null;
  score_tier: ScoreTier | null;
  is_public: boolean;
  created_at: string;
}
```

#### `attestation_history`
```sql
CREATE TABLE attestation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id UUID REFERENCES passports(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  income_tier TEXT,                   -- 'high' | 'mid' | 'emerging'
  data_hash TEXT NOT NULL,            -- keccak256 of report snapshot
  tx_hash TEXT,                       -- Base L2 transaction hash
  block_number BIGINT,
  attested_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE attestation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Passport owners view attestations" ON attestation_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM passports WHERE passports.id = attestation_history.passport_id AND passports.user_id = auth.uid())
);
CREATE POLICY "Anyone can view public attestations" ON attestation_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM passports WHERE passports.id = attestation_history.passport_id AND passports.is_public = TRUE)
);

-- Index for on-chain lookup
CREATE INDEX idx_attestations_tx ON attestation_history(tx_hash);
```

### 2.3 Supabase Storage Buckets

```typescript
// Created via Supabase dashboard or CLI
const STORAGE_BUCKETS = {
  reports: {
    name: 'reports',
    public: false,           // Access via signed URLs only
    fileSizeLimit: 10 * 1024 * 1024,  // 10MB
    allowedMimeTypes: ['application/pdf']
  },
  avatars: {
    name: 'avatars',
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,   // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
};

// RLS Policies for reports bucket:
// - Users can upload to own folder: `{user_id}/reports/*.pdf`
// - Users can download own reports
// - Public can download via signed URL (time-limited, generated by API route)
```

---

## PART III — BUILD SEQUENCE & PHASE GATES

### 3.1 Phase 0 — Foundation Completion (Weeks 1–4)

**Objective:** Close all gaps in existing infrastructure. Exit criteria: 10 real users can sign up, connect platform, see income, generate report, and pay.

#### Week 1: Argyle Integration + Database Migration

**Tasks:**
1. Install Argyle SDK: `npm install @argyle/argyle-link-ts`
2. Run `db/migration-v2.sql` to create new tables
3. Implement Argyle Link in onboarding flow:

```typescript
// src/app/(auth)/onboarding/page.tsx
'use client';

import { ArgyleLink } from '@argyle/argyle-link-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  const handleSuccess = async (accountId: string, userId: string) => {
    // Store connection
    await fetch('/api/platform/connect', {
      method: 'POST',
      body: JSON.stringify({ 
        platform: 'uber', // detected from Argyle
        argyle_account_id: accountId 
      })
    });
    
    router.push('/dashboard');
  };

  return (
    <ArgyleLink
      userToken={/* fetch from Argyle */}
      onAccountConnected={handleSuccess}
      onClose={() => router.push('/dashboard')}
    />
  );
}
```

4. Create `/api/ingest/argyle/webhook/route.ts`:

```typescript
// Argyle webhook handler
export async function POST(req: Request) {
  const event = await req.json();
  
  if (event.name === 'accounts.added') {
    // Fetch income data from Argyle
    const income = await argyle.getIncome(event.data.account_id);
    
    // Upsert to ledger_entries
    await supabase.from('ledger_entries').upsert({
      user_id: event.user_id,
      platform: income.platform,
      gross_amount: income.amount,
      period_start: income.period_start,
      period_end: income.period_end,
      platform_ref_id: income.id,
      source: 'api'
    });
    
    // Trigger score recalculation
    await recalculateScore(event.user_id);
  }
  
  return new Response('OK');
}
```

**Exit Criteria:**
- [ ] User can click "Connect Uber" → Argyle modal opens → OAuth succeeds → webhook fires → `ledger_entries` populated
- [ ] Verified with 3 real Uber/DoorDash/Upwork accounts

#### Week 2: Scoring Engine Integration

**Tasks:**
1. Connect `scoring-engine.ts` to real `ledger_entries` data:

```typescript
// src/lib/scoring-engine.ts
import { createServerClient } from './supabase-server';

export async function calculateKrostScore(userId: string): Promise<CreditScore> {
  const supabase = createServerClient();
  
  // Fetch ledger data
  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('user_id', userId)
    .order('period_start', { ascending: false });
  
  // Calculate inputs
  const inputs: KrostScoreInputs = {
    avgMonthlyIncome: calculateAvgIncome(entries),
    platformTenureMonths: calculateTenure(entries),
    incomeVolatility: calculateVolatility(entries),
    platformDiversity: countPlatforms(entries),
    earningConsistency: calculateConsistency(entries),
    incomeTrajectory: calculateTrajectory(entries),
    taxCompliance: checkTaxCompliance(userId), // checks if 1099-K filed
    crossPlatformGrowth: calculateGrowth(entries),
    ledgerDepth: Math.min(entries.length, 36)
  };
  
  // Compute score (existing algorithm)
  const score = computeScore(inputs);
  
  // Store in credit_scores table
  const { data: creditScore } = await supabase
    .from('credit_scores')
    .insert({
      user_id: userId,
      score: score.total,
      score_tier: score.tier,
      factors: score.factors,
      income_snapshot: inputs
    })
    .select()
    .single();
  
  return creditScore;
}
```

2. Create API route `/api/score/current/route.ts`
3. Build dashboard widget showing score + tier

**Exit Criteria:**
- [ ] Score calculates correctly for 10 test users with varied income patterns
- [ ] Dashboard displays live score, updates when new income syncs
- [ ] Score history chart shows progression over time

#### Week 3: PDF Report Generation

**Tasks:**
1. Install react-pdf: `npm install @react-pdf/renderer`
2. Create `src/lib/report-generator.tsx`:

```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20 },
  section: { margin: 10 }
});

export function KrostReport({ worker, score, ledger }: ReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cover */}
        <View style={styles.section}>
          <Text style={styles.header}>krostioIncome Verification Report</Text>
          <Text>Worker: {worker.full_name}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>
        
        {/* Executive Summary */}
        <View style={styles.section}>
          <Text>krostioScore: {score.score}</Text>
          <Text>Tier: {score.score_tier}</Text>
          <Text>Annualized Income: ${ledger.avg_monthly_income * 12}</Text>
        </View>
        
        {/* Income History Table */}
        {/* ... 10 sections total per PRD Part III spec ... */}
      </Page>
    </Document>
  );
}
```

3. Create `/api/reports/generate/route.ts`:

```typescript
export async function POST(req: Request) {
  const { reportType, expiryDays } = await req.json();
  
  // Fetch current score + ledger
  const score = await getCurrentScore(userId);
  const ledger = await getLedgerSummary(userId);
  
  // Generate PDF
  const pdfBuffer = await renderToBuffer(
    <KrostReport worker={user} score={score} ledger={ledger} />
  );
  
  // Upload to Supabase Storage
  const fileName = `${userId}/reports/${reportId}.pdf`;
  await supabase.storage
    .from('reports')
    .upload(fileName, pdfBuffer, { contentType: 'application/pdf' });
  
  // Create report record with shareable token
  const { data: report } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      report_type: reportType,
      pdf_path: fileName,
      expires_at: expiryDays ? addDays(new Date(), expiryDays) : null
    })
    .select()
    .single();
  
  return Response.json({ 
    reportId: report.id,
    shareUrl: `/reports/view/${report.share_token}` 
  });
}
```

**Exit Criteria:**
- [ ] User clicks "Generate Report" → PDF generates in <5 seconds → download link appears
- [ ] PDF contains all 10 sections from PRD v2 spec
- [ ] Shareable link works in incognito browser
- [ ] Email-gate captures viewer email before showing report

#### Week 4: Stripe Billing + Dashboard Polish

**Tasks:**
1. Wire Stripe checkout to plan gates:

```typescript
// src/app/(dashboard)/billing/page.tsx
import { stripe } from '@/lib/stripe';

export default async function BillingPage() {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: PRICE_IDS.pro_monthly, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing`
  });
  
  return <CheckoutButton sessionUrl={session.url} />;
}
```

2. Implement plan gates:
   - Free: 1 platform, summary only, no PDF
   - Pro: 5 platforms, unlimited reports, Passport minting

3. Build functional dashboard:
   - Score widget (live-updating via Real-time)
   - Ledger summary (monthly rollup)
   - Platform connection cards
   - CTA to upgrade if on Free

**Exit Criteria:**
- [ ] Free user cannot connect 2nd platform until upgrading
- [ ] Pro user can generate unlimited reports
- [ ] Stripe webhook updates `profiles` table with subscription status
- [ ] Dashboard shows accurate data for 10 real users

**Phase 0 Exit Gate:** Ship to 10 beta users (friends, gig worker communities). Collect feedback. Fix critical bugs. **Do not proceed to Phase 1 until this works end-to-end.**

---

### 3.2 Phase 1 — Four-Pillar MVP (Weeks 5–16)

**Objective:** Build each pillar to its first complete, usable state. Each pillar is a mini-project with its own acceptance criteria.

#### Pillar 1: krostioScore (Weeks 5–6)

**Features to Build:**
1. Add 3 new scoring factors:
   - `tax_compliance`: Check if 1099-K filed (binary +25 pts or 0)
   - `cross_platform_growth`: Count platforms added over time (+20 pts max)
   - `ledger_depth`: Months of verified history (+15 pts for 36+ months)

2. Score history chart (all-time progression)
3. Factor breakdown UI showing contribution of each factor
4. Score improvement tips:
   ```typescript
   function generateTips(score: CreditScore): string[] {
     const tips = [];
     if (score.factors.diversity_score < 30) {
       tips.push("Connect a second platform to increase your score by ~35 points");
     }
     if (score.factors.consistency_score < 40) {
       tips.push("Work consistently each month to improve your consistency score");
     }
     return tips;
   }
   ```

**Acceptance Criteria:**
- [ ] Score updates automatically when new income syncs
- [ ] Factor breakdown visualized as bar chart or radial graph
- [ ] Tips personalized based on score factors
- [ ] Score history persisted (new row in `credit_scores` per recalculation)

#### Pillar 2: krostioLedger (Weeks 5–8)

**Features to Build:**
1. Multi-platform connection (Pro: up to 5)
2. Unified timeline view (all platforms, chronological)
3. Monthly rollup table (by platform + combined)
4. CSV export:
   ```typescript
   export async function GET(req: Request) {
     const entries = await getAllLedgerEntries(userId);
     const csv = Papa.unparse(entries);
     return new Response(csv, {
       headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=ledger.csv' }
     });
   }
   ```

5. Tax estimation sidebar:
   ```typescript
   // Self-employment tax ~15.3% of net income
   const estimatedQuarterlyTax = (ytdNetIncome * 0.153) / 4;
   ```

6. Anomaly alerts:
   ```typescript
   // If income drops >40% month-over-month, flag
   if (thisMonth.total < lastMonth.total * 0.6) {
     await createAlert({ type: 'income_drop', severity: 'warning' });
   }
   ```

**Acceptance Criteria:**
- [ ] Worker can connect 5 platforms simultaneously
- [ ] Timeline shows all income across platforms in single feed
- [ ] CSV export contains all fields from `ledger_entries`
- [ ] Tax estimate updates in real-time as new income syncs
- [ ] Anomaly alert appears on dashboard when triggered

#### Pillar 3: krostioVerifier (Weeks 7–10)

**Features to Build:**
1. Standard PDF Report (10 sections from PRD v2 Part III)
2. Quick Verification Link:
   - Expiry options: 7 days / 30 days / one-time access
   - Email-gate: viewer enters email before accessing
   - Access log: who viewed, when
   - Revocation: worker can kill link anytime

3. Report history dashboard
4. Lender portal MVP (Phase 2 feature, build in Week 10):
   - Lender creates account with email
   - Receives shared reports from workers
   - Cannot search/browse; only sees what's explicitly shared

**Implementation:**
```typescript
// src/app/reports/view/[token]/page.tsx
export default async function PublicReportView({ params }: { params: { token: string } }) {
  const report = await getReportByToken(params.token);
  
  if (!report || report.is_revoked) {
    return <ErrorPage message="Report not found or has been revoked" />;
  }
  
  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    return <ErrorPage message="This report has expired" />;
  }
  
  // Email-gate
  const viewerEmail = await getViewerEmail(); // from cookie or form
  if (!viewerEmail) {
    return <EmailGateForm reportToken={params.token} />;
  }
  
  // Log access
  await logReportView(report.id, viewerEmail);
  
  // Show report
  return <ReportViewer report={report} />;
}
```

**Acceptance Criteria:**
- [ ] PDF contains all 10 sections with real data
- [ ] Shareable link works in incognito, expires correctly
- [ ] Email-gate captures viewer email before access
- [ ] Access log shows IP, timestamp, user agent
- [ ] Revoke button immediately invalidates link
- [ ] Lender can sign up, receive shared reports

#### Pillar 4: krostioPassport (Weeks 12–16)

**Features to Build:**
1. Smart contract deployment to Base mainnet
2. Wallet connection (MetaMask) OR Account Abstraction (ERC-4337)
3. Gasless mint (Krostio pays gas)
4. Public Passport page: `krostio.app/passport/[token]`
5. Attestation history viewer
6. Score update → on-chain sync (monthly for Pro subscribers)
7. Privacy controls (worker chooses visibility)

**Smart Contract (Updated from PRD v2 Appendix):**
```solidity
// blockchain/contracts/KrostPassport.sol
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KrostPassport is ERC721, Ownable {
    struct PassportData {
        uint256 krostScore;
        uint256 annualizedIncome;
        uint256 platformCount;
        uint256 tenureMonths;
        string scoreTier;
        uint256 lastUpdated;
        uint256 verificationCount;
        bytes32 dataHash;
    }
    
    mapping(uint256 => PassportData) public passports;
    mapping(address => uint256) public workerToPassport;
    
    constructor() ERC721("krostioPassport", "KROST") Ownable(msg.sender) {}
    
    function transferFrom(address, address, uint256) public pure override {
        revert("krostioPassport is soul-bound and non-transferable");
    }
    
    function mintPassport(address worker, PassportData calldata data) 
        external onlyOwner returns (uint256) {
        require(workerToPassport[worker] == 0, "Passport already exists");
        uint256 tokenId = uint256(keccak256(abi.encodePacked(worker, block.timestamp)));
        _safeMint(worker, tokenId);
        passports[tokenId] = data;
        workerToPassport[worker] = tokenId;
        emit PassportMinted(worker, tokenId, data.krostScore);
        return tokenId;
    }
    
    function updatePassport(uint256 tokenId, PassportData calldata newData) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Passport does not exist");
        passports[tokenId] = newData;
        emit PassportUpdated(tokenId, newData.krostScore, block.timestamp);
    }
    
    event PassportMinted(address indexed worker, uint256 indexed tokenId, uint256 krostScore);
    event PassportUpdated(uint256 indexed tokenId, uint256 newScore, uint256 timestamp);
}
```

**Minting Flow:**
```typescript
// src/app/api/passport/mint/route.ts
export async function POST(req: Request) {
  const { walletAddress } = await req.json();
  
  // Check eligibility (score ≥580)
  const score = await getCurrentScore(userId);
  if (score.score < 580) {
    return Response.json({ error: 'Score must be ≥580 to mint Passport' }, { status: 400 });
  }
  
  // Check if already minted
  const existing = await supabase.from('passports').select('*').eq('user_id', userId).single();
  if (existing.data) {
    return Response.json({ error: 'Passport already minted' }, { status: 400 });
  }
  
  // Prepare passport data
  const ledger = await getLedgerSummary(userId);
  const passportData = {
    krostScore: score.score,
    annualizedIncome: ledger.avg_monthly_income * 12,
    platformCount: ledger.total_platforms,
    tenureMonths: calculateTenure(ledger),
    scoreTier: score.score_tier,
    lastUpdated: Math.floor(Date.now() / 1000),
    verificationCount: 1,
    dataHash: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(score)))
  };
  
  // Mint on-chain (gasless)
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);
  const tx = await contract.mintPassport(walletAddress, passportData);
  await tx.wait();
  
  // Store in DB
  await supabase.from('passports').insert({
    user_id: userId,
    wallet_address: walletAddress,
    token_id: tx.events[0].args.tokenId.toString(),
    contract_address: CONTRACT_ADDRESS,
    minted_at: new Date(),
    current_score: score.score,
    score_tier: score.score_tier
  });
  
  return Response.json({ txHash: tx.hash });
}
```

**Acceptance Criteria:**
- [ ] Worker with score ≥580 can mint Passport (gasless)
- [ ] Public Passport page shows score tier, income tier, career tenure (no exact amounts unless worker enables)
- [ ] Attestation history displays all on-chain updates
- [ ] Privacy toggle works: turning off public visibility hides Passport page
- [ ] Score update button triggers on-chain transaction, logs in `attestation_history`

**Phase 1 Exit Gate:** All four pillars functional. 100+ workers using the platform. At least 10 Passports minted. Collect feedback. Refine UX. **Do not proceed to Phase 2 until retention is >60% after 30 days.**

---

### 3.3 Phase 2 — B2B Monetization (Months 5–9)

**Objective:** Launch lender API, build directory, unlock B2B revenue.

#### Lender Portal (Full) — Months 5–6

**Features:**
1. Lender org accounts with domain verification
2. Bulk verification: lender uploads CSV of worker emails → Krostio sends consent requests → aggregated results
3. API key + OpenAPI documentation
4. Webhook: `krost.report.updated` fires when score changes >5 points
5. Custom scoring parameters (lender adjusts factor weights)

**API Design:**
```typescript
// Lender API endpoint
// GET /api/lender/api/score?worker_email=user@example.com
// Headers: Authorization: Bearer {lender_api_key}

export async function GET(req: Request) {
  const apiKey = req.headers.get('authorization')?.replace('Bearer ', '');
  const lender = await validateApiKey(apiKey);
  
  if (!lender) {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Check quota
  if (lender.verifications_used >= lender.monthly_quota) {
    return Response.json({ error: 'Quota exceeded' }, { status: 429 });
  }
  
  const workerEmail = req.nextUrl.searchParams.get('worker_email');
  const worker = await getUserByEmail(workerEmail);
  
  // Check consent (worker must have shared report with this lender)
  const consent = await checkConsent(worker.id, lender.id);
  if (!consent) {
    return Response.json({ error: 'No consent from worker' }, { status: 403 });
  }
  
  // Increment usage
  await incrementVerificationCount(lender.id);
  
  // Return score
  const score = await getCurrentScore(worker.id);
  return Response.json({
    krost_score: score.score,
    score_tier: score.score_tier,
    annualized_income: score.income_snapshot.avgMonthlyIncome * 12,
    data_freshness: score.created_at,
    verification_id: generateVerificationId()
  });
}
```

**Pricing:**
- Starter: $99/mo (50 verifications)
- Growth: $199/mo (150 verifications)
- Enterprise: Custom (unlimited + SLA)

#### Lender Directory for Workers — Month 7

**Features:**
1. Directory of lenders accepting krostioreports
2. Filterable by loan type (auto, personal, mortgage, business, rent)
3. Worker clicks "Find a Lender" → pre-filtered by krostioScore tier
4. Referral tracking: when worker applies and loan funds, Krostio earns $50–$200

**Implementation:**
```typescript
// src/app/(dashboard)/lenders/page.tsx
export default async function LendersDirectory() {
  const score = await getCurrentScore(userId);
  
  // Filter lenders by score tier
  const lenders = await supabase
    .from('lender_directory')
    .select('*')
    .lte('min_score_required', score.score)
    .order('loan_type');
  
  return (
    <div>
      <h1>Lenders That Accept Your krostioScore</h1>
      <p>Your score: {score.score} ({score.score_tier})</p>
      
      {lenders.map(lender => (
        <LenderCard
          key={lender.id}
          lender={lender}
          onApply={() => trackReferral(lender.id, userId)}
        />
      ))}
    </div>
  );
}
```

#### Gig Platform B2B2C — Months 8–9

**Features:**
1. White-label Passport API for gig platforms
2. Platform pays per-worker activation; worker gets free Passport
3. Example: "Earn your krostioPassport as an Uber Pro Driver"

**Partnership Contract:**
- Platform pays $5 per activated worker
- Krostio provides embeddable widget for platform app
- Worker gets free Pro subscription for duration of platform partnership

**Phase 2 Exit Gate:** 30 lender org accounts. $10K+ MRR from B2B. 10 referral-driven loans funded. Refine lender onboarding. **Validate unit economics before scaling.**

---

### 3.4 Phase 3 — Protocol Layer & Global Expansion (Months 9–18)

**Objective:** Open-source attestation standard, EU launch, DeFi integration.

#### Krostio Open Protocol — Months 9–12

**Features:**
1. Open-source the `KrostPassport.sol` contract as ERC-7507 (Soul-Bound Token standard)
2. Publish attestation schema on Ethereum Attestation Service (EAS)
3. Build MISMO-compatible data format for mortgage industry
4. Allow third-party lenders to query Passports on-chain without Krostio app

**Technical Spec:**
```solidity
// Open protocol: Any lender can query on-chain
interface IKrostPassport {
    function getPassportScore(address worker) external view returns (uint256 score, string memory tier);
    function verifyAttestation(uint256 tokenId, bytes32 dataHash) external view returns (bool);
}
```

#### EU Expansion — Months 12–15

**Regulatory Context:**
- EU Platform Work Directive implemented Dec 2026
- 43M gig workers gain employee-like rights
- Open Banking (PSD2) mandates data portability

**Localization:**
1. UK: TrueLayer replaces Argyle for Open Banking data
2. EU: GDPR-compliant DPA templates
3. Multi-language: English, German, French, Spanish
4. Currency: EUR support in `ledger_entries`

**Technical Changes:**
```typescript
// Add EU data providers
const DATA_PROVIDERS = {
  US: 'argyle',
  UK: 'truelayer',
  EU: 'tink' // or similar PSD2 aggregator
};

// GDPR compliance
export async function deleteUserData(userId: string) {
  // Right to erasure: delete all user data
  await supabase.from('ledger_entries').delete().eq('user_id', userId);
  await supabase.from('credit_scores').delete().eq('user_id', userId);
  await supabase.from('reports').delete().eq('user_id', userId);
  // ... etc
}
```

#### DeFi Integration — Months 15–18

**Features:**
1. krostioPassport as collateral for undercollateralized loans
2. Integration with Goldfinch, Maple Finance, or similar credit protocols
3. On-chain score verification without centralized API

**Example Integration:**
```solidity
// DeFi protocol checks krostioScore on-chain
contract GigWorkerLending {
    IKrostPassport public krostPassport;
    
    function applyForLoan(uint256 amount) external {
        (uint256 score, ) = krostPassport.getPassportScore(msg.sender);
        require(score >= 720, "Insufficient krostioScore");
        
        // Issue undercollateralized loan
        _issueLoan(msg.sender, amount);
    }
}
```

**Phase 3 Exit Gate:** Open protocol adopted by 3+ external lenders. EU launch with 1,000+ users. DeFi integration live on 1 protocol. **Evaluate product-market fit in EU before further geographic expansion.**

---

## PART IV — TECHNICAL CONSTRAINTS & CONVENTIONS

### 4.1 Next.js 16 Specific Patterns

**Critical:** This is Next.js 16 App Router. APIs differ from Next.js 14 and older documentation. Always check `/node_modules/next/dist/docs/` before implementing.

**Server Components vs Client Components:**
```typescript
// DEFAULT: Server Component (can fetch data, no useState/useEffect)
export default async function DashboardPage() {
  const data = await fetchData(); // This runs on server
  return <View data={data} />;
}

// CLIENT: Mark with 'use client' (can use hooks, browser APIs)
'use client';
export default function InteractiveWidget() {
  const [state, setState] = useState(0);
  return <button onClick={() => setState(s => s + 1)}>{state}</button>;
}
```

**Route Handlers (API Routes):**
```typescript
// src/app/api/example/route.ts
export async function GET(request: Request) {
  // Access URL params
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Return JSON
  return Response.json({ data: 'example' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return new Response('Created', { status: 201 });
}
```

**Dynamic Routes:**
```typescript
// src/app/reports/[id]/page.tsx
export default async function ReportPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  return <ReportView report={report} />;
}
```

### 4.2 Supabase Client Patterns (Three Patterns, DO NOT MIX)

```typescript
// Pattern 1: Browser (Client Components)
// src/lib/supabase-browser.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Usage in Client Component
'use client';
import { createClient } from '@/lib/supabase-browser';

export function ClientComponent() {
  const supabase = createClient();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    supabase.from('table').select('*').then(setData);
  }, []);
}
```

```typescript
// Pattern 2: Server (Server Components, Route Handlers)
// src/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.set({ name, value: '', ...options })
      }
    }
  );
}

// Usage in Server Component
import { createClient } from '@/lib/supabase-server';

export default async function ServerComponent() {
  const supabase = await createClient();
  const { data } = await supabase.from('table').select('*');
  return <div>{data}</div>;
}
```

```typescript
// Pattern 3: Middleware
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options });
        }
      }
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Redirect logic
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/billing/:path*']
};
```

**CRITICAL:** Never mix patterns. Client Components use Pattern 1. Server Components/Routes use Pattern 2. Middleware uses Pattern 3.

### 4.3 Tailwind v4 Configuration

**No `tailwind.config.js` exists.** All configuration is in `src/app/globals.css` via `@theme` directive.

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors (Mastercard-inspired from DESIGN.md) */
  --color-canvas: #F3F0EE;
  --color-ink: #141413;
  --color-signal: #CF4500;
  --color-link-blue: #3860BE;
  --color-clay-brown: #9A3A0A;
  --color-light-signal: #F37338;
  
  /* Typography */
  --font-sans: 'Sofia Sans', system-ui, sans-serif;
  --font-weight-body: 450;
  --font-weight-headline: 500;
  --font-weight-eyebrow: 700;
  
  /* Radii */
  --radius-pill: 999px;
  --radius-stadium: 40px;
  
  /* Spacing (8px grid) */
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 32px;
  --spacing-xl: 48px;
}

/* Custom utilities */
@layer utilities {
  .btn-ink {
    @apply bg-ink text-canvas rounded-[20px] px-6 py-3 font-medium;
  }
  
  .btn-outline {
    @apply border-2 border-ink text-ink rounded-[20px] px-6 py-3 font-medium;
  }
  
  .btn-signal {
    @apply bg-signal text-canvas rounded-[20px] px-6 py-3 font-medium;
  }
  
  .card-stadium {
    @apply bg-white rounded-[40px] shadow-sm p-6;
  }
}
```

**Usage:**
```tsx
<button className="btn-ink">Primary Action</button>
<div className="card-stadium">Content</div>
<h1 className="text-[32px] font-[500] tracking-[-0.02em]">Headline</h1>
```

### 4.4 Design System Enforcement (DESIGN.md)

**Every new UI component MUST follow DESIGN.md conventions:**

1. **Color Palette:**
   - Canvas (backgrounds): `#F3F0EE` (never pure white)
   - Text primary: `#141413` (ink black)
   - CTA primary: ink background + canvas text
   - Signal/consent: `#CF4500` (only for consent forms, legal actions)

2. **Pillar-Specific Accents:**
   - Score: `#141413` (ink)
   - Ledger: `#3860BE` (link blue)
   - Verifier: `#9A3A0A` (clay brown)
   - Passport: `#F37338` (light signal orange)

3. **Typography:**
   - Font: Sofia Sans (Google Fonts fallback)
   - Headlines: weight 500, -2% letter-spacing
   - Body: weight 450
   - Eyebrows: 14px, weight 700, +4% tracking, uppercase, preceded by `•`

4. **Component Radii:**
   - Cards: 40px (stadium) or 999px (full pill)
   - Buttons: 20px (pill)
   - Never use 8px or 16px generic radii

5. **Images:**
   - Circular portrait masks (50% radius)
   - White satellite CTAs docked at bottom-right

**Enforcement:** Any UI not following DESIGN.md will be flagged in code review. Design consistency is non-negotiable.

### 4.5 Testing Philosophy

**Current State:** No test framework configured (per AGENTS.md).

**Phase 1 Addition:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Test Coverage Requirements:**
1. **Unit tests (Vitest):** `scoring-engine.ts` (all 9 factors)
2. **E2E tests (Playwright):** Critical paths:
   - Signup → connect → score → report → share
   - Billing upgrade flow
   - Passport minting (on testnet)

**Test File Locations:**
```
src/
├── lib/
│   ├── scoring-engine.ts
│   └── scoring-engine.test.ts  # Unit tests
└── __tests__/
    ├── e2e/
    │   ├── onboarding.spec.ts
    │   ├── reporting.spec.ts
    │   └── passport.spec.ts
```

**Run Tests:**
```bash
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright E2E
```

---

## PART V — INTEGRATION SPECIFICATIONS

### 5.1 Argyle Integration (Detailed)

**Argyle Documentation:** `https://docs.argyle.com`

**SDK Installation:**
```bash
npm install @argyle/argyle-link-ts
```

**User Flow:**
1. User clicks "Connect Platform" in onboarding
2. Argyle Link modal opens (OAuth flow)
3. User authenticates with platform (Uber, DoorDash, etc.)
4. Argyle webhook fires → `/api/ingest/argyle/webhook`
5. Backend fetches income data from Argyle API
6. Data normalized to `ledger_entries` schema

**Argyle Link Component:**
```typescript
// src/components/ArgyleConnect.tsx
'use client';

import { ArgyleLink } from '@argyle/argyle-link-react';
import { useState } from 'react';

export function ArgyleConnect() {
  const [userToken, setUserToken] = useState<string | null>(null);
  
  // Fetch user token from backend
  useEffect(() => {
    fetch('/api/argyle/token').then(r => r.json()).then(data => setUserToken(data.token));
  }, []);
  
  const handleSuccess = (accountId: string, userId: string, linkItemId: string) => {
    // Store connection in database
    fetch('/api/platform/connect', {
      method: 'POST',
      body: JSON.stringify({ 
        platform: linkItemId, // 'uber', 'doordash', etc.
        argyle_account_id: accountId 
      })
    });
  };
  
  if (!userToken) return <LoadingSpinner />;
  
  return (
    <ArgyleLink
      userToken={userToken}
      onAccountConnected={handleSuccess}
      onClose={() => router.push('/dashboard')}
    />
  );
}
```

**Backend Token Generation:**
```typescript
// src/app/api/argyle/token/route.ts
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Create Argyle user token
  const response = await fetch('https://api.argyle.com/v1/user-tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${ARGYLE_CLIENT_ID}:${ARGYLE_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_id: user.id })
  });
  
  const { token } = await response.json();
  return Response.json({ token });
}
```

**Webhook Handler:**
```typescript
// src/app/api/ingest/argyle/webhook/route.ts
export async function POST(req: Request) {
  const event = await req.json();
  
  // Verify webhook signature (CRITICAL for security)
  const signature = req.headers.get('x-argyle-signature');
  if (!verifyArgyleSignature(event, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  switch (event.name) {
    case 'accounts.added':
      await handleAccountAdded(event.data);
      break;
    case 'accounts.updated':
      await handleAccountUpdated(event.data);
      break;
    case 'accounts.removed':
      await handleAccountRemoved(event.data);
      break;
  }
  
  return new Response('OK');
}

async function handleAccountAdded(data: ArgyleAccountEvent) {
  // Fetch full account data
  const account = await argyle.getAccount(data.account_id);
  
  // Fetch payouts (income records)
  const payouts = await argyle.getPayouts(data.account_id);
  
  // Normalize to ledger_entries
  const entries = payouts.map(payout => ({
    user_id: data.user_id,
    platform: account.link_item as Platform,
    gross_amount: payout.gross_pay,
    net_amount: payout.net_pay,
    period_start: payout.pay_period_start,
    period_end: payout.pay_period_end,
    payment_date: payout.pay_date,
    platform_ref_id: payout.id,
    source: 'api' as const
  }));
  
  // Upsert (handles duplicates via UNIQUE constraint)
  await supabase.from('ledger_entries').upsert(entries);
  
  // Trigger score recalculation
  await recalculateScore(data.user_id);
}
```

**Cost Management:**
- Argyle charges per connection (exact pricing TBD — see market research recommendation)
- **Mitigation:** Free tier = CSV upload only; paid tiers unlock API
- Monitor `platform_connections` table; alert if approaching quota limits

### 5.2 Stripe Integration (Billing)

**Stripe Documentation:** `https://stripe.com/docs`

**Webhook Handler:**
```typescript
// src/app/api/stripe/webhook/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook Error', { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
  }
  
  return new Response('OK');
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan; // 'pro_monthly' | 'pro_annual'
  
  // Update user profile
  await supabase.from('profiles').update({
    subscription_status: 'active',
    subscription_plan: plan,
    stripe_customer_id: session.customer
  }).eq('id', userId);
}
```

**Pricing Configuration:**
```typescript
// src/lib/stripe-config.ts
export const PRICING = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['1 platform', 'Income summary', 'No PDF reports']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    stripe_price_id: 'price_...',  // One-time payment
    features: ['1 platform', '1 PDF report', '12-month history', '7-day shareable link']
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro',
    price: 19,
    stripe_price_id: 'price_...',  // Recurring monthly
    features: ['5 platforms', 'Unlimited reports', '24-month history', '30-day links', 'Passport']
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: 190,
    stripe_price_id: 'price_...',  // Recurring annual
    features: ['All Pro features', '2 months free', 'Priority support']
  }
};
```

### 5.3 Base L2 Blockchain Integration

**Hardhat Configuration:**
```typescript
// hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      chainId: 84532
    },
    base: {
      url: process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      chainId: 8453
    }
  }
};

export default config;
```

**Deployment Script:**
```typescript
// blockchain/scripts/deploy.ts
import { ethers } from 'hardhat';

async function main() {
  const KrostPassport = await ethers.getContractFactory('KrostPassport');
  const passport = await KrostPassport.deploy();
  await passport.waitForDeployment();
  
  console.log(`KrostPassport deployed to: ${await passport.getAddress()}`);
  
  // Store address in .env
  // CONTRACT_ADDRESS=0x...
}

main().catch(console.error);
```

**Backend Integration:**
```typescript
// src/lib/blockchain.ts
import { ethers } from 'ethers';
import KrostPassportABI from '../../blockchain/artifacts/contracts/KrostPassport.sol/KrostPassport.json';

const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

export const passport = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  KrostPassportABI.abi,
  adminWallet
);

export async function mintPassport(walletAddress: string, data: PassportData) {
  const tx = await passport.mintPassport(walletAddress, data);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function updatePassport(tokenId: string, data: PassportData) {
  const tx = await passport.updatePassport(tokenId, data);
  const receipt = await tx.wait();
  return receipt.hash;
}
```

**Gas Cost Monitoring:**
```typescript
// Monitor gas costs and alert if exceeds budget
export async function estimateMintCost(): Promise<number> {
  const gasEstimate = await passport.mintPassport.estimateGas(mockAddress, mockData);
  const gasPrice = await provider.getFeeData();
  const costInWei = gasEstimate * gasPrice.gasPrice!;
  const costInUSD = Number(ethers.formatEther(costInWei)) * ETH_PRICE_USD;
  
  if (costInUSD > 0.01) {
    // Alert: gas cost exceeds $0.01 threshold
    await sendAlert('High gas cost detected', { costInUSD });
  }
  
  return costInUSD;
}
```

### 5.4 Email Integration (Resend)

**Resend Documentation:** `https://resend.com/docs`

**Email Templates:**
```typescript
// src/lib/email-templates.tsx
import * as React from 'react';

export function WelcomeEmail({ userName }: { userName: string }) {
  return (
    <html>
      <body style={{ fontFamily: 'Sofia Sans, sans-serif' }}>
        <h1>Welcome to Krostio, {userName}!</h1>
        <p>Your financial identity platform is ready.</p>
        <a href="https://krostio.app/onboarding">Connect Your First Platform</a>
      </body>
    </html>
  );
}

export function ReportSharedEmail({ 
  recipientEmail, 
  shareUrl 
}: { 
  recipientEmail: string; 
  shareUrl: string; 
}) {
  return (
    <html>
      <body>
        <h1>Income Verification Report Shared With You</h1>
        <p>A gig worker has shared their krostioIncome Verification Report with you.</p>
        <a href={shareUrl}>View Report</a>
        <p>This link expires in 7 days.</p>
      </body>
    </html>
  );
}
```

**Sending Emails:**
```typescript
// src/lib/email.ts
import { Resend } from 'resend';
import { WelcomeEmail } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  await resend.emails.send({
    from: 'Krostio <hello@krostio.app>',
    to: userEmail,
    subject: 'Welcome to Krostio',
    react: <WelcomeEmail userName={userName} />
  });
}
```

---

## PART VI — APPENDICES

### A. Environment Variables (Complete `.env.example`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Argyle (Gig Data API)
ARGYLE_CLIENT_ID=xxx
ARGYLE_CLIENT_SECRET=xxx
ARGYLE_WEBHOOK_SECRET=xxx
ARGYLE_SANDBOX_MODE=true  # false in production

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...

# Base L2 (Blockchain)
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...  # Hot wallet for minting (low balance, rotate frequently)

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Resend (Email)
RESEND_API_KEY=re_...

# App Config
NEXT_PUBLIC_URL=https://krostio.app
NODE_ENV=development
```

### B. Git Workflow

```bash
# Branch naming
main              # Production (auto-deploys to Vercel)
develop           # Staging
feature/pillar-1  # Feature branches
fix/scoring-bug   # Bug fixes

# Commit messages
git commit -m "feat(score): add cross-platform growth factor"
git commit -m "fix(ledger): deduplicate Argyle webhook events"
git commit -m "docs(prd): update Phase 1 exit criteria"
```

### C. Deployment (Vercel)

**Automatic Deployments:**
- `main` → Production (`krostio.app`)
- `develop` → Preview (`develop.krostio.app`)
- Feature branches → Ephemeral preview URLs

**Environment Variables:**
Set in Vercel dashboard → Settings → Environment Variables. Match `.env.example` structure.

**Build Command:**
```bash
npm run build
```

**Output Directory:**
`.next`

### D. Error Handling Patterns

**API Routes:**
```typescript
export async function GET(req: Request) {
  try {
    const data = await fetchData();
    return Response.json({ data });
  } catch (error) {
    console.error('Error:', error);
    
    // Return user-friendly error
    return Response.json(
      { error: 'Failed to fetch data. Please try again.' },
      { status: 500 }
    );
  }
}
```

**Client Components:**
```typescript
'use client';

export function DataComponent() {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .catch(err => setError('Failed to load data'));
  }, []);
  
  if (error) return <ErrorState message={error} />;
  
  return <DataView />;
}
```

---

## DOCUMENT END

**This is the complete technical specification for Krostio Platform v3.0.** All prior PRDs (v1.0, v2.0) are superseded. This document is the single source of truth for all development work.

**Next Steps for Implementation:**
1. Read Part I (Architecture) to understand the complete system
2. Read Part II (Data Models) to understand database schema
3. Begin Phase 0 Week 1 tasks from Part III
4. Reference Part IV for technical constraints during implementation
5. Reference Part V for integration-specific code patterns

**Questions or Clarifications:**
Update `CLAUDE.md` to point to this PRD. All AI coding agents should reference this document when building Krostio features.

**Document Maintenance:**
As features are built and architecture evolves, update this PRD. Keep it synchronized with `AGENTS.md` and codebase reality. Never let documentation drift.

---

*Technical PRD v3.0 — May 2026 — Krostio Platform*
