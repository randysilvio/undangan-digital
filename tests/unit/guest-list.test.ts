import { describe, expect, it } from 'vitest'
import { canShareListViaWa, guestListMessage } from '@/lib/guest-list'

const base = { coupleName: 'Budi & Ani', siteUrl: 'https://x.app', slug: 'budi-ani' }

describe('guestListMessage', () => {
  it('nomor, nama, dan link pribadi tiap tamu, urut sesuai daftar', () => {
    const text = guestListMessage({
      ...base,
      guests: [
        { name: 'Pak Joko', code: 'k3x9qa' },
        { name: 'Bu Siti, Bandung', code: 'm2p7zt' },
      ],
    })
    expect(text).toBe(`Daftar link undangan *Budi & Ani* (2 tamu).
Kirim setiap link ke tamu yang namanya tertulis di atasnya.

1. Pak Joko
https://x.app/budi-ani?to=Pak+Joko&g=k3x9qa

2. Bu Siti, Bandung
https://x.app/budi-ani?to=Bu+Siti%2C+Bandung&g=m2p7zt`)
  })

  it('nama dengan tanda kutip dan emoji tetap utuh, link aman', () => {
    const text = guestListMessage({ ...base, guests: [{ name: 'Om "Bob" 🎉', code: 'aaaaaa' }] })
    expect(text).toContain('1. Om "Bob" 🎉\n')
    expect(text).toContain('https://x.app/budi-ani?to=Om+%22Bob%22+%F0%9F%8E%89&g=aaaaaa')
  })

  it('satu tamu ditulis "1 tamu"', () => {
    expect(guestListMessage({ ...base, guests: [{ name: 'A', code: 'aaaaaa' }] })).toContain('(1 tamu)')
  })
})

describe('canShareListViaWa', () => {
  const guests = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `Tamu Nomor ${i + 1}`, code: 'abcdef' }))

  it('daftar pendek bisa lewat tombol WA', () => {
    expect(canShareListViaWa(guestListMessage({ ...base, guests: guests(10) }))).toBe(true)
  })

  it('daftar panjang (100 tamu) terlalu panjang untuk link WhatsApp', () => {
    expect(canShareListViaWa(guestListMessage({ ...base, guests: guests(100) }))).toBe(false)
  })
})
