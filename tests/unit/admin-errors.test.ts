import { describe, expect, it } from 'vitest'
import { mapDbError } from '@/lib/data/errors'

describe('mapDbError', () => {
  it('slug ganda → error di field slug', () => {
    expect(mapDbError({ code: '23505' })).toEqual({ slug: 'Alamat ini sudah dipakai undangan lain' })
  })
  it('error lain → pesan umum', () => {
    expect(mapDbError({ code: 'x' })).toBe('Gagal menyimpan, coba lagi')
  })
  it('error tanpa kode → pesan umum', () => {
    expect(mapDbError({})).toBe('Gagal menyimpan, coba lagi')
  })
})
