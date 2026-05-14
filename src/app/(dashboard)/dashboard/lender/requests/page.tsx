import { requireRole } from '@/lib/auth-guard'
import { LenderRequestsUI } from './lender-requests-ui'

export default async function LenderRequestsPage() {
  await requireRole(['lender'])
  return <LenderRequestsUI />
}
