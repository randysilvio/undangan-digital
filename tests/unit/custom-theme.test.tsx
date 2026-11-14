import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { InvitationView } from '@/components/invitation/InvitationView'
import { parseInvitationForm } from '@/lib/admin-forms'
import {
  contrastRatio,
  contrastWarnings,
  cssUrl,
  customThemeAttrs,
  customThemeSchema,
  customThemeStyle,
  isThemeAssetUrl,
  readThemeForm,
  themeColors,
} from '@/lib/custom-theme'
import { parseSettingsForm } from '@/lib/site-settings'
import type { CustomTheme } from '@/lib/types'
import { THEMES } from '@/themes'
import { makeInvitation } from '../fixtures/invitation'

const SB = 'https://abc.supabase.co'
const ID = '11111111-2222-3333-4444-555555555555'
const asset = (name: string) => `${SB}/storage/v1/object/public/media/themes/${ID}/${name}`

const theme = (o: Partial<CustomTheme> = {}): CustomTheme => ({
  id: ID,
  slug: 'batik-jawa',
  name: 'Batik Jawa',
  description: null,
  base_theme: 'elegan',
  colors: { accent: '#8b5a2b' },
  fonts: { heading: 'playfair' },
  assets: {},
  particles: 'tema',
  show_in_gallery: false,
  created_at: '2026-11-15T00:00:00Z',
  updated_at: '2026-11-15T00:00:00Z',
  ...o,
})

const fd = (o: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) f.set(k, v)
  return f
}

describe('URL gambar tema', () => {
  it('hanya menerima file di folder themes pada bucket media proyek', () => {
    expect(isThemeAssetUrl(asset('corner-a.webp'), SB)).toBe(true)
    expect(isThemeAssetUrl(`${SB}/storage/v1/object/public/media/${ID}/x.webp`, SB)).toBe(false)
    expect(isThemeAssetUrl(`https://evil.example/storage/v1/object/public/media/themes/${ID}/x.webp`, SB)).toBe(false)
    expect(isThemeAssetUrl(asset('../x.webp'), SB)).toBe(false)
    expect(isThemeAssetUrl(asset('a/b.webp'), SB)).toBe(false)
  })
  it('cssUrl menolak karakter yang bisa keluar dari url("…")', () => {
    expect(cssUrl(asset('a.webp'))).toBe(`url("${asset('a.webp')}")`)
    expect(cssUrl('https://x.test/a.webp");background:red;("')).toBeNull()
    expect(cssUrl('javascript:alert(1)')).toBeNull()
    expect(cssUrl(undefined)).toBeNull()
  })
})

describe('gaya tema kustom', () => {
  it('menimpa warna & huruf yang diisi saja, warna tidak valid diabaikan', () => {
    const s = customThemeStyle(theme({ colors: { accent: '#8b5a2b', bg: 'red' } })) as Record<string, string>
    expect(s['--inv-accent']).toBe('#8b5a2b')
    expect(s['--inv-bg']).toBeUndefined()
    expect(s['--inv-heading']).toContain('--font-playfair')
  })
  it('penanda data-has-* hanya untuk gambar yang ada', () => {
    const a = customThemeAttrs(theme({ assets: { corner: asset('c.webp'), texture: 'http://tidak-aman' } }))
    expect(a).toHaveProperty('data-has-corner')
    expect(a).not.toHaveProperty('data-has-texture')
    expect(customThemeAttrs(null)).toEqual({})
  })
  it('themeColors melengkapi dari tema dasar', () => {
    const c = themeColors(theme())
    expect(c.accent).toBe('#8b5a2b')
    expect(c.bg).toBe(THEMES.elegan.palette.bg)
  })
  it('peringatan kontras', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    expect(contrastWarnings({ ...THEMES.elegan.palette, text: '#f7f1e8' })).toHaveLength(2)
    expect(contrastWarnings(THEMES.mewah.palette)).toEqual([])
  })
})

describe('formulir tema', () => {
  const base = {
    name: 'Batik Jawa',
    slug: 'Batik-Jawa',
    description: '',
    base_theme: 'elegan',
    color_bg: '#f7f1e8',
    color_surface: '#fffaf3',
    color_text: '#3d3329',
    color_muted: '#7a6a58',
    color_accent: '#8b5a2b',
    color_on_accent: '#ffffff',
    color_line: '#e6d9c3',
    font_heading: 'playfair',
    font_body: 'lato',
    font_names: 'great-vibes',
    particles: 'jatuh',
    show_in_gallery: 'on',
  }
  it('valid: slug dikecilkan, galeri dicentang', () => {
    const r = customThemeSchema.parse(readThemeForm(fd(base)))
    expect(r).toMatchObject({ slug: 'batik-jawa', show_in_gallery: true, particles: 'jatuh', description: null })
  })
  it('menolak slug tema bawaan, warna & huruf tidak dikenal', () => {
    const r = customThemeSchema.safeParse(readThemeForm(fd({ ...base, slug: 'elegan', color_bg: 'merah', font_body: 'comic-sans' })))
    expect(r.success).toBe(false)
    const paths = r.error!.issues.map((i) => i.path[0])
    expect(paths).toEqual(expect.arrayContaining(['slug', 'colors', 'fonts']))
  })
})

describe('pilihan tema kustom di formulir undangan', () => {
  const inv = {
    slug: 'budi-ani',
    timezone: 'Asia/Jakarta',
    groom_name: 'Budi',
    groom_nickname: 'Budi',
    bride_name: 'Ani',
    bride_nickname: 'Ani',
    intro_text: 'a',
    closing_text: 'b',
    wa_message: '{link}',
    events: '[]',
  }
  it('"custom:<uuid>" menjadi custom_theme_id', () => {
    const r = parseInvitationForm(fd({ ...inv, theme: `custom:${ID}` }))
    expect(r.data?.invitation.custom_theme_id).toBe(ID)
  })
  it('tema bawaan: custom_theme_id null', () => {
    const r = parseInvitationForm(fd({ ...inv, theme: 'botani' }))
    expect(r.data?.invitation).toMatchObject({ theme: 'botani', custom_theme_id: null })
  })
  it('nilai custom rusak ditolak', () => {
    expect(parseInvitationForm(fd({ ...inv, theme: 'custom:xyz' })).fieldErrors?.theme).toBeDefined()
  })
})

describe('undangan dengan tema kustom', () => {
  const html = (ct: CustomTheme | null) =>
    renderToStaticMarkup(<InvitationView invitation={makeInvitation({ custom_theme: ct, custom_theme_id: ct?.id ?? null })} guestName="Pak Joko" guestCode={null} wishes={[]} />)

  it('undangan lama tanpa tema kustom tidak berubah', () => {
    const out = html(null)
    expect(out).not.toContain('data-custom-theme')
    expect(out).not.toContain('--inv-accent')
  })
  it('memasang variabel, penanda, gambar sampul, dan partikel gambar', () => {
    const out = html(theme({ assets: { cover_bg: asset('cover.webp'), particle: asset('p.webp'), ornament: asset('o.webp') }, particles: 'naik' }))
    expect(out).toContain('data-custom-theme="batik-jawa"')
    expect(out).toContain('--inv-accent:#8b5a2b')
    expect(out).toContain('data-has-ornament')
    expect(out).toContain(asset('cover.webp'))
    expect(out).toContain('data-mode="rise"')
    expect(out).toContain(`src="${asset('p.webp')}"`)
  })
  it('partikel bisa dimatikan', () => {
    expect(html(theme({ particles: 'mati' }))).not.toContain('inv-ambient')
  })
  it('kredit hanya tampil bila diminta', () => {
    expect(html(null)).not.toContain('Undangan digital oleh')
    const out = renderToStaticMarkup(
      <InvitationView invitation={makeInvitation()} guestName={null} guestCode={null} wishes={[]} credit={{ label: 'Valynz.id', href: 'https://valynz.id' }} />,
    )
    expect(out).toContain('Undangan digital oleh')
  })
})

describe('Pengaturan Situs', () => {
  it('menormalkan WhatsApp & Instagram, paket kosong dilewati', () => {
    const r = parseSettingsForm(
      fd({
        whatsapp: '0812-3456-7890',
        instagram: 'https://instagram.com/valynz.id/',
        email: '',
        package_0_name: 'Favorit',
        package_0_price: 'Rp149.000',
        package_0_features: 'Link tamu tanpa batas\r\n\r\nMusik',
        package_0_highlight: 'on',
        show_credit: 'on',
      }),
    )
    expect(r).toEqual({
      data: {
        whatsapp: '6281234567890',
        instagram: 'valynz.id',
        email: null,
        packages: [{ name: 'Favorit', price: 'Rp149.000', features: ['Link tamu tanpa batas', 'Musik'], highlight: true }],
        show_credit: true,
      },
    })
  })
  it('error per kolom', () => {
    const r = parseSettingsForm(fd({ whatsapp: '123', email: 'bukan-email', package_1_features: 'x' }))
    expect('fieldErrors' in r && r.fieldErrors).toMatchObject({
      whatsapp: expect.any(String),
      email: expect.any(String),
      package_1_name: expect.any(String),
      package_1_price: expect.any(String),
    })
  })
})

describe('cssUrl lokal', () => {
  it('http hanya untuk Supabase lokal', () => {
    expect(cssUrl('http://127.0.0.1:54321/storage/v1/object/public/media/themes/x/a.png')).not.toBeNull()
    expect(cssUrl('http://evil.example/a.png')).toBeNull()
    expect(cssUrl('http://127.0.0.1.evil.example/a.png')).toBeNull()
  })
})
