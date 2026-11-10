import { describe, expect, it } from 'vitest'
import { earliestEvent } from '@/lib/time'
import { makeInvitation } from '../fixtures/invitation'

describe('earliestEvent', () => {
  it('memilih acara paling awal walau urutannya di belakang', () => {
    const [akad, resepsi] = makeInvitation().events
    const later = { ...resepsi, date: '2026-12-13' }
    expect(earliestEvent([later, akad], 'Asia/Jayapura')?.id).toBe(akad.id)
  })
  it('null bila tidak ada acara', () => {
    expect(earliestEvent([], 'Asia/Jakarta')).toBeNull()
  })
})
