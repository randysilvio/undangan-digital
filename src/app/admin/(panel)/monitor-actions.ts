'use server'

import { refresh } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { deleteMonitorLink, upsertMonitorLink } from '@/lib/data/admin'
import { SAVE_FAILED } from '@/lib/data/errors'
import { monitorToken } from '@/lib/monitor'

type ActionResult = { ok: boolean; message?: string }

/** Membuat link pantau, atau mengganti kodenya (link lama langsung tidak berlaku). */
export async function createMonitorLinkAction(invitationId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin()
  const r = await upsertMonitorLink(supabase, invitationId, monitorToken())
  if (r.error) return { ok: false, message: SAVE_FAILED }
  refresh()
  return { ok: true }
}

export async function disableMonitorLinkAction(invitationId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin()
  const r = await deleteMonitorLink(supabase, invitationId)
  if (r.error) return { ok: false, message: SAVE_FAILED }
  refresh()
  return { ok: true }
}
