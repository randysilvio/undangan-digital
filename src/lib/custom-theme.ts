import type { CSSProperties } from 'react'
import { z } from 'zod'
import { THEME_NAMES, THEMES } from '@/themes'
import type { CustomTheme, ParticleMode, ThemeColorKey, ThemeFontRole, ThemeName, ThemeSlot } from './types'

export const COLOR_KEYS: { key: ThemeColorKey; label: string; css: string }[] = [
  { key: 'bg', label: 'Latar', css: '--inv-bg' },
  { key: 'surface', label: 'Latar kartu', css: '--inv-surface' },
  { key: 'text', label: 'Teks', css: '--inv-text' },
  { key: 'muted', label: 'Teks lembut', css: '--inv-muted' },
  { key: 'accent', label: 'Aksen', css: '--inv-accent' },
  { key: 'on_accent', label: 'Teks di atas aksen', css: '--inv-on-accent' },
  { key: 'line', label: 'Garis', css: '--inv-line' },
]

/** Huruf yang tersedia (variabel dari app/fonts.ts). */
export const FONT_OPTIONS: Record<string, { label: string; css: string }> = {
  cormorant: { label: 'Cormorant (serif klasik)', css: 'var(--font-cormorant), Georgia, serif' },
  playfair: { label: 'Playfair (serif mewah)', css: 'var(--font-playfair), Georgia, serif' },
  montserrat: { label: 'Montserrat (modern)', css: 'var(--font-montserrat), ui-sans-serif, system-ui, sans-serif' },
  inter: { label: 'Inter (bersih)', css: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif' },
  lato: { label: 'Lato (lembut)', css: 'var(--font-lato), ui-sans-serif, system-ui, sans-serif' },
  quicksand: { label: 'Quicksand (bulat)', css: 'var(--font-quicksand), ui-rounded, system-ui, sans-serif' },
  fredoka: { label: 'Fredoka (ceria)', css: 'var(--font-fredoka), ui-rounded, system-ui, sans-serif' },
  'great-vibes': { label: 'Great Vibes (huruf sambung)', css: 'var(--font-great-vibes), var(--font-cormorant), cursive' },
  pacifico: { label: 'Pacifico (sambung santai)', css: 'var(--font-pacifico), cursive' },
}
export const FONT_IDS = Object.keys(FONT_OPTIONS)

export const FONT_ROLES: { role: ThemeFontRole; label: string; css: string }[] = [
  { role: 'heading', label: 'Huruf judul', css: '--inv-heading' },
  { role: 'body', label: 'Huruf isi', css: '--inv-body' },
  { role: 'names', label: 'Huruf nama', css: '--inv-names' },
]

export interface SlotInfo {
  slot: ThemeSlot
  label: string
  hint: string
  /** Ukuran sisi terpanjang setelah dikompres (px) dan batas ukuran file (MB). */
  maxSide: number
  maxMB: number
}

export const THEME_SLOTS: SlotInfo[] = [
  { slot: 'cover_bg', label: 'Latar sampul', hint: 'Gambar tegak 1080×1920. Dipakai bila undangan tidak punya foto sampul.', maxSide: 1920, maxMB: 0.8 },
  { slot: 'cover_frame', label: 'Bingkai sampul', hint: 'PNG transparan tegak, menutupi seluruh sampul.', maxSide: 1600, maxMB: 0.6 },
  { slot: 'corner', label: 'Hiasan sudut', hint: 'PNG transparan untuk sudut kiri atas; diputar otomatis ke empat sudut sampul dan penutup.', maxSide: 600, maxMB: 0.25 },
  { slot: 'texture', label: 'Tekstur latar', hint: 'Pola yang diulang di setiap bagian, mis. kertas atau batik halus. Persegi ±600px.', maxSide: 800, maxMB: 0.3 },
  { slot: 'garland', label: 'Hiasan atas judul', hint: 'PNG transparan melebar (mis. untaian bunga), tampil di atas setiap judul bagian.', maxSide: 1200, maxMB: 0.3 },
  { slot: 'ornament', label: 'Ornamen pemisah', hint: 'PNG transparan kecil pengganti garis hias di bawah judul.', maxSide: 800, maxMB: 0.2 },
  { slot: 'particle', label: 'Partikel', hint: 'PNG transparan kecil (mis. kelopak melati) yang bergerak di layar.', maxSide: 200, maxMB: 0.08 },
  { slot: 'closing_bg', label: 'Latar penutup', hint: 'Gambar untuk bagian terakhir undangan.', maxSide: 1920, maxMB: 0.8 },
]
export const SLOT_IDS = THEME_SLOTS.map((s) => s.slot) as [ThemeSlot, ...ThemeSlot[]]

export const PARTICLE_OPTIONS: Record<ParticleMode, string> = {
  tema: 'Ikuti tema dasar',
  jatuh: 'Berjatuhan',
  naik: 'Melayang naik',
  kelip: 'Berkelip',
  mati: 'Tanpa partikel',
}

/** Hanya gambar di folder tema pada bucket "media" milik proyek ini yang boleh dipakai. */
export function isThemeAssetUrl(url: string, supabaseUrl: string): boolean {
  const base = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/media/themes/`
  if (!url.startsWith(base)) return false
  const rest = url.slice(base.length)
  return /^[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/.test(rest) && !rest.includes('..')
}

/** Nilai url(...) untuk CSS; null bila URL tidak aman. */
export function cssUrl(url: string | undefined): string | null {
  // http hanya untuk Supabase lokal saat pengembangan.
  if (!url || !/^(https:\/\/|http:\/\/(127\.0\.0\.1|localhost)[:/])[^\s"'()\\]+$/.test(url)) return null
  return `url("${url}")`
}

const HEX = /^#[0-9a-fA-F]{6}$/

/** Variabel CSS untuk tema kustom (dipasang di elemen <main> undangan). */
export function customThemeStyle(t: CustomTheme | null | undefined): CSSProperties | undefined {
  if (!t) return undefined
  const v: Record<string, string> = {}
  for (const c of COLOR_KEYS) {
    const val = t.colors?.[c.key]
    if (val && HEX.test(val)) v[c.css] = val
  }
  for (const f of FONT_ROLES) {
    const id = t.fonts?.[f.role]
    if (id && FONT_OPTIONS[id]) v[f.css] = FONT_OPTIONS[id].css
  }
  const asset = (slot: ThemeSlot, name: string) => {
    const u = cssUrl(t.assets?.[slot])
    if (u) v[name] = u
  }
  asset('cover_frame', '--inv-cover-frame')
  asset('corner', '--inv-corner')
  asset('texture', '--inv-texture')
  asset('garland', '--inv-garland')
  asset('ornament', '--inv-ornament-img')
  asset('closing_bg', '--inv-closing-bg')
  return v as CSSProperties
}

/** Penanda data-* agar CSS hanya mengaktifkan hiasan yang benar-benar ada. */
export function customThemeAttrs(t: CustomTheme | null | undefined): Record<string, string> {
  if (!t) return {}
  const has = (s: ThemeSlot) => cssUrl(t.assets?.[s]) !== null
  const out: Record<string, string> = { 'data-custom-theme': t.slug }
  if (has('cover_frame')) out['data-has-frame'] = ''
  if (has('corner')) out['data-has-corner'] = ''
  if (has('texture')) out['data-has-texture'] = ''
  if (has('garland')) out['data-has-garland'] = ''
  if (has('ornament')) out['data-has-ornament'] = ''
  if (has('closing_bg')) out['data-has-closing'] = ''
  return out
}

/** Warna lengkap tema kustom (kosong = warna tema dasar). */
export function themeColors(t: Pick<CustomTheme, 'base_theme' | 'colors'>): Record<ThemeColorKey, string> {
  const base = THEMES[t.base_theme].palette
  const out = { ...base }
  for (const c of COLOR_KEYS) {
    const val = t.colors?.[c.key]
    if (val && HEX.test(val)) out[c.key] = val.toLowerCase()
  }
  return out
}

/** Rasio kontras WCAG antara dua warna hex. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

/** Peringatan keterbacaan (tidak memblokir penyimpanan). */
export function contrastWarnings(colors: Record<ThemeColorKey, string>): string[] {
  const out: string[] = []
  if (contrastRatio(colors.text, colors.bg) < 4.5) out.push('Teks kurang kontras dengan latar, sulit dibaca.')
  if (contrastRatio(colors.text, colors.surface) < 4.5) out.push('Teks kurang kontras dengan latar kartu.')
  if (contrastRatio(colors.on_accent, colors.accent) < 3) out.push('Teks tombol kurang kontras dengan warna aksen.')
  return out
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Formulir tema kustom (tanpa gambar; gambar disimpan per slot). */
export const customThemeSchema = z.object({
  name: z.string().trim().min(1, 'Nama tema wajib diisi').max(40, 'Maksimal 40 karakter'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .refine((s) => s.length >= 3 && s.length <= 40 && SLUG.test(s), 'Hanya huruf kecil, angka, dan tanda - (3–40 karakter)')
    .refine((s) => !(THEME_NAMES as string[]).includes(s), 'Nama ini dipakai tema bawaan'),
  description: z
    .string()
    .trim()
    .max(120, 'Maksimal 120 karakter')
    .optional()
    .transform((v) => v || null),
  base_theme: z.enum(THEME_NAMES, { error: 'Pilih tema dasar' }),
  colors: z.record(z.enum(COLOR_KEYS.map((c) => c.key) as [ThemeColorKey, ...ThemeColorKey[]]), z.string().regex(HEX, 'Warna tidak valid')),
  fonts: z.record(z.enum(FONT_ROLES.map((f) => f.role) as [ThemeFontRole, ...ThemeFontRole[]]), z.enum(FONT_IDS as [string, ...string[]])),
  particles: z.enum(Object.keys(PARTICLE_OPTIONS) as [ParticleMode, ...ParticleMode[]]),
  show_in_gallery: z.boolean(),
})
export type CustomThemeInput = z.infer<typeof customThemeSchema>

/** Membaca FormData formulir tema. */
export function readThemeForm(fd: FormData): unknown {
  const colors: Record<string, string> = {}
  for (const c of COLOR_KEYS) colors[c.key] = String(fd.get(`color_${c.key}`) ?? '')
  const fonts: Record<string, string> = {}
  for (const f of FONT_ROLES) fonts[f.role] = String(fd.get(`font_${f.role}`) ?? '')
  return {
    name: String(fd.get('name') ?? ''),
    slug: String(fd.get('slug') ?? ''),
    description: String(fd.get('description') ?? ''),
    base_theme: String(fd.get('base_theme') ?? ''),
    colors,
    fonts,
    particles: String(fd.get('particles') ?? 'tema'),
    show_in_gallery: fd.get('show_in_gallery') === 'on',
  }
}

/** Nilai awal formulir tema baru dari tema dasar. */
export function themeDefaults(base: ThemeName) {
  return { colors: { ...THEMES[base].palette }, fonts: { ...THEMES[base].fonts } }
}
