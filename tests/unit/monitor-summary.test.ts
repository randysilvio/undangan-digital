import { beforeEach, describe, expect, it, vi } from 'vitest'

// Fungsi biasa, bukan vi.fn: pelacak hasil vi.fn ikut memanggil .then pada nilai kembalian dan
// melaporkan penolakan sebagai kegagalan tes walaupun kode yang diuji sudah menangkapnya.
let respond: () => unknown = () => ({ data: [], error: null })
const calls: unknown[][] = []
vi.mock('@/lib/supabase/public', () => ({
  createPublicSupabase: () => ({
    rpc: (...args: unknown[]) => {
      calls.push(args)
      return respond()
    },
  }),
}))

const { getMonitorSummary } = await import('@/lib/data/public')

const TOKEN = 'T'.repeat(32)
const row = {
  groom_nickname: 'Budi',
  bride_nickname: 'Ani',
  theme: 'modern',
  timezone: 'Asia/Jayapura',
  status: 'published',
  hadir: 2,
  tidak: 1,
  ragu: 0,
  total_orang: 4,
  generated_at: '2026-11-10T05:42:00+00:00',
}

describe('getMonitorSummary', () => {
  beforeEach(() => {
    calls.length = 0
    respond = () => ({ data: [], error: null })
  })

  it('kode salah format → invalid tanpa memanggil rpc', async () => {
    expect(await getMonitorSummary('abc')).toEqual({ kind: 'invalid' })
    expect(calls).toHaveLength(0)
  })

  it('nol baris → invalid', async () => {
    expect(await getMonitorSummary(TOKEN)).toEqual({ kind: 'invalid' })
    expect(calls).toEqual([['monitor_summary', { p_token: TOKEN }]])
  })

  it('rpc error atau melempar → error', async () => {
    respond = () => Promise.resolve({ data: null, error: { message: 'down' } })
    expect(await getMonitorSummary(TOKEN)).toEqual({ kind: 'error' })
    respond = () => Promise.reject(new Error('fetch failed'))
    expect(await getMonitorSummary(TOKEN)).toEqual({ kind: 'error' })
  })

  it('baris → ok dengan nama field camelCase', async () => {
    respond = () => Promise.resolve({ data: [row], error: null })
    expect(await getMonitorSummary(TOKEN)).toEqual({
      kind: 'ok',
      summary: {
        groomNickname: 'Budi',
        brideNickname: 'Ani',
        theme: 'modern',
        timezone: 'Asia/Jayapura',
        status: 'published',
        hadir: 2,
        tidak: 1,
        ragu: 0,
        totalOrang: 4,
        generatedAt: '2026-11-10T05:42:00+00:00',
      },
    })
  })
})
