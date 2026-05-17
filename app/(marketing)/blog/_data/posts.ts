export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  description: string;
  excerpt: string;
  readingTime: string;
  body: string;
}

const posts: BlogPost[] = [
  {
    slug: 'gig-workers-denied-loans',
    title: 'Why Gig Workers Get Denied for Loans (And How to Fix It)',
    date: 'May 16, 2026',
    author: 'Krostio Marketing Team',
    tags: ['gig worker loan denied', '1099 income verification', 'freelancer credit score'],
    description:
      '64 million US gig workers are locked out of traditional lending because they don\'t have W-2s. Here\'s why it happens and how Krostio fixes it.',
    excerpt:
      'You earn $72,000 a year driving for Uber. You have a 740 credit score, low debt utilization, and a solid emergency fund. You walk into a bank to apply for a mortgage on a $280,000 home — well within your budget. The loan officer asks for your W-2.',
    readingTime: '6 min read',
    body: `You earn $72,000 a year driving for Uber. You have a 740 credit score, low debt utilization, and a solid emergency fund. You walk into a bank to apply for a mortgage on a $280,000 home — well within your budget.

The loan officer asks for your W-2.

You don't have one.

Application denied.

This scene plays out thousands of times every day across America. Not because gig workers can't afford the loan, but because the system wasn't built to verify their income.

## The W-2 Trap

Traditional lending runs on a simple premise: if you have a job, you have a W-2. If you have a W-2, a lender can verify your income with a single phone call to your employer's HR department. Done. Loan approved.

For the 64 million Americans who earn income through gig economy platforms — Uber, DoorDash, Lyft, Upwork, Instacart, Grubhub, Amazon Flex, Fiverr — this premise is broken. They have no employer to call for verification, no W-2 to staple to a loan application, and income spread across multiple platforms.

### By the Numbers

64 million US workers participate in the gig economy (Pew Research Center). 36% of gig workers were denied credit compared to 18% of traditional workers (Federal Reserve). Gig workers are 80% more likely to be denied a mortgage than W-2 employees (Urban Institute).

## Why Banks Say No

Traditional lenders operate on a risk model that defaults to "no" when information is incomplete. Without a W-2, a lender sees no proof of income stability, no employer relationship, and no standardized verification process.

**Real Story:** Maria juggles DoorDash and Instacart in Chicago. She earns $5,400/month on average — enough to afford a $1,600/month apartment. The leasing agent asked for pay stubs. Maria doesn't get pay stubs. She was denied.

## How Krostio Fixes It

1. **Connect Your Platforms** — Maria connects her DoorDash and Instacart accounts through secure OAuth.
2. **Krostio Computes Your Score** — The Krost Score analyzes 9 factors including income volume, consistency, platform diversity, and tenure.
3. **Generate a Shareable Report** — A PDF report and shareable link with verified earnings data.
4. **Share with Any Lender** — Maria sends her Krostio Verifier link to the apartment leasing agent.

## What This Means for Gig Workers

The lending system wasn't built for you — but that doesn't mean you should be locked out. Krostio exists because gig income is real income, and real income deserves real verification.

*Krostio is currently in beta. 2,400 gig workers have already connected their platforms and generated scores.*`,
  },
  {
    slug: 'income-verification-fails-gig',
    title: 'Why Traditional Income Verification Fails for Self-Employed Workers',
    date: 'May 16, 2026',
    author: 'Krostio Marketing Team',
    tags: ['self-employed income verification', 'gig economy lending', 'alternative credit data', 'lender API'],
    description:
      'For lenders, self-employed and gig workers represent a massive untapped market. Here\'s why traditional verification methods fail and how Krostio Verifier fills the gap.',
    excerpt:
      'You\'re an underwriter at a credit union reviewing a mortgage application. The applicant has a credit score of 720, 12 months of consistent bank deposits totaling $84,000, a debt-to-income ratio of 28% — and no W-2. How do you verify income?',
    readingTime: '8 min read',
    body: `You're an underwriter at a credit union reviewing a mortgage application. The applicant has a credit score of 720, 12 months of consistent bank deposits totaling $84,000, a debt-to-income ratio of 28% — and no W-2.

How do you verify income?

**Option 1: Ask for bank statements.** You request three months of statements. The applicant sends 47 pages. You manually scan for payroll deposits — but there are none. Instead, you see daily transfers from Stripe, weekly ACH from Uber, and occasional PayPal deposits.

**Option 2: Ask for tax returns.** You request two years of tax returns. Schedule C shows $82,000 in net income after deductions. But the return is 8 months old.

**Option 3: Deny the application.** This is the default. It's the safest choice — no regulatory risk, no manual work, no fraud potential. But it's also a lost opportunity.

## The Scale of the Problem

64 million Americans participate in the gig economy. That's 64 million potential borrowers who avoid applying for loans because they expect denial, or apply and get rejected despite being able to afford payments.

For lenders, this is a market of trillions in unmet credit demand.

## The Cost of False Negatives

When a lender denies a qualified self-employed borrower, the cost is threefold:

1. **Direct Revenue Loss** — A $300,000 mortgage at 6.5% generates approximately $150,000 in interest over its life.
2. **Portfolio Concentration Risk** — Self-employed borrowers often have higher income and lower default rates than traditional employees.
3. **Regulatory Risk** — The CFPB has signaled that verification methods disproportionately excluding self-employed borrowers may face fair lending scrutiny.

## How Krostio Verifier Works

Krostio Verifier is an API-first income verification platform built specifically for multi-platform, gig, and self-employed income.

**For the borrower:** Connect platforms via OAuth, Krostio pulls earnings data, and a report with the Krost Score (300-850) is generated.

**For the lender:** The borrower shares a verification link. The lender opens it — no login required — and sees structured JSON data, not scanned PDFs. On-chain verification is available via the Krost Passport on Base L2.

## API-First Approach

Krostio Verifier provides a REST API for lenders to integrate directly into their underwriting workflow, returning structured data including score, income monthly average, consistency rating, platform count, and earnings trend.

## The Opportunity

Every lender faces the same question: how do you responsibly lend to the 64 million workers the current system ignores?

The answer isn't more manual underwriting. It's building verification infrastructure that matches how these workers actually earn. Krostio Verifier is that infrastructure.

*Krostio is currently in beta. Lender pilot applications are open.*`,
  },
];

export function getBlogPosts(): BlogPost[] {
  return posts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}
