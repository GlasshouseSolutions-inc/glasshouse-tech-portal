import { supabase } from '@/utils/supabaseServer'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  // ✅ TEMPORARY LOCAL BYPASS FOR DEVELOPMENT
  if (process.env.NODE_ENV === 'development') {
    return { email: 'mikulj@hotmail.com' }
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const adminEmail = 'mikulj@hotmail.com'

  if (session.user.email !== adminEmail) {
    redirect('/login')
  }

  return session.user
}
