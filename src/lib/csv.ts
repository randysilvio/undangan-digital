import { latestRsvps } from './rsvp'
import { formatTimestamp } from './time'
import type { Attendance, Rsvp, TimeZoneId } from './types'

type Cell = string | number | null

function cell(value: Cell): string {
  if (value === null) return ''
  let s = String(value)
  // Cegah formula injection saat dibuka di Excel/Sheets.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  if (/[;"\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
  return s
}

/** CSV untuk Excel berbahasa Indonesia: pemisah ";", BOM UTF-8, baris CRLF. */
export function toCsv(headers: string[], rows: Cell[][]): string {
  return '﻿' + [headers, ...rows].map((r) => r.map(cell).join(';') + '\r\n').join('')
}

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  hadir: 'Hadir',
  tidak: 'Tidak Hadir',
  ragu: 'Masih Ragu',
}

/** Kolom Status: "Terbaru" = jawaban yang dihitung; "Diganti" = jawaban lama tamu yang sama. */
export function rsvpCsv(rows: Rsvp[], tz: TimeZoneId): string {
  const latest = new Set(latestRsvps(rows).map((r) => r.id))
  return toCsv(
    ['Nama', 'Kehadiran', 'Jumlah Orang', 'Kode Tamu', 'Waktu', 'Status'],
    rows.map((r) => [
      r.name,
      ATTENDANCE_LABEL[r.attendance],
      r.party_size,
      r.guest_code,
      formatTimestamp(r.created_at, tz),
      latest.has(r.id) ? 'Terbaru' : 'Diganti',
    ]),
  )
}
