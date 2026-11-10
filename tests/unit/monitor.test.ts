import { describe, expect, it } from 'vitest'
import { MONITOR_TOKEN_RE, monitorLink, monitorToken, monitorWaMessage } from '@/lib/monitor'

describe('monitorToken', () => {
  it('32 karakter base64url dan acak', () => {
    const a = monitorToken()
    const b = monitorToken()
    expect(a).toMatch(MONITOR_TOKEN_RE)
    expect(b).toMatch(MONITOR_TOKEN_RE)
    expect(a).not.toBe(b)
  })
})

describe('MONITOR_TOKEN_RE', () => {
  it('menolak panjang/karakter salah', () => {
    for (const bad of ['a'.repeat(31), 'a'.repeat(33), 'a'.repeat(31) + '+', 'a'.repeat(31) + '/', 'a'.repeat(31) + '=', '']) {
      expect(bad).not.toMatch(MONITOR_TOKEN_RE)
    }
  })
})

describe('monitorLink', () => {
  it('merapikan garis miring', () => {
    expect(monitorLink('https://x.app/', 'T'.repeat(32))).toBe(`https://x.app/pantau/${'T'.repeat(32)}`)
  })
})

describe('monitorWaMessage', () => {
  it('memuat nama pasangan dan link', () => {
    const link = `https://x.app/pantau/${'T'.repeat(32)}`
    const msg = monitorWaMessage({ coupleName: 'Budi & Ani', link })
    expect(msg).toContain('Budi & Ani')
    expect(msg).toContain(link)
  })
})
