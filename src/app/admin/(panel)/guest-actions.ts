'use server'

import { refresh } from 'next/cache'
import { prepareGuestPaste } from '@/lib/admin-forms'
import { requireAdmin } from '@/lib/auth'
import { addGuests, deleteGuest, listGuests } from '@/lib/data/admin'
import { SAVE_FAILED } from '@/lib/data/errors'
import type { FormState } from '@/lib/validation'

export async function addGuestsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin()
  const id = String(fd.get('id') ?? '')
  const text = String(fd.get('names') ?? '')
  const existing = await listGuests(supabase, id)
  const prepared = prepareGuestPaste(
    text,
    existing.map((g) => g.name),
  )
  if ('error' in prepared) return { status: 'error', message: prepared.error, values: { names: text } }
  if (prepared.guests.length === 0) {
    return { status: 'ok', message: `Tidak ada tamu baru — ${prepared.skipped} nama sudah ada`, values: { names: '' } }
  }
  const r = await addGuests(supabase, id, prepared.guests)
  if (r.error) return { status: 'error', message: SAVE_FAILED, values: { names: text } }
  refresh()
  const skipped = prepared.skipped ? `, ${prepared.skipped} duplikat dilewati` : ''
  return { status: 'ok', message: `${r.data.added} tamu ditambahkan${skipped}`, values: { names: '' } }
}

export async function deleteGuestAction(invitationId: string, guestId: string): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin()
  const r = await deleteGuest(supabase, invitationId, guestId)
  if (!r.error) refresh()
  return { ok: !r.error }
}
