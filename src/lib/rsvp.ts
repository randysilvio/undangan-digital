import type { Rsvp } from './types'

export interface RsvpSummary {
  hadir: number
  tidak: number
  ragu: number
  totalOrang: number
}

const respondentKey = (r: Rsvp) => (r.guest_code ? `kode:${r.guest_code}` : `nama:${r.name.trim().toLowerCase()}`)

/** Jawaban terakhir per tamu (per kode tamu, atau per nama bila tanpa kode). */
export function latestRsvps(rows: Rsvp[]): Rsvp[] {
  const latest = new Map<string, Rsvp>()
  for (const r of rows) {
    const key = respondentKey(r)
    const prev = latest.get(key)
    if (!prev || r.created_at > prev.created_at) latest.set(key, r)
  }
  return [...latest.values()]
}

export function summarizeRsvps(rows: Rsvp[]): RsvpSummary {
  const s: RsvpSummary = { hadir: 0, tidak: 0, ragu: 0, totalOrang: 0 }
  for (const r of latestRsvps(rows)) {
    s[r.attendance]++
    if (r.attendance === 'hadir') s.totalOrang += r.party_size
  }
  return s
}
