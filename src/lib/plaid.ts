import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

const env = (process.env.PLAID_ENV || 'sandbox') as keyof typeof PlaidEnvironments

const config = new Configuration({
  basePath: PlaidEnvironments[env],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
})

export const plaid = new PlaidApi(config)

// Products we request for gig-worker income verification.
// - 'income' (Plaid Income) verifies payroll and gig deposits from Uber, DoorDash, Lyft, Instacart, etc.
// - 'transactions' gives us deposit-level data to fill gaps and detect platform diversity.
export const PLAID_PRODUCTS: Products[] = [Products.Transactions]

// Optional add-on for richer income data. Enable on the Plaid dashboard before flipping on:
//   Products.Income
// Then add it here.

export const PLAID_COUNTRY_CODES: CountryCode[] = [CountryCode.Us]

export const PLAID_CLIENT_NAME = 'Krostio'

export const PLAID_REDIRECT_URI =
  process.env.PLAID_REDIRECT_URI || 'http://localhost:3000/auth/plaid/callback'
