import { describe, expect, it } from 'vitest'
import { canPublish } from '@/lib/publish'
import { checkUpload } from '@/lib/upload'
import { safeRedirect } from '@/lib/safe-redirect'
import { makeInvitation } from '../fixtures/invitation'

describe('canPublish', () => {
  it('menolak undangan tanpa acara', () => {
    expect(canPublish(makeInvitation({ events: [] }))).toBe('Tambahkan minimal satu acara sebelum menerbitkan')
  })
  it('mengizinkan undangan lengkap', () => {
    expect(canPublish(makeInvitation())).toBeNull()
  })
})

describe('checkUpload', () => {
  it('foto maksimal 5 MB', () => {
    expect(checkUpload({ type: 'image/jpeg', size: 6e6 }, 'photo')).toBe('Ukuran foto maksimal 5 MB')
  })
  it('foto format lain ditolak', () => {
    expect(checkUpload({ type: 'image/heic', size: 1e6 }, 'photo')).toBe('Format foto tidak didukung, gunakan JPG atau PNG')
  })
  it('musik harus MP3', () => {
    expect(checkUpload({ type: 'audio/wav', size: 1e6 }, 'music')).toBe('Musik harus berformat MP3')
  })
  it('musik maksimal 10 MB', () => {
    expect(checkUpload({ type: 'audio/mpeg', size: 11e6 }, 'music')).toBe('Ukuran musik maksimal 10 MB')
  })
  it('foto PNG kecil diterima', () => {
    expect(checkUpload({ type: 'image/png', size: 1e6 }, 'photo')).toBeNull()
  })
})

describe('safeRedirect', () => {
  it('mengizinkan path admin', () => {
    expect(safeRedirect('/admin/x')).toBe('/admin/x')
  })
  it.each(['//evil.com', 'https://evil.com', '/lain', '/admin@evil.com', null, undefined])('menolak %s', (bad) => {
    expect(safeRedirect(bad)).toBe('/admin')
  })
})
