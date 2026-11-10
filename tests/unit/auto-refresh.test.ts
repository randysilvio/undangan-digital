import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startAutoRefresh } from '@/components/monitor/AutoRefresh'

function fakeTarget() {
  const listeners = new Map<string, () => void>()
  return {
    addEventListener: vi.fn((type: string, fn: () => void) => void listeners.set(type, fn)),
    removeEventListener: vi.fn((type: string) => void listeners.delete(type)),
    fire(type: string) {
      listeners.get(type)?.()
    },
  }
}

function fakeEnv(state: DocumentVisibilityState = 'visible', onLine = true) {
  const doc = Object.assign(fakeTarget(), { visibilityState: state })
  const win = Object.assign(fakeTarget(), { navigator: { onLine } })
  return { doc, win }
}

const start = (env: ReturnType<typeof fakeEnv>, refresh: () => void) =>
  startAutoRefresh(env as unknown as Parameters<typeof startAutoRefresh>[0], refresh)

describe('startAutoRefresh', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('menyegarkan tiap 60 detik saat terlihat', () => {
    const refresh = vi.fn()
    start(fakeEnv(), refresh)
    vi.advanceTimersByTime(60_000)
    expect(refresh).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60_000)
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('tidak menyegarkan saat tersembunyi', () => {
    const refresh = vi.fn()
    start(fakeEnv('hidden'), refresh)
    vi.advanceTimersByTime(180_000)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('menyegarkan sekali saat kembali terlihat', () => {
    const env = fakeEnv('hidden')
    const refresh = vi.fn()
    start(env, refresh)
    env.doc.visibilityState = 'visible'
    env.doc.fire('visibilitychange')
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  // Saat offline, router.refresh() gagal lalu Next melakukan navigasi penuh ke halaman
  // "tidak ada internet" browser: halaman pantau hilang dan penyegaran mati.
  it('tidak menyegarkan saat offline, termasuk saat kembali terlihat', () => {
    const env = fakeEnv('hidden', false)
    const refresh = vi.fn()
    start(env, refresh)
    env.doc.visibilityState = 'visible'
    env.doc.fire('visibilitychange')
    vi.advanceTimersByTime(180_000)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('menyegarkan sekali saat koneksi kembali dan halaman terlihat', () => {
    const env = fakeEnv('visible', false)
    const refresh = vi.fn()
    start(env, refresh)
    env.win.navigator.onLine = true
    env.win.fire('online')
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('koneksi kembali saat tersembunyi tidak menyegarkan', () => {
    const env = fakeEnv('hidden', false)
    const refresh = vi.fn()
    start(env, refresh)
    env.win.navigator.onLine = true
    env.win.fire('online')
    expect(refresh).not.toHaveBeenCalled()
  })

  it('pembersih menghentikan timer dan kedua listener', () => {
    const env = fakeEnv()
    const refresh = vi.fn()
    const cleanup = start(env, refresh)
    cleanup()
    vi.advanceTimersByTime(120_000)
    expect(refresh).not.toHaveBeenCalled()
    expect(env.doc.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    expect(env.win.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function))
  })
})
