import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const opts = { auth: { persistSession: false, autoRefreshToken: false } }

describe.skipIf(!url || !anonKey || !serviceKey)('RLS', () => {
  const tag = `rls-${Date.now().toString(36)}`
  let service: SupabaseClient
  let anon: SupabaseClient
  let user: SupabaseClient
  let userId = ''
  let publishedId = ''
  let draftId = ''

  const base = (slug: string, status: string) => ({
    slug,
    status,
    groom_name: 'Uji Pria',
    groom_nickname: 'Uji',
    bride_name: 'Uji Wanita',
    bride_nickname: 'Coba',
  })

  beforeAll(async () => {
    service = createClient(url, serviceKey, opts)
    anon = createClient(url, anonKey, opts)

    const pub = await service.from('invitations').insert(base(`${tag}-terbit`, 'published')).select('id').single()
    const draft = await service.from('invitations').insert(base(`${tag}-draft`, 'draft')).select('id').single()
    if (pub.error || draft.error) throw pub.error ?? draft.error
    publishedId = pub.data.id
    draftId = draft.data.id

    await service.from('events').insert([
      { invitation_id: publishedId, name: 'Akad', date: '2026-12-12', start_time: '08:00', venue_name: 'A', address: 'B' },
      { invitation_id: draftId, name: 'Akad', date: '2026-12-12', start_time: '08:00', venue_name: 'A', address: 'B' },
    ])
    await service.from('guests').insert({ invitation_id: publishedId, name: 'Tamu', code: 'abc123' })
    await service.from('wishes').insert([
      { invitation_id: publishedId, name: 'Terlihat', message: 'Selamat' },
      { invitation_id: publishedId, name: 'Tersembunyi', message: 'Spam', hidden: true },
    ])

    const email = `${tag}@undangan.test`
    const password = `Pw-${tag}-x9`
    const created = await service.auth.admin.createUser({ email, password, email_confirm: true })
    if (created.error) throw created.error
    userId = created.data.user.id
    user = createClient(url, anonKey, opts)
    const signIn = await user.auth.signInWithPassword({ email, password })
    if (signIn.error) throw signIn.error
  })

  afterAll(async () => {
    if (publishedId || draftId) await service.from('invitations').delete().in('id', [publishedId, draftId])
    if (userId) await service.auth.admin.deleteUser(userId)
  })

  it('anon tidak bisa membaca draft', async () => {
    const { data } = await anon.from('invitations').select('id').eq('id', draftId)
    expect(data).toEqual([])
    const ev = await anon.from('events').select('id').eq('invitation_id', draftId)
    expect(ev.data).toEqual([])
  })

  it('anon bisa membaca undangan terbit beserta acara', async () => {
    const { data, error } = await anon.from('invitations').select('id, events(id)').eq('id', publishedId).single()
    expect(error).toBeNull()
    expect(data?.events).toHaveLength(1)
  })

  it('anon bisa insert rsvp ke undangan terbit tapi tidak ke draft', async () => {
    const ok = await anon.from('rsvps').insert({ invitation_id: publishedId, name: 'Joko', attendance: 'hadir', party_size: 2 })
    expect(ok.error).toBeNull()
    const bad = await anon.from('rsvps').insert({ invitation_id: draftId, name: 'Joko', attendance: 'hadir', party_size: 2 })
    expect(bad.error).not.toBeNull()
  })

  it('anon tidak bisa select rsvps maupun guests', async () => {
    const r = await anon.from('rsvps').select('id').eq('invitation_id', publishedId)
    expect(r.data ?? []).toEqual([])
    const g = await anon.from('guests').select('id').eq('invitation_id', publishedId)
    expect(g.data ?? []).toEqual([])
  })

  it('anon tidak bisa update invitations', async () => {
    await anon.from('invitations').update({ groom_nickname: 'Diretas' }).eq('id', publishedId)
    const { data } = await service.from('invitations').select('groom_nickname').eq('id', publishedId).single()
    expect(data?.groom_nickname).toBe('Uji')
  })

  it('anon hanya melihat wish yang tidak hidden', async () => {
    const { data } = await anon.from('wishes').select('name').eq('invitation_id', publishedId)
    expect(data?.map((w) => w.name)).toEqual(['Terlihat'])
  })

  it('anon tidak bisa insert wish dengan hidden=true', async () => {
    const { error } = await anon.from('wishes').insert({ invitation_id: publishedId, name: 'X', message: 'Y', hidden: true })
    expect(error).not.toBeNull()
  })

  it('user login non-admin tidak bisa membaca draft', async () => {
    const { data } = await user.from('invitations').select('id').eq('id', draftId)
    expect(data).toEqual([])
    const g = await user.from('guests').select('id').eq('invitation_id', publishedId)
    expect(g.data ?? []).toEqual([])
  })
})
