'use server'

import { redirect } from 'next/navigation'
import { safeRedirect } from '@/lib/safe-redirect'
import { createServerSupabase } from '@/lib/supabase/server'
import type { FormState } from '@/lib/validation'

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get('email') ?? '').trim()
  const password = String(fd.get('password') ?? '')
  const values = { email }
  if (!email || !password) return { status: 'error', message: 'Isi email dan password', values }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { status: 'error', message: 'Email atau password salah', values }

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin !== true) {
    await supabase.auth.signOut()
    return { status: 'error', message: 'Akun ini tidak punya akses admin', values }
  }
  redirect(safeRedirect(String(fd.get('next') ?? '')))
}

export async function logout() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
