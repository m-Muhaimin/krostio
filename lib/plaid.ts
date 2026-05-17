import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

/**
 * Known gig-economy institutions for automatic platform detection.
 * Plaid returns institution_id which we map to a gig platform name.
 */
const GIG_INSTITUTION_MAP: Record<string, string> = {
  'ins_128026': 'doordash',    // DoorDash / DasherDirect
  'ins_128041': 'uber',        // Uber / Uber Pro
  'ins_128045': 'lyft',        // Lyft
  'ins_128058': 'grubhub',     // Grubhub
  'ins_128072': 'instacart',   // Instacart
  'ins_128076': 'amazon_flex', // Amazon Flex
  'ins_128119': 'upwork',      // Upwork
  'ins_128120': 'fiverr',      // Fiverr
  'ins_128131': 'uber_eats',   // Uber Eats
  'ins_128132': 'doordash_drive', // DoorDash Drive
  'ins_128140': 'shipt',       // Shipt
  'ins_128141': 'postmates',   // Postmates
  'ins_128187': 'taskrabbit',  // TaskRabbit
};

/**
 * Fallback: detect platform from institution name via keyword matching.
 */
const GIG_KEYWORDS: { keywords: string[]; platform: string }[] = [
  { keywords: ['uber', 'uber pro', 'uber eats'], platform: 'uber' },
  { keywords: ['doordash', 'dasher', 'dasherdirect'], platform: 'doordash' },
  { keywords: ['lyft'], platform: 'lyft' },
  { keywords: ['grubhub', 'grubhub for work'], platform: 'grubhub' },
  { keywords: ['instacart', 'full service shopper'], platform: 'instacart' },
  { keywords: ['amazon flex', 'amazon'], platform: 'amazon_flex' },
  { keywords: ['upwork', 'upwork freelancer'], platform: 'upwork' },
  { keywords: ['fiverr'], platform: 'fiverr' },
  { keywords: ['shipt', 'shipt shopper'], platform: 'shipt' },
  { keywords: ['postmates', 'postmates fleet'], platform: 'postmates' },
  { keywords: ['taskrabbit', 'tasker'], platform: 'taskrabbit' },
];

export function detectGigPlatform(institutionId: string | undefined, institutionName: string | undefined): string {
  // 1. Check direct institution ID mapping
  if (institutionId && GIG_INSTITUTION_MAP[institutionId]) {
    return GIG_INSTITUTION_MAP[institutionId];
  }

  // 2. Check keyword match on institution name
  if (institutionName) {
    const name = institutionName.toLowerCase();
    for (const rule of GIG_KEYWORDS) {
      if (rule.keywords.some(k => name.includes(k))) {
        return rule.platform;
      }
    }
  }

  // 3. Fallback — use the name slugged
  return (institutionName || 'other')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 32) || 'other';
}

/**
 * Categorize an earnings line based on platform and transaction metadata.
 */
export function categorizeEarnings(platform: string): string {
  const rideShare = ['uber', 'lyft', 'uber_eats'];
  const delivery = ['doordash', 'grubhub', 'instacart', 'shipt', 'postmates', 'doordash_drive', 'amazon_flex'];
  const freelance = ['upwork', 'fiverr', 'taskrabbit'];

  if (rideShare.includes(platform)) return 'rides';
  if (delivery.includes(platform)) return 'delivery';
  if (freelance.includes(platform)) return 'freelance';
  return 'flex';
}
