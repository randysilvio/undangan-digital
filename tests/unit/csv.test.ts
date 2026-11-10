import { describe, expect, it } from 'vitest'
import { rsvpCsv, toCsv } from '@/lib/csv'

describe('toCsv', () => {
  it('memakai ; + BOM + CRLF, mengutip field khusus, dan menetralkan formula', () => {
    expect(
      toCsv(['Nama', 'Pesan'], [
        ['Budi', 'Halo; "teman"'],
        ['=1+1', 'a\nb'],
        ['Ani', null],
      ]),
    ).toBe('﻿Nama;Pesan\r\nBudi;"Halo; ""teman"""\r\n\'=1+1;"a\nb"\r\nAni;\r\n')
  })
})

describe('rsvpCsv', () => {
  it('menulis baris RSVP dengan waktu di zona undangan', () => {
    expect(
      rsvpCsv(
        [
          {
            id: '1',
            invitation_id: 'i',
            guest_code: 'ab12cd',
            name: 'Joko',
            attendance: 'hadir',
            party_size: 2,
            created_at: '2026-12-01T01:30:00Z',
          },
        ],
        'Asia/Jayapura',
      ),
    ).toBe('﻿Nama;Kehadiran;Jumlah Orang;Kode Tamu;Waktu;Status\r\nJoko;Hadir;2;ab12cd;01/12/2026 10.30;Terbaru\r\n')
  })
  it('menandai jawaban lama sebagai Diganti agar tidak terhitung ganda di Excel', () => {
    const base = { invitation_id: 'i', guest_code: 'ab12cd', name: 'Joko', party_size: 2 }
    const out = rsvpCsv(
      [
        { ...base, id: '2', attendance: 'tidak', party_size: 0, created_at: '2026-12-02T01:30:00Z' },
        { ...base, id: '1', attendance: 'hadir', created_at: '2026-12-01T01:30:00Z' },
      ],
      'Asia/Jakarta',
    )
    expect(out).toContain(';Tidak Hadir;0;ab12cd;02/12/2026 08.30;Terbaru\r\n')
    expect(out).toContain(';Hadir;2;ab12cd;01/12/2026 08.30;Diganti\r\n')
  })
})

describe('toCsv — formula injection', () => {
  it.each(['\t=1+1', '\r=1+1'])('menetralkan nilai diawali tab/CR (%j)', (v) => {
    expect(toCsv(['x'], [[v]]).split('\r\n')[1].startsWith('"\'') || toCsv(['x'], [[v]]).split('\r\n')[1].startsWith("'")).toBe(true)
  })
})
