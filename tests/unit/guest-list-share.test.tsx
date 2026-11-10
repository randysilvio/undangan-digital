import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { GuestListShare } from '@/components/admin/GuestListShare'

const guests = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `Tamu ${i + 1}`, code: 'abcdef' }))
const html = (n: number) =>
  renderToStaticMarkup(<GuestListShare coupleName="Budi & Ani" siteUrl="https://x.app" slug="budi-ani" guests={guests(n)} />)

describe('GuestListShare', () => {
  it('menampilkan jumlah tamu, Salin daftar, dan Kirim WA berisi daftar', () => {
    const out = html(3)
    expect(out).toContain('3 tamu')
    expect(out).toContain('Salin daftar')
    const href = out.match(/href="(https:\/\/wa\.me\/[^"]+)"/)?.[1].replace(/&amp;/g, '&')
    expect(href?.startsWith('https://wa.me/?text=')).toBe(true)
    expect(new URL(href!).searchParams.get('text')).toContain('3. Tamu 3\nhttps://x.app/budi-ani?to=Tamu+3&g=abcdef')
  })

  it('daftar panjang: hanya Salin daftar, dengan penjelasan', () => {
    const out = html(100)
    expect(out).toContain('Salin daftar')
    expect(out).not.toContain('wa.me')
    expect(out).toContain('terlalu panjang')
  })

  it('tanpa tamu: tidak ada tombol', () => {
    const out = html(0)
    expect(out).toContain('Belum ada tamu')
    expect(out).not.toContain('Salin daftar')
  })
})
