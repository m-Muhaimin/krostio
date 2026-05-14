# Krost

Decentralized alternative credit scoring for gig workers. Connect your gig platforms (Uber, DoorDash, Fiverr, Upwork, etc.), get a verified credit score, and share it with lenders — you own your data on-chain.

## Architecture

```
Frontend (Next.js + Tailwind) → Supabase (Auth + DB) → Scoring Engine → Base L2 (Attestations)
                                                                ↓
                                                    Stripe (Billing)
```

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS 4
- **Auth & DB:** Supabase (PostgreSQL + Auth)
- **Payments:** Stripe
- **Blockchain:** Solidity on Base L2 (EVM, low gas)
- **Scoring:** Custom algorithm (income stability × platform diversity × tenure × trajectory)

## Quick Start

### 1. Clone & Install

```bash
cd X:/income-verifier
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `db/migration.sql` in Supabase SQL Editor
3. Copy your project URL and anon key
4. Enable Google Auth in Supabase Auth settings

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings
- Stripe test keys (from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys))
- Stripe price IDs (create products in Stripe dashboard)
- Wallet private key for contract deployment

### 4. Deploy Smart Contract

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network baseSepolia
```

Update `NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS` in `.env.local` with the deployed address.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
X:/income-verifier/
├── src/
│   ├── app/
│   │   ├── (auth)/login        # Sign in page
│   │   ├── (auth)/register     # Sign up page
│   │   ├── (dashboard)         # Dashboard (worker + lender)
│   │   ├── (marketing)/pricing # Pricing page
│   │   ├── api/                # API routes
│   │   ├── page.tsx            # Landing page
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   ├── lib/
│   │   ├── scoring-engine.ts   # Credit score calculation algorithm
│   │   ├── stripe.ts           # Stripe configuration
│   │   ├── supabase-browser.ts # Supabase client (browser)
│   │   ├── supabase-server.ts  # Supabase client (server)
│   │   └── utils.ts            # Shared utilities
│   ├── types/index.ts          # TypeScript types
│   └── middleware.ts           # Auth middleware
├── blockchain/
│   ├── contracts/IncomeAttestation.sol  # On-chain attestation contract
│   ├── scripts/deploy.js                # Deployment script
│   └── hardhat.config.js                # Hardhat configuration
├── db/
│   └── migration.sql           # Supabase/PostgreSQL schema
└── .env.example                # Environment template
```

## Pricing

| Plan | Price | Who |
|------|-------|-----|
| Gig Worker | $29/mo | Freelancers building their credit score |
| Gig Worker Multi | $49/mo | Workers with 4+ platforms |
| Lender | $99/mo | 50 verifications/mo |
| Lender Unlimited | $199/mo | Unlimited verifications + API |

14-day free trial on all plans.

## Scoring Algorithm

The credit score (300-850) factors:

1. **Average Monthly Income** (up to +80) — higher income = higher score
2. **Platform Tenure** (up to +70) — longer history = more reliable
3. **Income Volatility** (up to +60) — stable income = better score
4. **Platform Diversity** (up to +50) — multiple income streams = less risk
5. **Earning Consistency** (up to +50) — regular earnings = reliable
6. **Income Trajectory** (up to +40) — growing income = positive signal

Scores are attested on-chain via `IncomeAttestation.sol` on Base L2.

## Launch Checklist

- [ ] Supabase project created + migration applied
- [ ] Auth providers configured (email + Google)
- [ ] Stripe products created (gig_worker, lender)
- [ ] Smart contract deployed on Base Sepolia
- [ ] Environment variables configured
- [ ] Landing page content finalized
- [ ] Product Hunt listing prepared
- [ ] Reddit engagement posts drafted
- [ ] 5 beta testers onboarded

## License

MIT
