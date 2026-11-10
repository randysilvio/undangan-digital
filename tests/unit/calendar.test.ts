import { describe, expect, it } from 'vitest'
import { googleCalendarUrl } from '@/lib/calendar'

describe('googleCalendarUrl', () => {
  const u = new URL(
    googleCalendarUrl({
      title: 'Pernikahan Budi & Ani',
      date: '2026-12-12',
      startTime: '08:00',
      endTime: null,
      timezone: 'Asia/Jayapura',
      location: 'Gedung A, Jayapura',
    }),
  )
  it('mengarah ke template Google Calendar', () => {
    expect(u.origin + u.pathname).toBe('https://calendar.google.com/calendar/render')
    expect(u.searchParams.get('action')).toBe('TEMPLATE')
  })
  it('memakai waktu UTC sesuai zona undangan, durasi default 2 jam', () => {
    expect(u.searchParams.get('dates')).toBe('20261211T230000Z/20261212T010000Z')
  })
  it('memuat judul dan lokasi', () => {
    expect(u.searchParams.get('text')).toBe('Pernikahan Budi & Ani')
    expect(u.searchParams.get('location')).toBe('Gedung A, Jayapura')
  })
  it('memakai jam selesai bila ada', () => {
    const v = new URL(
      googleCalendarUrl({ title: 'x', date: '2026-12-12', startTime: '08:00', endTime: '09:30', timezone: 'Asia/Jakarta', location: '' }),
    )
    expect(v.searchParams.get('dates')).toBe('20261212T010000Z/20261212T023000Z')
  })
})
