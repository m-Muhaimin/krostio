import { requireRole } from '@/lib/auth-guard'
import { ConnectionsUI } from './connections-ui'

export default async function ConnectionsPage() {
  await requireRole(['gig_worker'])
  return <ConnectionsUI />
}
