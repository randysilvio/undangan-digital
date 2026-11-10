import { describe, expect, it } from 'vitest'
import {
  eventSchema,
  fieldErrors,
  giftSchema,
  invitationSchema,
  parseGuestList,
  rsvpSchema,
  wishSchema,
} from '@/lib/validation'

const validInv = {
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
  intro_text: 'Dengan sukacita kami bermaksud melangsungkan pernikahan:',
  closing_text: 'Tuhan Yesus memberkati.',
  wa_message: 'Shalom {tamu}, undangan {mempelai}: {link}',
}

const validEvent = {
  name: 'Akad',
  date: '2026-12-12',
  start_time: '08:00',
  end_time: '',
  venue_name: 'Masjid Raya',
  address: 'Jl. Merdeka 1',
  maps_url: '',
}

const errs = (r: { success: boolean; error?: Parameters<typeof fieldErrors>[0] }) => {
  expect(r.success).toBe(false)
  return fieldErrors(r.error!)
}

describe('rsvpSchema', () => {
  it('mengubah jumlah orang menjadi angka', () => {
    expect(rsvpSchema.parse({ name: 'Joko', attendance: 'hadir', party_size: '2' }).party_size).toBe(2)
  })
  it('tidak hadir → jumlah orang 0', () => {
    expect(rsvpSchema.parse({ name: 'Joko', attendance: 'tidak', party_size: '5' }).party_size).toBe(0)
  })
  it('maksimal 10 orang', () => {
    expect(errs(rsvpSchema.safeParse({ name: 'J', attendance: 'hadir', party_size: '11' })).party_size).toBe('Maksimal 10 orang')
  })
  it('minimal 1 orang bila hadir', () => {
    expect(errs(rsvpSchema.safeParse({ name: 'J', attendance: 'hadir', party_size: '0' })).party_size).toBe('Minimal 1 orang')
  })
  it('nama wajib', () => {
    expect(errs(rsvpSchema.safeParse({ name: ' ', attendance: 'hadir', party_size: '1' })).name).toBe('Nama wajib diisi')
  })
  it('nama maksimal 100 karakter', () => {
    expect(errs(rsvpSchema.safeParse({ name: 'x'.repeat(101), attendance: 'hadir', party_size: '1' })).name).toBe(
      'Nama maksimal 100 karakter',
    )
  })
  it('kehadiran wajib dipilih', () => {
    expect(errs(rsvpSchema.safeParse({ name: 'J', attendance: '', party_size: '1' })).attendance).toBe('Pilih kehadiran')
  })
})

describe('wishSchema', () => {
  it('ucapan maksimal 500 karakter', () => {
    expect(errs(wishSchema.safeParse({ name: 'A', message: 'x'.repeat(501) })).message).toBe('Ucapan maksimal 500 karakter')
  })
  it('ucapan wajib', () => {
    expect(errs(wishSchema.safeParse({ name: 'A', message: '  ' })).message).toBe('Ucapan wajib diisi')
  })
})

describe('invitationSchema', () => {
  it('menerima data yang valid dan mengubah teks kosong menjadi null', () => {
    const d = invitationSchema.parse(validInv)
    expect(d.groom_parents).toBeNull()
    expect(d.opening_text).toBeNull()
  })
  it('slug reserved ditolak', () => {
    expect(errs(invitationSchema.safeParse({ ...validInv, slug: 'admin' })).slug).toBe('Alamat ini tidak bisa dipakai')
  })
  it('slug dengan huruf besar/spasi ditolak', () => {
    expect(errs(invitationSchema.safeParse({ ...validInv, slug: 'Budi Ani' })).slug).toBe(
      'Hanya huruf kecil, angka, dan tanda - (3–60 karakter)',
    )
  })
  it('nama panggilan wajib', () => {
    expect(errs(invitationSchema.safeParse({ ...validInv, bride_nickname: '' })).bride_nickname).toBe('Wajib diisi')
  })
})

describe('invitationSchema: teks undangan', () => {
  it('pengantar dan penutup wajib diisi', () => {
    const e = errs(invitationSchema.safeParse({ ...validInv, intro_text: '  ', closing_text: '' }))
    expect(e.intro_text).toBe('Kalimat pengantar wajib diisi')
    expect(e.closing_text).toBe('Kalimat penutup wajib diisi')
  })

  it('pesan WA wajib memuat {link}', () => {
    expect(errs(invitationSchema.safeParse({ ...validInv, wa_message: 'Halo {tamu}' })).wa_message).toBe(
      'Pesan WhatsApp harus memuat kode {link} agar tamu menerima link undangan',
    )
    expect(errs(invitationSchema.safeParse({ ...validInv, wa_message: '' })).wa_message).toBe('Pesan WhatsApp wajib diisi')
  })

  it('batas panjang: pengantar & penutup 500, pesan WA 1500', () => {
    const e = errs(
      invitationSchema.safeParse({ ...validInv, intro_text: 'a'.repeat(501), closing_text: 'a'.repeat(501), wa_message: '{link}' + 'a'.repeat(1495) }),
    )
    expect(Object.keys(e).sort()).toEqual(['closing_text', 'intro_text', 'wa_message'])
  })

  // Browser mengirim isi textarea dengan akhir baris CRLF; simpan sebagai LF agar sama dengan template.
  it('akhir baris CRLF dari browser disimpan sebagai LF', () => {
    const d = invitationSchema.parse({
      ...validInv,
      intro_text: 'a\r\nb',
      opening_text: 'c\r\nd',
      closing_text: 'e\r\nf',
      wa_message: 'Shalom,\r\n{link}',
    })
    expect([d.intro_text, d.opening_text, d.closing_text, d.wa_message]).toEqual(['a\nb', 'c\nd', 'e\nf', 'Shalom,\n{link}'])
  })

  it('teks valid dirapikan spasi tepinya dan disimpan apa adanya', () => {
    const d = invitationSchema.parse({ ...validInv, intro_text: '  Pengantar  ' })
    expect(d.intro_text).toBe('Pengantar')
    expect(d.wa_message).toBe(validInv.wa_message)
  })
})

describe('eventSchema', () => {
  it('menerima acara valid dengan jam selesai kosong', () => {
    expect(eventSchema.parse(validEvent).end_time).toBeNull()
  })
  it('jam selesai harus setelah jam mulai', () => {
    expect(errs(eventSchema.safeParse({ ...validEvent, start_time: '08:00', end_time: '07:00' })).end_time).toBe(
      'Jam selesai harus setelah jam mulai',
    )
  })
  it('link peta harus https', () => {
    expect(errs(eventSchema.safeParse({ ...validEvent, maps_url: 'javascript:alert(1)' })).maps_url).toBe(
      'Link harus diawali https://',
    )
  })
  it('tanggal harus valid', () => {
    expect(errs(eventSchema.safeParse({ ...validEvent, date: '2026-13-40' })).date).toBe('Tanggal tidak valid')
  })
})

describe('giftSchema', () => {
  it('nomor rekening 5–30 digit/spasi', () => {
    expect(errs(giftSchema.safeParse({ provider: 'BCA', account_number: '12a', account_holder: 'Budi' })).account_number).toBe(
      'Nomor hanya angka (5–30 digit)',
    )
  })
  it('menerima data valid', () => {
    expect(giftSchema.parse({ provider: 'BCA', account_number: '123 456 7890', account_holder: 'Budi' }).account_number).toBe(
      '123 456 7890',
    )
  })
})

describe('parseGuestList', () => {
  it('membaca nama per baris, nomor opsional, dan melewati duplikat', () => {
    expect(parseGuestList('Pak Joko\n\n  Bu Sri, 0812-3456-7890\npak joko\n')).toEqual({
      guests: [
        { name: 'Pak Joko', phone: null },
        { name: 'Bu Sri', phone: '6281234567890' },
      ],
      duplicates: 1,
    })
  })
  it('koma tanpa nomor valid tetap bagian dari nama', () => {
    expect(parseGuestList('Bapak Andi, S.H.').guests).toEqual([{ name: 'Bapak Andi, S.H.', phone: null }])
  })
  it('menerima tempelan dari Excel/Sheets (nama<TAB>nomor)', () => {
    expect(parseGuestList('Bu Sri\t0812-3456-7890\nPak Joko\t').guests).toEqual([
      { name: 'Bu Sri', phone: '6281234567890' },
      { name: 'Pak Joko', phone: null },
    ])
  })
  it('mendukung baris Windows (CRLF)', () => {
    expect(parseGuestList('A\r\nB\r\n').guests.map((g) => g.name)).toEqual(['A', 'B'])
  })
})
