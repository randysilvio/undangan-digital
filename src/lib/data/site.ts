import { cacheLife, cacheTag } from 'next/cache'
import { createPublicSupabase } from '../supabase/public'
import type { CustomTheme, SitePackage, SiteSettings } from '../types'

export const SITE_TAG = 'site'

export const EMPTY_SETTINGS: SiteSettings = { whatsapp: null, instagram: null, email: null, packages: [], show_credit: false }

function cleanPackages(v: unknown): SitePackage[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((p): p is SitePackage => typeof p?.name === 'string' && typeof p?.price === 'string')
    .map((p) => ({ name: p.name, price: p.price, features: Array.isArray(p.features) ? p.features.map(String) : [], highlight: Boolean(p.highlight) }))
}

/** Kontak & paket untuk halaman publik. Tidak pernah melempar: halaman depan tetap tampil saat database gangguan. */
export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache'
  cacheLife('hours')
  cacheTag(SITE_TAG)
  try {
    const { data, error } = await createPublicSupabase()
      .from('site_settings')
      .select('whatsapp, instagram, email, packages, show_credit')
      .eq('id', 1)
      .maybeSingle()
    if (error || !data) return EMPTY_SETTINGS
    return { ...(data as SiteSettings), packages: cleanPackages(data.packages) }
  } catch {
    return EMPTY_SETTINGS
  }
}

/** Tema kustom yang dipamerkan di galeri publik. */
export async function getGalleryThemes(): Promise<CustomTheme[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(SITE_TAG)
  try {
    const { data, error } = await createPublicSupabase()
      .from('custom_themes')
      .select('*')
      .eq('show_in_gallery', true)
      .order('created_at', { ascending: false })
    return error || !data ? [] : (data as CustomTheme[])
  } catch {
    return []
  }
}

/** Link WhatsApp dengan pesan awal. */
export function waLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
