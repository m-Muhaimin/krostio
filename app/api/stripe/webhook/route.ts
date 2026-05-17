import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        await admin.from('profiles').update({
          subscription_status: 'active',
          subscription_plan: plan,
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profiles } = await admin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId);

      if (profiles && profiles.length > 0) {
        const status = subscription.status === 'active' ? 'active' : 'inactive';
        await admin.from('profiles').update({
          subscription_status: status,
          updated_at: new Date().toISOString(),
        }).eq('id', profiles[0].id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profiles } = await admin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId);

      if (profiles && profiles.length > 0) {
        await admin.from('profiles').update({
          subscription_status: 'cancelled',
          subscription_plan: 'free',
          updated_at: new Date().toISOString(),
        }).eq('id', profiles[0].id);
      }
      break;
    }

    default:
      console.log('Unhandled Stripe event:', event.type);
  }

  return NextResponse.json({ received: true });
}
