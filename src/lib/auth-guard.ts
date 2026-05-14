import { createServerSupabaseClient } from './supabase-server'
import { redirect } from 'next/navigation'

export type UserRole = 'gig_worker' | 'lender' | 'admin'

export async function getCurrentUserRole(): Promise<{ role: UserRole | null; userId: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { role: null, userId: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    role: profile?.role as UserRole | null,
    userId: user.id,
  }
}

export async function requireRole(allowedRoles: UserRole[]): Promise<{ role: UserRole; userId: string }> {
  const { role, userId } = await getCurrentUserRole()

  if (!role || !userId) {
    redirect('/login')
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to the appropriate dashboard based on their actual role
    if (role === 'lender') {
      redirect('/dashboard/lender')
    } else {
      redirect('/dashboard/worker')
    }
  }

  return { role, userId }
}
