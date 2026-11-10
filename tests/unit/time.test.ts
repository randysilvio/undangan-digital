import { describe, expect, it } from 'vitest'
import { eventInstant, formatJam, formatTanggal, timeLeft } from '@/lib/time'

describe('eventInstant', () => {
  it('memakai offset WIT (+9)', () => {
    expect(eventInstant('2026-12-12', '08:00', 'Asia/Jayapura').toISOString()).toBe('2026-12-11T23:00:00.000Z')
  })
  it('memakai offset WIB (+7)', () => {
    expect(eventInstant('2026-12-12', '08:00', 'Asia/Jakarta').toISOString()).toBe('2026-12-12T01:00:00.000Z')
  })
})

describe('timeLeft', () => {
  const now = new Date('2026-01-01T00:00:00Z')
  it('menghitung sisa waktu', () => {
    expect(timeLeft(new Date('2026-01-02T02:03:04Z'), now)).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4, done: false })
  })
  it('nol dan selesai bila sudah lewat', () => {
    expect(timeLeft(new Date('2025-12-31T00:00:00Z'), now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true })
  })
})

describe('format', () => {
  it('formatTanggal dalam bahasa Indonesia', () => {
    expect(formatTanggal('2026-12-12')).toBe('Sabtu, 12 Desember 2026')
  })
  it('formatJam dengan label zona', () => {
    expect(formatJam('08:00', 'Asia/Makassar')).toBe('08.00 WITA')
  })
})
