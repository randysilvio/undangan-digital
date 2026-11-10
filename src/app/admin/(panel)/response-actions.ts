'use server'

import { refresh } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { setWishHidden } from '@/lib/data/admin'

export async function setWishHiddenAction(invitationId: string, wishId: string, hidden: boolean): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin()
  const r = await setWishHidden(supabase, invitationId, wishId, hidden)
  if (!r.error) refresh()
  return { ok: !r.error }
}
