import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { InvitationView } from '@/components/invitation/InvitationView'
import type { InvitationFull } from '@/lib/types'
import { THEMES } from '@/themes'
import { makeInvitation } from '../fixtures/invitation'

const html = (o: Partial<InvitationFull> = {}, guest: string | null = 'Pak Joko') =>
  renderToStaticMarkup(<InvitationView invitation={makeInvitation(o)} guestName={guest} guestCode={null} wishes={[]} />)

describe('InvitationView', () => {
  it('menampilkan nama tamu', () => {
    expect(html()).toContain('Pak Joko')
  })
  it('meng-escape nama tamu berisi tag', () => {
    const out = html({}, '<script>alert(1)</script>')
    expect(out).toContain('&lt;script&gt;')
    expect(out).not.toContain('<script>alert(1)')
  })
  it('tanpa nama tamu tetap menyapa umum', () => {
    expect(html({}, null)).toContain('Bapak/Ibu/Saudara/i')
  })
  it('menyembunyikan galeri bila kosong', () => {
    expect(html()).toContain('data-section="galeri"')
    expect(html({ gallery: [] })).not.toContain('data-section="galeri"')
  })
  it('menyembunyikan amplop bila kosong', () => {
    expect(html({ gifts: [] })).not.toContain('data-section="amplop"')
  })
  it('menyembunyikan pembuka bila kosong', () => {
    expect(html({ opening_text: null })).not.toContain('data-section="pembuka"')
  })
  it('menampilkan tanggal dan jam di zona undangan', () => {
    const out = html()
    expect(out).toContain('Sabtu, 12 Desember 2026')
    expect(out).toContain('08.00 WIT')
  })
  it('tombol peta hanya bila ada link peta', () => {
    const out = html()
    expect(out.match(/Lihat Peta/g)).toHaveLength(1)
    expect(out.match(/Simpan ke Kalender/g)).toHaveLength(2)
  })
  it('memakai tema undangan', () => {
    expect(html()).toContain('data-theme="elegan"')
  })
  it('mendukung tema modern', () => {
    expect(html({ theme: 'modern' })).toContain('data-theme="modern"')
  })
})

describe('THEMES', () => {
  it('berisi elegan dan modern', () => {
    expect(Object.keys(THEMES)).toEqual(['elegan', 'modern'])
  })
})
