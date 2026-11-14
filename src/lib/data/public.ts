import { cache } from 'react'
import { MONITOR_TOKEN_RE } from '../monitor'
import { createPublicSupabase } from '../supabase/public'
import type { InvitationFull, MonitorResult, MonitorSummary, Wish } from '../types'

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order

export function normalizeInvitation(row: InvitationFull): InvitationFull {
  return {
    ...row,
    story: Array.isArray(row.story) ? row.story : [],
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

type MonitorRow = {
  groom_nickname: string
  bride_nickname: string | null
  theme: MonitorSummary['theme']
  timezone: MonitorSummary['timezone']
  status: MonitorSummary['status']
  hadir: number
  tidak: number
  ragu: number
  total_orang: number
  generated_at: string
}

/**
 * Rekap angka untuk link pantau mempelai. Tidak pernah melempar: halaman pantau harus tetap
 * hidup (dan terus menyegarkan) saat database sedang gangguan.
 */
export async function getMonitorSummary(token: string): Promise<MonitorResult> {
  if (!MONITOR_TOKEN_RE.test(token)) return { kind: 'invalid' }
  try {
    const { data, error } = await createPublicSupabase().rpc('monitor_summary', { p_token: token })
    if (error) return { kind: 'error' }
    const row = (data as MonitorRow[] | null)?.[0]
    if (!row) return { kind: 'invalid' }
    return {
      kind: 'ok',
      summary: {
        groomNickname: row.groom_nickname,
        brideNickname: row.bride_nickname,
        theme: row.theme,
        timezone: row.timezone,
        status: row.status,
        hadir: row.hadir,
        tidak: row.tidak,
        ragu: row.ragu,
        totalOrang: row.total_orang,
        generatedAt: row.generated_at,
      },
    }
  } catch {
    return { kind: 'error' }
  }
}
