import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { plaidClient, detectGigPlatform, categorizeEarnings } from '@/lib/plaid';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publicToken, institutionId, institutionName, accountId } = await request.json();

    if (!publicToken) {
      return NextResponse.json({ error: 'Missing public token' }, { status: 400 });
    }

    // 1. Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // 2. Detect gig platform from institution
    const platform = detectGigPlatform(institutionId, institutionName);
    const category = categorizeEarnings(platform);

    // 3. Fetch recent transactions (past 90 days) to populate ledger
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 90);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const txResponse = await plaidClient.transactionsSync({
      access_token: accessToken,
    });
    const { added, modified } = txResponse.data;

    // 4. Insert transactions into income_records
    const entries = [...added, ...modified].map((tx: any) => ({
      user_id: user.id,
      platform,
      gross_earnings: Math.abs(tx.amount),
      net_earnings: null,
      period_start: tx.date,
      period_end: tx.date,
      currency: tx.iso_currency_code || 'USD',
      created_at: new Date().toISOString(),
    }));

    if (entries.length > 0) {
      const { error: insertError } = await supabase
        .from('income_records')
        .insert(entries);

      if (insertError) {
        console.error('Failed to insert income records:', insertError);
      }
    }

    // 5. Upsert platform connection
    const { error: connError } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: user.id,
        platform,
        access_token: accessToken,
        item_id: itemId,
        institution_id: institutionId || null,
        institution_name: institutionName || null,
        provider: 'plaid',
        last_sync_at: new Date().toISOString(),
        is_active: true,
      }, {
        onConflict: 'user_id,platform',
      });

    if (connError) {
      console.error('Platform connection error:', connError);
    }

    // 6. Trigger score recalculation (async)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/score/current`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRecalculate: true }),
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      platform,
      entriesImported: entries.length,
      accessToken,  // for frontend if needed
    });
  } catch (error: any) {
    console.error('Plaid exchange error:', error?.response?.data || error);
    return NextResponse.json(
      { error: 'Failed to exchange Plaid token' },
      { status: 500 }
    );
  }
}
