import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { InvitationView } from '@/components/invitation/InvitationView'
import { parseInvitationForm } from '@/lib/admin-forms'
import { demoInvitation } from '@/lib/demo'
import { ageLabel, displayName, eventTitle, isJoint } from '@/lib/kinds'
import { formatTanggalLahir } from '@/lib/time'
import type { InvitationFull } from '@/lib/types'
import { makeInvitation } from '../fixtures/invitation'

const joint = (o: Partial<InvitationFull> = {}) =>
  makeInvitation({
    kind: 'ultah_anak',
    theme: 'ceria',
    groom_name: 'Kayla Putri',
    groom_nickname: 'Kayla',
    bride_name: 'Bima Putra',
    bride_nickname: 'Bima',
    age: 5,
    age2: 3,
    birth_date: '2022-03-12',
    birth_date2: '2024-08-08',
    ...o,
  })

describe('nama & usia ulang tahun bersama', () => {
  it('label usia gabungan', () => {
    expect(ageLabel('ultah_anak', 5, 3)).toBe('Ulang Tahun ke-5 & ke-3')
    expect(ageLabel('ultah_syukur', 70, 65)).toBe('Syukuran 70 & 65 Tahun')
    expect(ageLabel('ultah_anak', 5)).toBe('Ulang Tahun ke-5')
    expect(ageLabel('pernikahan', 5, 3)).toBeNull()
  })
  it('nama gabungan dan judul acara', () => {
    const inv = joint()
    expect(isJoint(inv)).toBe(true)
    expect(displayName(inv)).toBe('Kayla & Bima')
    expect(eventTitle(inv)).toBe('Ulang Tahun Kayla & Bima')
    expect(isJoint(makeInvitation())).toBe(false)
  })
  it('tanggal lahir tanpa nama hari', () => {
    expect(formatTanggalLahir('2022-03-12')).toBe('12 Maret 2022')
  })
})

describe('tampilan ulang tahun bersama', () => {
  const html = (inv: InvitationFull) => renderToStaticMarkup(<InvitationView invitation={inv} guestName="Pak Joko" guestCode={null} wishes={[]} />)

  it('dua kartu dengan usia & tanggal lahir masing-masing, sampul memuat keduanya', () => {
    const out = html(joint())
    expect(out).toContain('Kayla &amp; Bima')
    expect(out).toContain('Ulang Tahun ke-5 &amp; ke-3')
    expect(out).toContain('Lahir 12 Maret 2022')
    expect(out).toContain('Lahir 8 Agustus 2024')
    expect(out).toContain('>Ulang Tahun ke-5<')
    expect(out).toContain('>Ulang Tahun ke-3<')
  })
  it('usia kedua kosong: sampul tidak menampilkan usia yang menyesatkan', () => {
    const out = html(joint({ age2: null }))
    expect(out).not.toContain('Ulang Tahun ke-5 &amp;')
    expect(out).not.toMatch(/<p[^>]*font-heading text-2xl[^>]*>Ulang Tahun ke-5<\/p>/)
  })
  it('ulang tahun satu orang tetap seperti sebelumnya, ditambah tanggal lahir bila ada', () => {
    const out = html(makeInvitation({ kind: 'ultah_anak', bride_name: null, bride_nickname: null, age: 5, birth_date: '2022-03-12' }))
    expect(out).toContain('Ulang Tahun ke-5')
    expect(out).toContain('Lahir 12 Maret 2022')
    expect(out).not.toContain('&amp; ke-')
  })
  it('contoh syukuran memakai Opa & Oma dengan usia berbeda', () => {
    const out = html(demoInvitation('ultah_syukur', 'botani'))
    expect(out).toContain('Opa Slamet &amp; Oma Sri')
    expect(out).toContain('Syukuran 70 &amp; 65 Tahun')
    expect(out).toContain('Lahir 17 April 1957')
  })
})

describe('formulir ulang tahun bersama', () => {
  const base: Record<string, string> = {
    slug: 'ultah-kayla-bima',
    kind: 'ultah_anak',
    theme: 'ceria',
    timezone: 'Asia/Jakarta',
    groom_name: 'Kayla Putri',
    groom_nickname: 'Kayla',
    age: '5',
    birth_date: '2022-03-12',
    bride_name: 'Bima Putra',
    bride_nickname: 'Bima',
    age2: '3',
    birth_date2: '2024-08-08',
    intro_text: 'a',
    closing_text: 'b',
    wa_message: '{link}',
    events: '[]',
  }
  const fd = (o: Record<string, string>) => {
    const f = new FormData()
    for (const [k, v] of Object.entries(o)) f.set(k, v)
    return f
  }

  it('dicentang: data orang kedua disimpan', () => {
    const r = parseInvitationForm(fd({ ...base, joint: 'on' }))
    expect(r.fieldErrors).toBeUndefined()
    expect(r.data?.invitation).toMatchObject({ bride_nickname: 'Bima', age: 5, age2: 3, birth_date: '2022-03-12', birth_date2: '2024-08-08' })
    expect(r.data?.invitation).not.toHaveProperty('joint')
  })
  it('tidak dicentang: data orang kedua dikosongkan', () => {
    const r = parseInvitationForm(fd(base))
    expect(r.data?.invitation).toMatchObject({ bride_name: null, bride_nickname: null, age2: null, birth_date2: null, birth_date: '2022-03-12' })
  })
  it('dicentang tanpa nama orang kedua: error', () => {
    const r = parseInvitationForm(fd({ ...base, joint: 'on', bride_name: '', bride_nickname: '' }))
    expect(r.fieldErrors).toMatchObject({ bride_name: 'Wajib diisi', bride_nickname: 'Wajib diisi' })
  })
  it('tanggal lahir di masa depan atau tidak valid ditolak', () => {
    const r = parseInvitationForm(fd({ ...base, joint: 'on', birth_date: '2999-01-01', birth_date2: '2024-02-30' }))
    expect(r.fieldErrors?.birth_date).toBe('Tanggal lahir tidak boleh di masa depan')
    expect(r.fieldErrors?.birth_date2).toBe('Tanggal tidak valid')
  })
  it('pernikahan: usia & tanggal lahir dikosongkan, mempelai tetap', () => {
    const r = parseInvitationForm(fd({ ...base, kind: 'pernikahan', theme: 'elegan', joint: 'on' }))
    expect(r.data?.invitation).toMatchObject({ age: null, age2: null, birth_date: null, birth_date2: null, bride_nickname: 'Bima' })
  })
})
