import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { summarizeRsvps } from '@/lib/rsvp'
import type { Rsvp } from '@/lib/types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const opts = { auth: { persistSession: false, autoRefreshToken: false } }

const SUMMARY_COLUMNS = [
  'bride_nickname',
  'generated_at',
  'groom_nickname',
  'hadir',
  'ragu',
  'status',
  'theme',
  'tidak',
  'timezone',
  'total_orang',
]

describe.skipIf(!url || !anonKey || !serviceKey)('Link pantau mempelai', () => {
  const tag = `mon-${Date.now().toString(36)}`
  // 32 karakter base64url; unik per run agar tidak bentrok dengan sisa run sebelumnya.
  const token = (c: string) => `${tag}-${c}`.padEnd(32, c).slice(0, 32)
  const tokenA = token('A')
  const tokenB = token('B')
  const tokenDraft = token('D')
  let service: SupabaseClient
  let anon: SupabaseClient
  let user: SupabaseClient
  let userId = ''
  let pubId = ''
  let draftId = ''

  const base = (slug: string, status: string) => ({
    slug,
    status,
    groom_name: 'Uji Pria',
    groom_nickname: 'Budi',
    bride_name: 'Uji Wanita',
    bride_nickname: 'Ani',
  })
  const at = (minutes: number) => new Date(Date.UTC(2026, 10, 10, 5, minutes)).toISOString()
  const must = <T extends { error: unknown }>(r: T): T => {
    if (r.error) throw r.error
    return r
  }

  beforeAll(async () => {
    service = createClient(url, serviceKey, opts)
    anon = createClient(url, anonKey, opts)

    const pub = must(await service.from('invitations').insert(base(`${tag}-terbit`, 'published')).select('id').single())
    const draft = must(await service.from('invitations').insert(base(`${tag}-draft`, 'draft')).select('id').single())
    pubId = pub.data!.id
    draftId = draft.data!.id

    must(
      await service.from('invitation_monitor_links').insert([
        { invitation_id: pubId, token: tokenA },
        { invitation_id: draftId, token: tokenDraft },
      ]),
    )
    // Setiap baris punya kunci yang sama (bulk insert mengisi kunci yang hilang dengan NULL).
    const row = (guest_code: string | null, name: string, attendance: string, party_size: number, minutes: number) => ({
      invitation_id: pubId,
      guest_code,
      name,
      attendance,
      party_size,
      created_at: at(minutes),
    })
    must(
      await service.from('rsvps').insert([
        row('kode01', 'Pak Joko', 'hadir', 2, 0),
        row('kode01', 'Pak Joko', 'tidak', 1, 1),
        row(null, '  ani\t', 'ragu', 1, 0),
        row(null, 'Ani', 'hadir', 3, 2),
        row(null, 'Budi', 'hadir', 1, 0),
      ]),
    )

    const email = `${tag}@undangan.test`
    const password = `Pw-${tag}-x9`
    const created = must(await service.auth.admin.createUser({ email, password, email_confirm: true }))
    userId = created.data.user!.id
    user = createClient(url, anonKey, opts)
    must(await user.auth.signInWithPassword({ email, password }))
  })

  afterAll(async () => {
    if (pubId || draftId) await service.from('invitations').delete().in('id', [pubId, draftId])
    if (userId) await service.auth.admin.deleteUser(userId)
  })

  it('anon dan user non-admin tidak bisa membaca link', async () => {
    for (const client of [anon, user]) {
      const { data } = await client.from('invitation_monitor_links').select('token').in('invitation_id', [pubId, draftId])
      expect(data ?? []).toEqual([])
    }
  })

  it('anon tidak bisa membuat link', async () => {
    const { error } = await anon.from('invitation_monitor_links').insert({ invitation_id: pubId, token: token('X') })
    expect(error).not.toBeNull()
  })

  it('kode salah → nol baris', async () => {
    const { data, error } = await anon.rpc('monitor_summary', { p_token: 'x'.repeat(32) })
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('angka sama dengan summarizeRsvps', async () => {
    const rows = must(await service.from('rsvps').select('*').eq('invitation_id', pubId)).data as Rsvp[]
    const s = summarizeRsvps(rows)
    // Jaga agar data uji benar-benar mencakup jawaban yang diganti dan nama beda spasi/huruf.
    expect(s).toEqual({ hadir: 2, tidak: 1, ragu: 0, totalOrang: 4 })

    const { data, error } = await anon.rpc('monitor_summary', { p_token: tokenA })
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({
      hadir: s.hadir,
      tidak: s.tidak,
      ragu: s.ragu,
      total_orang: s.totalOrang,
      status: 'published',
      groom_nickname: 'Budi',
      bride_nickname: 'Ani',
    })
  })

  it('hasil hanya berisi kolom yang diizinkan', async () => {
    const { data } = await anon.rpc('monitor_summary', { p_token: tokenA })
    expect(Object.keys(data[0]).sort()).toEqual(SUMMARY_COLUMNS)
  })

  it('draft tanpa RSVP → satu baris berisi nol', async () => {
    const { data, error } = await anon.rpc('monitor_summary', { p_token: tokenDraft })
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({ status: 'draft', hadir: 0, tidak: 0, ragu: 0, total_orang: 0 })
  })

  it('setelah kode diganti, kode lama → nol baris', async () => {
    must(await service.from('invitation_monitor_links').update({ token: tokenB }).eq('invitation_id', pubId))
    const old = await anon.rpc('monitor_summary', { p_token: tokenA })
    expect(old.data).toEqual([])
    const fresh = await anon.rpc('monitor_summary', { p_token: tokenB })
    expect(fresh.data).toHaveLength(1)
  })
})
