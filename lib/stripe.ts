import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  stripe_price_id: string;
  features: string[];
}

export const PRICING: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    stripe_price_id: '',
    features: ['1 platform', 'Income summary', 'No PDF reports'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    stripe_price_id: process.env.STRIPE_PRICE_ID_STARTER || '',
    features: ['1 platform', '1 PDF report', '12-month history', '7-day shareable link'],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro',
    price: 19,
    stripe_price_id: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || '',
    features: ['5 platforms', 'Unlimited reports', '24-month history', '30-day links', 'Passport minting'],
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: 190,
    stripe_price_id: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || '',
    features: ['All Pro features', '2 months free', 'Priority support'],
  },
};

export async function createCheckoutSession(userId: string, planId: string) {
  const plan = PRICING[planId];
  if (!plan || !plan.stripe_price_id) {
    throw new Error('Invalid plan or missing Stripe price ID');
  }

  const isSubscription = planId === 'pro_monthly' || planId === 'pro_annual';

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    metadata: { user_id: userId, plan: planId },
    success_url: `${process.env.NEXT_PUBLIC_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing`,
  });

  return session.url;
}
