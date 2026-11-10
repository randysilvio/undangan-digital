import { describe, expect, it } from 'vitest'
import { relativeTime } from '@/components/invitation/RelativeTime'

const now = new Date('2026-12-01T12:00:00Z').getTime()

describe('relativeTime', () => {
  it('kurang dari semenit → baru saja', () => {
    expect(relativeTime('2026-12-01T11:59:30Z', now)).toBe('baru saja')
  })
  it('jam yang lalu', () => {
    expect(relativeTime('2026-12-01T09:00:00Z', now)).toBe('3 jam yang lalu')
  })
  it('kemarin', () => {
    expect(relativeTime('2026-11-30T12:00:00Z', now)).toBe('kemarin')
  })
})
