import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { nextAvailableSlug } from '../slug'
import type { Invitation, InvitationFull, InvitationStatus } from '../types'
import type { EventInput, GiftInput, InvitationInput } from '../validation'
import { FULL_SELECT, normalizeInvitation } from './public'

type DbError = { code?: string; message?: string }
export type Result<T> = { data: T; error: null } | { data: null; error: DbError }

const ok = <T>(data: T): Result<T> => ({ data, error: null })
const fail = <T>(error: DbError): Result<T> => ({ data: null, error })

function withoutKeys(obj: object, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)))
}

export type InvitationSummary =Invitation & { rsvp_count: number }

/** Semua undangan (terbaru dulu), disaring di server aplikasi agar aman dari karakter khusus. */
export async function listInvitations(sb: SupabaseClient, search?: string): Promise<InvitationSummary[]> {
  const { data, error } = await sb.from('invitations').select('*, rsvps(count)').order('created_at', { ascending: false })
  if (error) throw error
  const rows = (data as (Invitation & { rsvps: { count: number }[] })[]).map(({ rsvps, ...inv }) => ({
    ...inv,
    rsvp_count: rsvps?.[0]?.count ?? 0,
  }))
  const q = search?.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((r) =>
    [r.slug, r.groom_nickname, r.bride_nickname, r.groom_name, r.bride_name].some((v) => v.toLowerCase().includes(q)),
  )
}

export async function getInvitation(sb: SupabaseClient, id: string): Promise<InvitationFull | null> {
  const { data, error } = await sb.from('invitations').select(FULL_SELECT).eq('id', id).maybeSingle()
  if (error) {
    if (error.code === '22P02') return null // id bukan UUID
    throw error
  }
  return data ? normalizeInvitation(data as InvitationFull) : null
}

export async function saveInvitation(sb: SupabaseClient, input: InvitationInput, id?: string): Promise<Result<{ id: string }>> {
  const query = id ? sb.from('invitations').update(input).eq('id', id) : sb.from('invitations').insert(input)
  const { data, error } = await query.select('id').single()
  return error ? fail(error) : ok({ id: data.id as string })
}

/**
 * Mengganti daftar baris anak (acara/amplop): sisipkan yang baru dulu, baru hapus yang lama,
 * sehingga data lama tidak hilang bila penyisipan gagal.
 */
export async function replaceChildren<T extends object>(
  sb: SupabaseClient,
  table: 'events' | 'gift_accounts',
  invitationId: string,
  rows: T[],
): Promise<Result<null>> {
  const { data: old, error: readErr } = await sb.from(table).select('id').eq('invitation_id', invitationId)
  if (readErr) return fail(readErr)
  if (rows.length) {
    const { error } = await sb
      .from(table)
      .insert(rows.map((r, i) => ({ ...r, invitation_id: invitationId, sort_order: i })))
    if (error) return fail(error)
  }
  const oldIds = (old ?? []).map((r) => r.id as string)
  if (oldIds.length) {
    const { error } = await sb.from(table).delete().in('id', oldIds)
    if (error) return fail(error)
  }
  return ok(null)
}

export const replaceEvents = (sb: SupabaseClient, id: string, events: EventInput[]) => replaceChildren(sb, 'events', id, events)

export const replaceGifts = (sb: SupabaseClient, id: string, gifts: GiftInput[]) => replaceChildren(sb, 'gift_accounts', id, gifts)

export type MediaField = 'groom_photo_url' | 'bride_photo_url' | 'cover_photo_url' | 'music_url'
export const MEDIA_FIELDS: readonly MediaField[] = ['groom_photo_url', 'bride_photo_url', 'cover_photo_url', 'music_url']

export async function setMediaField(sb: SupabaseClient, id: string, field: MediaField, url: string | null): Promise<Result<null>> {
  const { error } = await sb
    .from('invitations')
    .update({ [field]: url })
    .eq('id', id)
  return error ? fail(error) : ok(null)
}

export async function countGallery(sb: SupabaseClient, id: string): Promise<number> {
  const { count, error } = await sb.from('gallery_photos').select('id', { count: 'exact', head: true }).eq('invitation_id', id)
  if (error) throw error
  return count ?? 0
}

export async function addGalleryPhotos(sb: SupabaseClient, id: string, urls: string[], startOrder: number): Promise<Result<null>> {
  const { error } = await sb.from('gallery_photos').insert(urls.map((url, i) => ({ invitation_id: id, url, sort_order: startOrder + i })))
  return error ? fail(error) : ok(null)
}

/** Hanya menghapus baris; file di Storage dibiarkan karena bisa dipakai undangan hasil duplikat. */
export async function deleteGalleryPhoto(sb: SupabaseClient, invitationId: string, photoId: string): Promise<Result<null>> {
  const { error } = await sb.from('gallery_photos').delete().eq('id', photoId).eq('invitation_id', invitationId)
  return error ? fail(error) : ok(null)
}

export async function setStatus(sb: SupabaseClient, id: string, status: InvitationStatus): Promise<Result<null>> {
  const { error } = await sb.from('invitations').update({ status }).eq('id', id)
  return error ? fail(error) : ok(null)
}

export async function duplicateInvitation(sb: SupabaseClient, id: string): Promise<Result<{ id: string }>> {
  const src = await getInvitation(sb, id)
  if (!src) return fail({ message: 'not found' })

  const base = `${src.slug.slice(0, 48).replace(/-+$/, '')}-salinan`
  const { data: taken } = await sb.from('invitations').select('slug').like('slug', `${base}%`)
  const slug = nextAvailableSlug(base, (taken ?? []).map((r) => r.slug as string))

  const copy = withoutKeys(src, ['id', 'created_at', 'events', 'gallery', 'gifts'])
  const { data, error } = await sb.from('invitations').insert({ ...copy, slug, status: 'draft' }).select('id').single()
  if (error) return fail(error)
  const newId = data.id as string

  const children = (rows: object[]) => rows.map((r) => ({ ...withoutKeys(r, ['id']), invitation_id: newId }))
  for (const [table, rows] of [
    ['events', children(src.events)],
    ['gallery_photos', children(src.gallery)],
    ['gift_accounts', children(src.gifts)],
  ] as const) {
    if (rows.length) {
      const { error: e } = await sb.from(table).insert(rows)
      if (e) return fail(e)
    }
  }
  return ok({ id: newId })
}
