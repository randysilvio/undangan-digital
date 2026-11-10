'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { parseInvitationForm } from '@/lib/admin-forms'
import { requireAdmin } from '@/lib/auth'
import { duplicateInvitation, getInvitation, replaceEvents, saveInvitation, setStatus } from '@/lib/data/admin'
import { mapDbError, SAVE_FAILED } from '@/lib/data/errors'
import { canPublish } from '@/lib/publish'
import type { FormState } from '@/lib/validation'

const CHECK_FIELDS = 'Periksa kembali isian yang ditandai merah'

export async function saveInvitationAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin()
  const id = String(fd.get('id') ?? '') || undefined

  const parsed = parseInvitationForm(fd)
  if (parsed.fieldErrors) return { status: 'error', message: CHECK_FIELDS, fieldErrors: parsed.fieldErrors }
  const { invitation, events } = parsed.data

  if (id && events.length === 0) {
    const current = await getInvitation(supabase, id)
    if (current?.status === 'published') {
      return { status: 'error', message: 'Undangan yang sudah terbit harus punya minimal satu acara' }
    }
  }

  const saved = await saveInvitation(supabase, invitation, id)
  if (saved.error) {
    const mapped = mapDbError(saved.error)
    return typeof mapped === 'string' ? { status: 'error', message: mapped } : { status: 'error', message: CHECK_FIELDS, fieldErrors: mapped }
  }

  const ev = await replaceEvents(supabase, saved.data.id, events)
  if (ev.error) return { status: 'error', message: SAVE_FAILED }

  if (!id) redirect(`/admin/${saved.data.id}/edit?baru=1`)
  refresh()
  return { status: 'ok', message: 'Tersimpan' }
}

export async function setStatusAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin()
  const id = String(fd.get('id') ?? '')
  const status = fd.get('status') === 'published' ? 'published' : 'draft'

  if (status === 'published') {
    const inv = await getInvitation(supabase, id)
    if (!inv) return { status: 'error', message: 'Undangan tidak ditemukan' }
    const reason = canPublish(inv)
    if (reason) return { status: 'error', message: reason }
  }
  const r = await setStatus(supabase, id, status)
  if (r.error) return { status: 'error', message: SAVE_FAILED }
  refresh()
  return { status: 'ok', message: status === 'published' ? 'Undangan sudah terbit' : 'Undangan dijadikan draft' }
}

export async function duplicateAction(fd: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const r = await duplicateInvitation(supabase, String(fd.get('id') ?? ''))
  if (r.error) throw new Error('Gagal menduplikat undangan')
  redirect(`/admin/${r.data.id}/edit?baru=1`)
}
