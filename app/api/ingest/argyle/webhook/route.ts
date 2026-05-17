import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import crypto from 'crypto';

/**
 * Argyle Webhook Handler
 *
 * Receives income update events from Argyle API.
 * Configuration:
 * - Set ARGYLE_WEBHOOK_SECRET in .env (required for signature verification)
 * - Optionally set ARGYLE_CLIENT_ID, ARGYLE_CLIENT_SECRET for SDK usage
 * - Register webhook URL in Argyle dashboard: https://api.argyle.com/webhooks
 */

/**
 * Verify that an Argyle webhook payload is authentic.
 *
 * Argyle signs webhook requests with HMAC-SHA256 using the shared webhook secret.
 * The signature is sent in the `x-argyle-signature` header as a base64-encoded string.
 *
 * @param rawBody - The raw request body as a string
 * @param signature - The base64 HMAC-SHA256 from the x-argyle-signature header
 * @returns true if the signature is valid
 */
function verifyArgyleSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.ARGYLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Argyle Webhook] ARGYLE_WEBHOOK_SECRET is not configured');
    return false;
  }

  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  // Timing-safe comparison to prevent timing attacks
  try {
    const expected = Buffer.from(computed);
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  // Read raw body first (needed for signature verification), then parse
  const rawBody = await request.text();

  // Verify webhook signature (critical for security)
  const signature = request.headers.get('x-argyle-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  if (!verifyArgyleSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createAdminClient();

  switch (event.name) {
    case 'accounts.added':
    case 'accounts.updated': {
      const accountId = event.data?.account_id;
      const userId = event.data?.user?.id || event.user_id;

      if (!accountId || !userId) {
        return NextResponse.json({ error: 'Missing account_id or user_id' }, { status: 400 });
      }

      // TODO: Fetch income data from Argyle API once SDK is configured
      // For now, log the event
      console.log('[Argyle Webhook] accounts.added/updated:', { accountId, userId });

      // Update platform connection status
      await supabase
        .from('platform_connections')
        .update({ connection_status: 'active', last_sync_at: new Date().toISOString() })
        .eq('argyle_account_id', accountId);

      break;
    }

    case 'accounts.removed': {
      const accountId = event.data?.account_id;
      if (accountId) {
        await supabase
          .from('platform_connections')
          .update({ connection_status: 'disconnected' })
          .eq('argyle_account_id', accountId);
      }
      break;
    }

    default:
      console.log('[Argyle Webhook] Unhandled event:', event.name);
  }

  return NextResponse.json({ received: true });
}
