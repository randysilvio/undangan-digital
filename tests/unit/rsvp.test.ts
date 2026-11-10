import { describe, expect, it } from 'vitest'
import { summarizeRsvps } from '@/lib/rsvp'
import type { Rsvp } from '@/lib/types'

const r = (o: Partial<Rsvp>): Rsvp => ({
  id: 'x',
  invitation_id: 'i',
  guest_code: null,
  name: 'A',
  attendance: 'hadir',
  party_size: 1,
  created_at: '2026-01-01T00:00:00Z',
  ...o,
})

describe('summarizeRsvps', () => {
  it('hanya menghitung jawaban terakhir per tamu', () => {
    expect(
      summarizeRsvps([
        r({ guest_code: 'a', name: 'Joko', party_size: 2, created_at: '2026-01-01T00:00:00Z' }),
        r({ guest_code: 'a', name: 'Joko', attendance: 'tidak', party_size: 0, created_at: '2026-01-02T00:00:00Z' }),
        r({ name: 'Sri', party_size: 3, created_at: '2026-01-01T00:00:00Z' }),
        r({ name: ' sri ', party_size: 1, created_at: '2026-01-03T00:00:00Z' }),
        r({ name: 'Ana', attendance: 'ragu' }),
      ]),
    ).toEqual({ hadir: 1, tidak: 1, ragu: 1, totalOrang: 1 })
  })
  it('kosong menghasilkan nol', () => {
    expect(summarizeRsvps([])).toEqual({ hadir: 0, tidak: 0, ragu: 0, totalOrang: 0 })
  })
})
