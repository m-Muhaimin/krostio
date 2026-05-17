import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { plaidClient } from '@/lib/plaid';
import { CountryCode, Products, LinkTokenCreateRequest } from 'plaid';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const request: LinkTokenCreateRequest = {
      user: {
        client_user_id: user.id,
      },
      client_name: 'Krostio',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: process.env.PLAID_REDIRECT_URI || undefined,
    };

    const response = await plaidClient.linkTokenCreate(request);
    const linkToken = response.data.link_token;

    return NextResponse.json({ linkToken });
  } catch (error: any) {
    console.error('Plaid link-token error:', error?.response?.data || error);
    return NextResponse.json(
      { error: 'Failed to create Plaid link token' },
      { status: 500 }
    );
  }
}
