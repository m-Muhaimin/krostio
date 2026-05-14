import { requireRole } from '@/lib/auth-guard'
import { LenderSearchUI } from './lender-search-ui'

export default async function LenderSearchPage() {
  await requireRole(['lender'])
  return <LenderSearchUI />
}
