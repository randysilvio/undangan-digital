import { describe, expect, it } from 'vitest'
import { parseGiftsForm, parseInvitationForm, prepareGuestPaste } from '@/lib/admin-forms'

const base: Record<string, string> = {
  slug: 'budi-ani',
  theme: 'elegan',
  timezone: 'Asia/Jayapura',
  groom_name: 'Budi Santoso',
  groom_nickname: 'Budi',
  groom_parents: '',
  bride_name: 'Ani Lestari',
  bride_nickname: 'Ani',
  bride_parents: '',
  opening_text: '',
}
const ev = { name: 'Akad', date: '2026-12-12', start_time: '08:00', end_time: '', venue_name: 'Masjid', address: 'Jl. A', maps_url: '' }

const fd = (o: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) f.set(k, v)
  return f
}

describe('parseInvitationForm', () => {
  it('membaca data undangan dan daftar acara', () => {
    const r = parseInvitationForm(fd({ ...base, events: JSON.stringify([ev]) }))
    expect(r.fieldErrors).toBeUndefined()
    expect(r.data?.invitation.slug).toBe('budi-ani')
    expect(r.data?.events).toEqual([{ ...ev, end_time: null, maps_url: null }])
  })
  it('error acara diberi kunci events.<urutan>.<field>', () => {
    const r = parseInvitationForm(fd({ ...base, events: JSON.stringify([ev, { ...ev, date: 'besok' }]) }))
    expect(r.fieldErrors?.['events.1.date']).toBe('Tanggal tidak valid')
    expect(r.data).toBeUndefined()
  })
  it('JSON acara rusak → error umum acara', () => {
    expect(parseInvitationForm(fd({ ...base, events: '{' })).fieldErrors?.events).toBe('Data acara tidak valid')
  })
  it('error undangan dan acara dikumpulkan bersama', () => {
    const r = parseInvitationForm(fd({ ...base, slug: 'admin', events: JSON.stringify([{ ...ev, venue_name: '' }]) }))
    expect(r.fieldErrors).toMatchObject({ slug: 'Alamat ini tidak bisa dipakai', 'events.0.venue_name': 'Wajib diisi' })
  })
  it('maksimal 10 acara', () => {
    expect(parseInvitationForm(fd({ ...base, events: JSON.stringify(Array(11).fill(ev)) })).fieldErrors?.events).toBe(
      'Maksimal 10 acara',
    )
  })
})

describe('prepareGuestPaste', () => {
  it('melewati nama yang sudah ada di daftar (tanpa beda huruf besar/kecil)', () => {
    expect(prepareGuestPaste('Pak Joko\nBu Sri\nAni', ['pak joko'])).toEqual({
      guests: [
        { name: 'Bu Sri', phone: null },
        { name: 'Ani', phone: null },
      ],
      skipped: 1,
    })
  })
  it('menghitung duplikat di tempelan sebagai dilewati', () => {
    expect(prepareGuestPaste('A\na\nB', [])).toMatchObject({ skipped: 1 })
  })
  it('maksimal 500 tamu sekali tempel', () => {
    const text = Array.from({ length: 501 }, (_, i) => `Tamu ${i}`).join('\n')
    expect(prepareGuestPaste(text, [])).toEqual({ error: 'Maksimal 500 tamu sekali tempel' })
  })
  it('tempelan kosong → error', () => {
    expect(prepareGuestPaste('  \n ', [])).toEqual({ error: 'Tempel minimal satu nama' })
  })
})

describe('parseGiftsForm', () => {
  it('membaca daftar rekening', () => {
    const g = { provider: 'BCA', account_number: '123 456', account_holder: 'Budi' }
    expect(parseGiftsForm(fd({ gifts: JSON.stringify([g]) })).data).toEqual([g])
  })
  it('error rekening diberi kunci gifts.<urutan>.<field>', () => {
    const r = parseGiftsForm(fd({ gifts: JSON.stringify([{ provider: '', account_number: '1', account_holder: 'A' }]) }))
    expect(r.fieldErrors).toMatchObject({ 'gifts.0.provider': 'Wajib diisi', 'gifts.0.account_number': 'Nomor hanya angka (5–30 digit)' })
  })
})
