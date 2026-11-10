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
    ).toBe('﻿Nama;Kehadiran;Jumlah Orang;Kode Tamu;Waktu\r\nJoko;Hadir;2;ab12cd;01/12/2026 10.30\r\n')
  })
})
