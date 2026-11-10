import { describe, expect, it } from 'vitest'
import { isValidSlug, nextAvailableSlug, slugify } from '@/lib/slug'

describe('slugify', () => {
  it('mengubah nama pasangan menjadi slug', () => {
    expect(slugify('Budi & Ani')).toBe('budi-ani')
  })
  it('membuang diakritik dan tanda baca', () => {
    expect(slugify('Réza dan  Siti!!')).toBe('reza-dan-siti')
  })
  it('mengembalikan string kosong bila tidak ada karakter valid', () => {
    expect(slugify('---')).toBe('')
  })
  it('memotong ke 60 karakter', () => {
    expect(slugify('a'.repeat(80))).toHaveLength(60)
  })
})

describe('isValidSlug', () => {
  it('menerima slug yang benar', () => {
    expect(isValidSlug('budi-ani')).toBe(true)
  })
  it.each(['Budi', 'ab', 'admin', 'budi--ani', '-budi', 'a'.repeat(61)])('menolak %s', (bad) => {
    expect(isValidSlug(bad)).toBe(false)
  })
})

describe('nextAvailableSlug', () => {
  it('memakai slug dasar bila belum dipakai', () => {
    expect(nextAvailableSlug('budi-ani-salinan', [])).toBe('budi-ani-salinan')
  })
  it('menambah angka bila sudah dipakai', () => {
    expect(nextAvailableSlug('budi-ani-salinan', ['budi-ani-salinan', 'budi-ani-salinan-2'])).toBe('budi-ani-salinan-3')
  })
})
