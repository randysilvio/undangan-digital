import { cache } from 'react'
import { createPublicSupabase } from '../supabase/public'
import type { InvitationFull, Wish } from '../types'

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order

export function normalizeInvitation(row: InvitationFull): InvitationFull {
  return {
    ...row,
    events: [...(row.events ?? [])].sort(bySortOrder),
    gallery: [...(row.gallery ?? [])].sort(bySortOrder),
    gifts: [...(row.gifts ?? [])].sort(bySortOrder),
  }
}

export const FULL_SELECT = '*, events(*), gallery:gallery_photos(*), gifts:gift_accounts(*)'

/** Undangan yang sudah terbit (RLS juga hanya mengizinkan yang terbit). */
export const getPublishedInvitation = cache(async (slug: string): Promise<InvitationFull | null> => {
  const { data, error } = await createPublicSupabase()
    .from('invitations')
    .select(FULL_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  return data ? normalizeInvitation(data as InvitationFull) : null
})

export async function getVisibleWishes(invitationId: string, limit = 50): Promise<Wish[]> {
  const { data, error } = await createPublicSupabase()
    .from('wishes')
    .select('*')
    .eq('invitation_id', invitationId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Wish[]
}
