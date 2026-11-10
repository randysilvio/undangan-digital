import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startAutoRefresh } from '@/components/monitor/AutoRefresh'

function fakeDoc(state: DocumentVisibilityState = 'visible') {
  const listeners = new Map<string, () => void>()
  return {
    visibilityState: state,
    addEventListener: vi.fn((type: string, fn: () => void) => void listeners.set(type, fn)),
    removeEventListener: vi.fn((type: string) => void listeners.delete(type)),
    fire(type: string) {
      listeners.get(type)?.()
    },
  }
}

describe('startAutoRefresh', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('menyegarkan tiap 60 detik saat terlihat', () => {
    const doc = fakeDoc()
    const refresh = vi.fn()
    startAutoRefresh(doc as unknown as Document, refresh)
    vi.advanceTimersByTime(60_000)
    expect(refresh).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60_000)
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('tidak menyegarkan saat tersembunyi', () => {
    const doc = fakeDoc('hidden')
    const refresh = vi.fn()
    startAutoRefresh(doc as unknown as Document, refresh)
    vi.advanceTimersByTime(180_000)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('menyegarkan sekali saat kembali terlihat', () => {
    const doc = fakeDoc('hidden')
    const refresh = vi.fn()
    startAutoRefresh(doc as unknown as Document, refresh)
    doc.visibilityState = 'visible'
    doc.fire('visibilitychange')
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('pembersih menghentikan timer dan listener', () => {
    const doc = fakeDoc()
    const refresh = vi.fn()
    const cleanup = startAutoRefresh(doc as unknown as Document, refresh)
    cleanup()
    vi.advanceTimersByTime(120_000)
    expect(refresh).not.toHaveBeenCalled()
    expect(doc.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
