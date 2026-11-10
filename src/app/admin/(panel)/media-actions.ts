'use server'

import { refresh } from 'next/cache'
import { parseGiftsForm } from '@/lib/admin-forms'
import { requireAdmin } from '@/lib/auth'
import { addGalleryPhotos, countGallery, deleteGalleryPhoto, MEDIA_FIELDS, replaceGifts, setMediaField, type MediaField } from '@/lib/data/admin'
import { SAVE_FAILED } from '@/lib/data/errors'
import { SUPABASE_URL } from '@/lib/supabase/env'
import { isMediaUrl, MAX_GALLERY_PHOTOS } from '@/lib/upload'
import type { FormState } from '@/lib/validation'

type Simple = { ok: true } | { ok: false; message: string }

export async function setMediaFieldAction(id: string, field: MediaField, url: string | null): Promise<Simple> {
  const { supabase } = await requireAdmin()
  if (!MEDIA_FIELDS.includes(field)) return { ok: false, message: SAVE_FAILED }
  if (url !== null && !isMediaUrl(url, SUPABASE_URL, id)) return { ok: false, message: 'File tidak valid' }
  const r = await setMediaField(supabase, id, field, url)
  if (r.error) return { ok: false, message: SAVE_FAILED }
  refresh()
  return { ok: true }
}

export async function addGalleryPhotosAction(id: string, urls: string[]): Promise<Simple> {
  const { supabase } = await requireAdmin()
  if (!urls.length || urls.some((u) => !isMediaUrl(u, SUPABASE_URL, id))) return { ok: false, message: 'File tidak valid' }
  const current = await countGallery(supabase, id)
  if (current + urls.length > MAX_GALLERY_PHOTOS) return { ok: false, message: `Maksimal ${MAX_GALLERY_PHOTOS} foto galeri` }
  const r = await addGalleryPhotos(supabase, id, urls, current)
  if (r.error) return { ok: false, message: SAVE_FAILED }
  refresh()
  return { ok: true }
}

export async function deleteGalleryPhotoAction(id: string, photoId: string): Promise<Simple> {
  const { supabase } = await requireAdmin()
  const r = await deleteGalleryPhoto(supabase, id, photoId)
  if (r.error) return { ok: false, message: SAVE_FAILED }
  refresh()
  return { ok: true }
}

export async function saveGiftsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin()
  const id = String(fd.get('id') ?? '')
  const parsed = parseGiftsForm(fd)
  if (parsed.fieldErrors) return { status: 'error', message: 'Periksa kembali isian yang ditandai merah', fieldErrors: parsed.fieldErrors }
  const r = await replaceGifts(supabase, id, parsed.data)
  if (r.error) return { status: 'error', message: SAVE_FAILED }
  refresh()
  return { status: 'ok', message: 'Rekening tersimpan' }
}
