import { describe, expect, it } from 'vitest'
import { guestCode, guestLink, parseGuestName, waMessage, waShareUrl } from '@/lib/links'

describe('parseGuestName', () => {
  it('merapikan spasi', () => {
    expect(parseGuestName('  Bu   Sri ')).toBe('Bu Sri')
  })
  it('memakai nilai pertama bila berupa array', () => {
    expect(parseGuestName(['A', 'B'])).toBe('A')
  })
  it('mengembalikan null bila kosong', () => {
    expect(parseGuestName(undefined)).toBeNull()
    expect(parseGuestName('   ')).toBeNull()
  })
  it('memotong ke 100 karakter (sama dengan batas nama tamu di admin)', () => {
    expect(parseGuestName('x'.repeat(150))).toHaveLength(100)
  })
  it('tidak memotong emoji di tengah', () => {
    const out = parseGuestName('a'.repeat(99) + '😀😀')!
    expect(out).toBe('a'.repeat(99) + '😀')
  })
  it('tidak mengubah teks berisi tag (escape dilakukan saat render)', () => {
    expect(parseGuestName('<script>alert(1)</script>')).toBe('<script>alert(1)</script>')
  })
})

describe('guestLink', () => {
  it('membuat link dengan nama dan kode tamu', () => {
    expect(guestLink('https://x.app/', 'budi-ani', { name: 'Pak Joko', code: 'ab12cd' })).toBe(
      'https://x.app/budi-ani?to=Pak+Joko&g=ab12cd',
    )
  })
  it('meng-encode karakter khusus dan melewati kode kosong', () => {
    expect(guestLink('https://x.app', 'budi-ani', { name: 'Bu Sri & Kel' })).toBe(
      'https://x.app/budi-ani?to=Bu+Sri+%26+Kel',
    )
  })
})

describe('guestCode', () => {
  it('menghasilkan 6 karakter huruf kecil/angka', () => {
    expect(guestCode()).toMatch(/^[a-z0-9]{6}$/)
  })
  it('praktis unik', () => {
    expect(new Set(Array.from({ length: 200 }, guestCode)).size).toBe(200)
  })
})

describe('waShareUrl', () => {
  it('memakai nomor yang dinormalisasi', () => {
    expect(waShareUrl('0812-3456-7890', 'Halo Pak')).toBe('https://wa.me/6281234567890?text=Halo%20Pak')
  })
  it('tanpa nomor tetap bisa dibagikan', () => {
    expect(waShareUrl(null, 'Halo')).toBe('https://wa.me/?text=Halo')
  })
  it('nomor tidak valid diperlakukan seperti tanpa nomor', () => {
    expect(waShareUrl('abc', 'Halo')).toBe('https://wa.me/?text=Halo')
  })
})

describe('waMessage', () => {
  it('memuat nama tamu, nama pasangan, dan link', () => {
    const m = waMessage({ guestName: 'Pak Joko', coupleName: 'Budi & Ani', link: 'https://x.app/budi-ani?to=Pak+Joko' })
    expect(m).toContain('*Pak Joko*')
    expect(m).toContain('*Budi & Ani*')
    expect(m).toContain('https://x.app/budi-ani?to=Pak+Joko')
    expect(m.startsWith('Kepada Yth.\n')).toBe(true)
  })
})
