import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TextsEditor } from '@/components/admin/TextsEditor'
import { InvitationView } from '@/components/invitation/InvitationView'
import { demoInvitation, kindFromSlug, kindSlug } from '@/lib/demo'
import { ageLabel, displayName, eventTitle, KIND_IDS, KINDS } from '@/lib/kinds'
import { defaultTemplate, fillWaMessage, TEXT_TEMPLATES, templatesFor, type TextTemplateId } from '@/lib/text-templates'
import type { InvitationFull } from '@/lib/types'
import { invitationSchema } from '@/lib/validation'
import { THEME_NAMES, THEMES } from '@/themes'
import { makeInvitation } from '../fixtures/invitation'

const birthday = (o: Partial<InvitationFull> = {}) =>
  makeInvitation({
    kind: 'ultah_anak',
    age: 5,
    groom_name: 'Kayla Putri',
    groom_nickname: 'Kayla',
    groom_parents: 'Putri dari Bapak Budi & Ibu Ani',
    bride_name: null,
    bride_nickname: null,
    bride_parents: null,
    ...o,
  })

const render = (inv: InvitationFull) => renderToStaticMarkup(<InvitationView invitation={inv} guestName="Rina" guestCode={null} wishes={[]} />)

describe('kinds', () => {
  it('nama tampil: pasangan untuk pernikahan, satu nama untuk ulang tahun', () => {
    expect(displayName(makeInvitation())).toBe('Budi & Ani')
    expect(displayName(birthday())).toBe('Kayla')
  })

  it('label usia dan judul acara', () => {
    expect(ageLabel('pernikahan', 5)).toBeNull()
    expect(ageLabel('ultah_anak', null)).toBeNull()
    expect(ageLabel('ultah_anak', 5)).toBe('Ulang Tahun ke-5')
    expect(ageLabel('ultah_syukur', 70)).toBe('Syukuran 70 Tahun')
    expect(eventTitle(makeInvitation())).toBe('Pernikahan Budi & Ani')
    expect(eventTitle(birthday())).toBe('Ulang Tahun ke-5 Kayla')
    expect(eventTitle(birthday({ age: null }))).toBe('Ulang Tahun Kayla')
  })

  it('setiap jenis punya template teks, tema bawaan yang ada, dan minimal satu acara bawaan', () => {
    for (const k of KIND_IDS) {
      expect(templatesFor(k).length).toBeGreaterThan(0)
      expect(THEME_NAMES).toContain(KINDS[k].defaultTheme)
      expect(KINDS[k].eventNames.length).toBeGreaterThan(0)
    }
  })

  it('setiap tema cocok untuk minimal satu jenis', () => {
    for (const t of THEME_NAMES) expect(THEMES[t].suits.length).toBeGreaterThan(0)
  })
})

describe('template ulang tahun', () => {
  const birthdayIds = (Object.keys(TEXT_TEMPLATES) as TextTemplateId[]).filter((id) => TEXT_TEMPLATES[id].kind !== 'pernikahan')

  it('pesan WA memuat {tamu}, {nama}, {link} dan tidak menyebut pernikahan', () => {
    for (const id of birthdayIds) {
      const t = TEXT_TEMPLATES[id]
      for (const code of ['{tamu}', '{nama}', '{link}']) expect(t.wa, id).toContain(code)
      for (const text of [t.intro, t.closing, t.wa]) expect(text.toLowerCase(), id).not.toContain('pernikahan')
    }
  })

  it('setiap teks dalam batas panjang kolom database', () => {
    for (const id of Object.keys(TEXT_TEMPLATES) as TextTemplateId[]) {
      const t = TEXT_TEMPLATES[id]
      expect(t.intro.length, id).toBeLessThanOrEqual(500)
      expect(t.closing.length, id).toBeLessThanOrEqual(500)
      expect(t.opening.length, id).toBeLessThanOrEqual(1000)
      expect(t.wa.length, id).toBeLessThanOrEqual(1500)
    }
  })

  it('{nama} diganti nama yang berulang tahun', () => {
    const out = fillWaMessage('{tamu} - {nama} - {link}', { guestName: 'Rina', coupleName: 'Kayla', link: 'https://x/k' })
    expect(out).toBe('Rina - Kayla - https://x/k')
  })
})

describe('invitationSchema: jenis undangan', () => {
  const base = {
    slug: 'ultah-kayla-5',
    theme: 'ceria',
    timezone: 'Asia/Jakarta',
    groom_name: 'Kayla Putri',
    groom_nickname: 'Kayla',
    groom_parents: '',
    bride_name: '',
    bride_nickname: '',
    bride_parents: '',
    opening_text: '',
    intro_text: 'Halo',
    closing_text: 'Terima kasih',
    wa_message: '{tamu} {link}',
  }

  it('ulang tahun tidak butuh mempelai wanita; data mempelai wanita dikosongkan', () => {
    const r = invitationSchema.safeParse({ ...base, kind: 'ultah_anak', age: '5', bride_name: 'Sisa', bride_nickname: 'Sisa' })
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.data).toMatchObject({ kind: 'ultah_anak', age: 5, bride_name: null, bride_nickname: null, bride_parents: null })
  })

  it('pernikahan tetap wajib dua mempelai dan usia diabaikan', () => {
    expect(invitationSchema.safeParse({ ...base, kind: 'pernikahan', age: '5' }).success).toBe(false)
    const ok = invitationSchema.safeParse({ ...base, kind: 'pernikahan', age: '5', bride_name: 'Ani L', bride_nickname: 'Ani' })
    expect(ok.success && ok.data.age).toBeNull()
  })

  it('jenis kosong (formulir lama) dianggap pernikahan; usia kosong boleh', () => {
    const r = invitationSchema.safeParse({ ...base, kind: '', age: '', bride_name: 'Ani L', bride_nickname: 'Ani' })
    expect(r.success && r.data.kind).toBe('pernikahan')
  })

  it('usia di luar 1 sampai 150 ditolak', () => {
    for (const age of ['0', '151', 'abc']) {
      expect(invitationSchema.safeParse({ ...base, kind: 'ultah_dewasa', age }).success, age).toBe(false)
    }
  })

  it('tema baru diterima, tema asing ditolak', () => {
    expect(invitationSchema.safeParse({ ...base, kind: 'ultah_anak', theme: 'pastel' }).success).toBe(true)
    expect(invitationSchema.safeParse({ ...base, kind: 'ultah_anak', theme: 'neon' }).success).toBe(false)
  })
})

describe('InvitationView: ulang tahun', () => {
  it('sampul dan bagian tokoh memakai bahasa ulang tahun', () => {
    const html = render(birthday({ theme: 'ceria' }))
    for (const text of ['Undangan Ulang Tahun', 'Ulang Tahun ke-5', 'Yang Berulang Tahun', 'Menuju Pesta Ulang Tahun', 'data-theme="ceria"']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('Undangan Pernikahan')
  })

  it('pernikahan lama tetap sama', () => {
    const html = render(makeInvitation())
    for (const text of ['Undangan Pernikahan', 'Menuju Hari Bahagia', 'Kami yang berbahagia,']) expect(html).toContain(text)
  })
})

describe('TextsEditor per jenis', () => {
  it('undangan ulang tahun anak baru memakai template anak dan kode {nama}', () => {
    const html = renderToStaticMarkup(<TextsEditor kind="ultah_anak" errors={{}} />)
    expect(defaultTemplate('ultah_anak')).toBe('anak')
    expect(html).toContain('<option value="anak" selected="">')
    expect(html).not.toContain('value="kristen"')
    expect(html).toContain('{nama} = nama yang berulang tahun')
  })
})

describe('contoh undangan', () => {
  it('slug jenis bolak-balik', () => {
    for (const k of KIND_IDS) expect(kindFromSlug(kindSlug(k))).toBe(k)
    expect(kindFromSlug('ultah_anak')).toBeNull()
  })

  it('data contoh lolos validasi formulir untuk setiap jenis', () => {
    for (const k of KIND_IDS) {
      const d = demoInvitation(k, KINDS[k].defaultTheme)
      const r = invitationSchema.safeParse({
        ...d,
        age: d.age === null ? '' : String(d.age),
        groom_parents: d.groom_parents ?? '',
        bride_name: d.bride_name ?? '',
        bride_nickname: d.bride_nickname ?? '',
        bride_parents: d.bride_parents ?? '',
        opening_text: d.opening_text ?? '',
      })
      expect(r.success, k).toBe(true)
    }
  })
})
