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
  it('memakai kalimat pengantar & penutup milik undangan', () => {
    const out = html({ intro_text: 'Atas kasih karunia Tuhan Yesus <b>Kristus</b>', closing_text: 'Tuhan Yesus memberkati.' })
    expect(out).toContain('Atas kasih karunia Tuhan Yesus &lt;b&gt;Kristus&lt;/b&gt;')
    expect(out).toContain('Tuhan Yesus memberkati.')
    expect(out).not.toContain('ridho Tuhan Yang Maha Esa')
  })
  it('undangan lama (teks kosong) tetap memakai teks Umum', () => {
    const out = html({ intro_text: null, closing_text: null })
    expect(out).toContain('Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan:')
    expect(out).toContain('Merupakan suatu kebahagiaan dan kehormatan bagi kami')
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
  it('formulir RSVP terisi nama tamu dan membawa kode tamu', () => {
    const out = renderToStaticMarkup(
      <InvitationView invitation={makeInvitation()} guestName="Pak Joko" guestCode="ab12cd" wishes={[]} />,
    )
    expect(out).toContain('data-section="rsvp"')
    expect(out).toMatch(/name="name"[^>]*value="Pak Joko"/)
    expect(out).toMatch(/name="g"[^>]*value="ab12cd"/)
  })
  it('menampilkan ucapan tamu sebagai teks', () => {
    const out = renderToStaticMarkup(
      <InvitationView
        invitation={makeInvitation()}
        guestName={null}
        guestCode={null}
        wishes={[{ id: 'w1', invitation_id: 'inv-1', name: 'Sri', message: '<b>Selamat</b>', hidden: false, created_at: '2026-12-01T00:00:00Z' }]}
      />,
    )
    expect(out).toContain('&lt;b&gt;Selamat&lt;/b&gt;')
  })
  it('mendukung tema modern', () => {
    expect(html({ theme: 'modern' })).toContain('data-theme="modern"')
  })
})

describe('InvitationView: cerita, keluarga, dress code, animasi', () => {
  it('menyembunyikan cerita dan keluarga bila kosong', () => {
    const out = html()
    expect(out).not.toContain('data-section="cerita"')
    expect(out).not.toContain('data-section="keluarga"')
    expect(out).not.toContain('Dress code')
  })
  it('menampilkan garis waktu, keluarga per baris, dan dress code', () => {
    const out = html({
      kind: 'ultah_syukur',
      age: 70,
      bride_name: null,
      bride_nickname: null,
      story: [{ year: '1957', title: 'Lahir di Klaten', text: '' }],
      family: 'Budi & Ani\n\nSari & Hendra',
      dress_code: 'Batik',
    })
    expect(out).toContain('data-section="cerita"')
    expect(out).toContain('Perjalanan Hidup')
    expect(out).toContain('Lahir di Klaten')
    expect(out).toContain('Anak, Menantu &amp; Cucu')
    expect(out.match(/<li[^>]*class="font-heading text-lg/g)).toHaveLength(2)
    expect(out).toContain('Batik')
  })
  it('tanpa emoji; ikon berupa SVG dan partikel sesuai tema', () => {
    const out = html({ kind: 'ultah_anak', age: 5, bride_name: null, bride_nickname: null, theme: 'ceria' })
    expect(out).not.toMatch(/[✀-➿\u{1F000}-\u{1FFFF}]/u)
    expect(out).toContain('class="inv-ambient" data-mode="rise"')
    expect(html({ theme: 'modern' })).not.toContain('inv-ambient')
  })
})

describe('THEMES', () => {
  it('berisi enam tema, tema lama tetap ada', () => {
    expect(Object.keys(THEMES)).toEqual(['elegan', 'modern', 'botani', 'mewah', 'ceria', 'pastel'])
  })
})
