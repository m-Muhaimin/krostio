import { getCurrentUserRole } from '@/lib/auth-guard'
import { getCurrentUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DashboardShell } from './_components/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, userId } = await getCurrentUserRole()

  if (!role || !userId) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()
  const userName = currentUser?.user?.name ?? currentUser?.user?.email ?? 'Worker'
  const userEmail = currentUser?.user?.email ?? ''

  const supabase = createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_verified')
    .eq('id', userId)
    .single()

  const emailVerified = profile?.email_verified ?? false

  return (
    <DashboardShell role={role} userId={userId} userName={userName} userEmail={userEmail} emailVerified={emailVerified}>
      {children}
    </DashboardShell>
  )
}
