import { describe, expect, it } from 'vitest'
import { isMediaUrl, storageExtension } from '@/lib/upload'

const base = 'https://abc.supabase.co'

describe('isMediaUrl', () => {
  it('menerima URL publik bucket media milik undangan itu', () => {
    expect(isMediaUrl(`${base}/storage/v1/object/public/media/inv-1/a.jpg`, base, 'inv-1')).toBe(true)
  })
  it('menolak URL undangan lain', () => {
    expect(isMediaUrl(`${base}/storage/v1/object/public/media/inv-2/a.jpg`, base, 'inv-1')).toBe(false)
  })
  it('menolak domain lain dan skema berbahaya', () => {
    expect(isMediaUrl('https://evil.com/storage/v1/object/public/media/inv-1/a.jpg', base, 'inv-1')).toBe(false)
    expect(isMediaUrl('javascript:alert(1)', base, 'inv-1')).toBe(false)
  })
  it('menolak path traversal', () => {
    expect(isMediaUrl(`${base}/storage/v1/object/public/media/inv-1/../inv-2/a.jpg`, base, 'inv-1')).toBe(false)
  })
})

describe('storageExtension', () => {
  it('memetakan tipe file ke ekstensi', () => {
    expect(storageExtension('image/png')).toBe('png')
    expect(storageExtension('image/webp')).toBe('webp')
    expect(storageExtension('image/jpeg')).toBe('jpg')
    expect(storageExtension('audio/mpeg')).toBe('mp3')
  })
})
