import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CustomThemeInput } from '../custom-theme'
import { nextAvailableSlug } from '../slug'
import type { CustomTheme, SiteSettings, ThemeSlot } from '../types'

type DbError = { code?: string; message?: string }
type Result<T> = { data: T; error: null } | { data: null; error: DbError }

export type ThemeSummary = CustomTheme & { usage: number }

export async function listThemes(sb: SupabaseClient): Promise<ThemeSummary[]> {
  const { data, error } = await sb.from('custom_themes').select('*, invitations(count)').order('created_at', { ascending: false })
  if (error) throw error
  return (data as (CustomTheme & { invitations: { count: number }[] })[]).map(({ invitations, ...t }) => ({
    ...t,
    usage: invitations?.[0]?.count ?? 0,
  }))
}

export async function getTheme(sb: SupabaseClient, id: string): Promise<CustomTheme | null> {
  const { data, error } = await sb.from('custom_themes').select('*').eq('id', id).maybeSingle()
  if (error) {
    if (error.code === '22P02') return null
    throw error
  }
  return data as CustomTheme | null
}

export async function saveTheme(sb: SupabaseClient, input: CustomThemeInput, id?: string): Promise<Result<{ id: string }>> {
  const row = { ...input, updated_at: new Date().toISOString() }
  const q = id ? sb.from('custom_themes').update(row).eq('id', id) : sb.from('custom_themes').insert(row)
  const { data, error } = await q.select('id').single()
  return error ? { data: null, error } : { data: { id: data.id as string }, error: null }
}

/** Mengganti satu gambar tema (null = hapus). */
export async function setThemeAsset(sb: SupabaseClient, id: string, slot: ThemeSlot, url: string | null): Promise<Result<null>> {
  const theme = await getTheme(sb, id)
  if (!theme) return { data: null, error: { message: 'not found' } }
  const assets = { ...theme.assets }
  if (url) assets[slot] = url
  else delete assets[slot]
  const { error } = await sb.from('custom_themes').update({ assets, updated_at: new Date().toISOString() }).eq('id', id)
  return error ? { data: null, error } : { data: null, error: null }
}

/** Salinan tema (gambar memakai file yang sama), tidak tampil di galeri. */
export async function duplicateTheme(sb: SupabaseClient, id: string): Promise<Result<{ id: string }>> {
  const src = await getTheme(sb, id)
  if (!src) return { data: null, error: { message: 'not found' } }
  const base = `${src.slug.slice(0, 32).replace(/-+$/, '')}-salinan`
  const { data: taken } = await sb.from('custom_themes').select('slug').like('slug', `${base}%`)
  const slug = nextAvailableSlug(base, (taken ?? []).map((r) => r.slug as string))
  const { data, error } = await sb
    .from('custom_themes')
    .insert({
      slug,
      name: `${src.name} (salinan)`.slice(0, 40),
      description: src.description,
      base_theme: src.base_theme,
      colors: src.colors,
      fonts: src.fonts,
      assets: src.assets,
      particles: src.particles,
      show_in_gallery: false,
    })
    .select('id')
    .single()
  return error ? { data: null, error } : { data: { id: data.id as string }, error: null }
}

export async function deleteTheme(sb: SupabaseClient, id: string): Promise<Result<null>> {
  const { error } = await sb.from('custom_themes').delete().eq('id', id)
  return error ? { data: null, error } : { data: null, error: null }
}

/** Pilihan tema kustom untuk formulir undangan. */
export async function themeChoices(sb: SupabaseClient): Promise<Pick<CustomTheme, 'id' | 'name' | 'base_theme' | 'colors' | 'description'>[]> {
  const { data, error } = await sb.from('custom_themes').select('id, name, base_theme, colors, description').order('name')
  if (error) throw error
  return data as Pick<CustomTheme, 'id' | 'name' | 'base_theme' | 'colors' | 'description'>[]
}

export async function saveSettings(sb: SupabaseClient, s: SiteSettings): Promise<Result<null>> {
  const { error } = await sb
    .from('site_settings')
    .update({ ...s, updated_at: new Date().toISOString() })
    .eq('id', 1)
  return error ? { data: null, error } : { data: null, error: null }
}

/** Jumlah undangan yang memakai tema ini. */
export async function themeUsage(sb: SupabaseClient, id: string): Promise<number> {
  const { count, error } = await sb.from('invitations').select('id', { count: 'exact', head: true }).eq('custom_theme_id', id)
  if (error) throw error
  return count ?? 0
}
