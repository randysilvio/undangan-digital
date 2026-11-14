'use server'

import { refresh, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { customThemeSchema, isThemeAssetUrl, readThemeForm, SLOT_IDS } from '@/lib/custom-theme'
import { SAVE_FAILED } from '@/lib/data/errors'
import { SITE_TAG } from '@/lib/data/site'
import { deleteTheme, duplicateTheme, getTheme, saveSettings, saveTheme, setThemeAsset } from '@/lib/data/themes'
import { parseSettingsForm } from '@/lib/site-settings'
import { SUPABASE_URL } from '@/lib/supabase/env'
import type { ThemeSlot } from '@/lib/types'
import { fieldErrors, type FormState } from '@/lib/validation'

const CHECK_FIELDS = 'Periksa kembali isian yang ditandai merah'

export async function saveThemeAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin()
  const id = String(fd.get('id') ?? '') || undefined
  const parsed = customThemeSchema.safeParse(readThemeForm(fd))
  if (!parsed.success) return { status: 'error', message: CHECK_FIELDS, fieldErrors: fieldErrors(parsed.error) }

  const saved = await saveTheme(supabase, parsed.data, id)
  if (saved.error) {
    if (saved.error.code === '23505') return { status: 'error', message: CHECK_FIELDS, fieldErrors: { slug: 'Alamat tema ini sudah dipakai' } }
    return { status: 'error', message: SAVE_FAILED }
  }
  updateTag(SITE_TAG)
  if (!id) redirect(`/admin/tema/${saved.data.id}?baru=1`)
  refresh()
  return { status: 'ok', message: 'Tersimpan' }
}

type Simple = { ok: true } | { ok: false; message: string }

export async function setThemeAssetAction(id: string, slot: ThemeSlot, url: string | null): Promise<Simple> {
  const { supabase } = await requireAdmin()
  if (!SLOT_IDS.includes(slot)) return { ok: false, message: SAVE_FAILED }
  if (url !== null && !isThemeAssetUrl(url, SUPABASE_URL)) return { ok: false, message: 'File tidak valid' }
  const r = await setThemeAsset(supabase, id, slot, url)
  if (r.error) return { ok: false, message: SAVE_FAILED }
  updateTag(SITE_TAG)
  refresh()
  return { ok: true }
}

export async function duplicateThemeAction(fd: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const r = await duplicateTheme(supabase, String(fd.get('id') ?? ''))
  if (r.error) throw new Error(SAVE_FAILED)
  redirect(`/admin/tema/${r.data.id}`)
}

export async function deleteThemeAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin()
  const id = String(fd.get('id') ?? '')
  const theme = await getTheme(supabase, id)
  if (!theme) return { status: 'error', message: 'Tema tidak ditemukan' }
  const r = await deleteTheme(supabase, id)
  if (r.error) {
    if (r.error.code === '23503') return { status: 'error', message: 'Tema masih dipakai undangan. Ganti tema undangan tersebut dulu.' }
    return { status: 'error', message: SAVE_FAILED }
  }
  updateTag(SITE_TAG)
  redirect('/admin/tema')
}

export async function saveSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin()
  const parsed = parseSettingsForm(fd)
  if ('fieldErrors' in parsed) return { status: 'error', message: CHECK_FIELDS, fieldErrors: parsed.fieldErrors }
  const r = await saveSettings(supabase, parsed.data)
  if (r.error) return { status: 'error', message: SAVE_FAILED }
  updateTag(SITE_TAG)
  refresh()
  return { status: 'ok', message: 'Tersimpan' }
}
