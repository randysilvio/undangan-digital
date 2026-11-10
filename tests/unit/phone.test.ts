import { describe, expect, it } from 'vitest'
import { normalizePhone } from '@/lib/phone'

describe('normalizePhone', () => {
  it.each(['0812-3456-7890', '+62 812 3456 7890', '6281234567890', '81234567890', '+62 0812-3456-7890', '62 0812 3456 7890'])('menormalkan %s', (v) => {
    expect(normalizePhone(v)).toBe('6281234567890')
  })
  it.each(['abc', '', '0812', null, undefined])('menolak %s', (v) => {
    expect(normalizePhone(v)).toBeNull()
  })
})
