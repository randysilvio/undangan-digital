import { describe, expect, it } from 'vitest'
import { resolveSiteUrl } from '@/lib/supabase/env'

describe('resolveSiteUrl', () => {
  it('memakai NEXT_PUBLIC_SITE_URL bila diisi (tanpa / di akhir)', () => {
    expect(resolveSiteUrl({ site: 'https://namabisnis.id/', vercelProduction: 'x.vercel.app' })).toBe('https://namabisnis.id')
  })

  // Bila SITE_URL lupa diisi di Vercel, link tamu & link pantau tidak boleh jatuh ke localhost.
  it('tanpa SITE_URL di Vercel: memakai domain produksi Vercel', () => {
    expect(resolveSiteUrl({ site: undefined, vercelProduction: 'undangan-abc.vercel.app' })).toBe('https://undangan-abc.vercel.app')
    expect(resolveSiteUrl({ site: '  ', vercelProduction: 'undangan-abc.vercel.app' })).toBe('https://undangan-abc.vercel.app')
  })

  it('di komputer sendiri (tanpa keduanya): localhost', () => {
    expect(resolveSiteUrl({ site: undefined, vercelProduction: undefined })).toBe('http://localhost:3000')
  })
})
