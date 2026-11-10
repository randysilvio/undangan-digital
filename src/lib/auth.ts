import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createServerSupabase } from './supabase/server'

/**
 * Wajib dipanggil di setiap halaman, server action, dan route admin.
 * Mengalihkan ke halaman login bila belum login atau bukan admin.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/admin/login')
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin !== true) redirect('/admin/login?error=akses')
  return { supabase, userId }
})
