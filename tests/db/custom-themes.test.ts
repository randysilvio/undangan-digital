import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const opts = { auth: { persistSession: false, autoRefreshToken: false } }

describe.skipIf(!url || !anonKey || !serviceKey)('Tema kustom & pengaturan situs', () => {
  const tag = `ct-${Date.now().toString(36)}`
  let service: SupabaseClient
  let anon: SupabaseClient
  let user: SupabaseClient
  let userId = ''
  const themeIds: Record<'galeri' | 'dipakai' | 'draft' | 'privat', string> = { galeri: '', dipakai: '', draft: '', privat: '' }
  const invIds: string[] = []

  const must = <T extends { error: unknown }>(r: T): T => {
    if (r.error) throw r.error
    return r
  }
  const theme = (slug: string, show_in_gallery = false) => ({ slug: `${tag}-${slug}`, name: slug, base_theme: 'elegan', show_in_gallery })
  const invitation = (slug: string, status: string, custom_theme_id: string) => ({
    slug: `${tag}-${slug}`,
    status,
    groom_name: 'Uji',
    groom_nickname: 'Budi',
    bride_name: 'Uji',
    bride_nickname: 'Ani',
    custom_theme_id,
  })

  beforeAll(async () => {
    service = createClient(url, serviceKey, opts)
    anon = createClient(url, anonKey, opts)
    for (const [key, show] of [
      ['galeri', true],
      ['dipakai', false],
      ['draft', false],
      ['privat', false],
    ] as const) {
      themeIds[key] = must(await service.from('custom_themes').insert(theme(key, show)).select('id').single()).data!.id
    }
    for (const [slug, status, key] of [
      ['terbit', 'published', 'dipakai'],
      ['draft', 'draft', 'draft'],
    ] as const) {
      invIds.push(must(await service.from('invitations').insert(invitation(slug, status, themeIds[key])).select('id').single()).data!.id)
    }
    const email = `${tag}@undangan.test`
    const password = `Pw-${tag}-x9`
    userId = must(await service.auth.admin.createUser({ email, password, email_confirm: true })).data.user!.id
    user = createClient(url, anonKey, opts)
    must(await user.auth.signInWithPassword({ email, password }))
  })

  afterAll(async () => {
    if (invIds.length) await service.from('invitations').delete().in('id', invIds)
    await service.from('custom_themes').delete().like('slug', `${tag}-%`)
    if (userId) await service.auth.admin.deleteUser(userId)
  })

  it('publik hanya melihat tema galeri dan tema undangan yang sudah terbit', async () => {
    for (const client of [anon, user]) {
      const { data } = await client.from('custom_themes').select('slug').like('slug', `${tag}-%`)
      expect((data ?? []).map((r) => r.slug).sort()).toEqual([`${tag}-dipakai`, `${tag}-galeri`])
    }
  })

  it('undangan terbit membawa tema kustomnya untuk tamu', async () => {
    const { data } = await anon.from('invitations').select('slug, custom_theme:custom_themes(slug)').eq('id', invIds[0]).single()
    expect(data?.custom_theme).toEqual({ slug: `${tag}-dipakai` })
  })

  it('anon dan user non-admin tidak bisa membuat, mengubah, atau menghapus tema', async () => {
    for (const client of [anon, user]) {
      expect((await client.from('custom_themes').insert(theme(`x-${Math.random()}`.slice(0, 10))).select()).error).not.toBeNull()
      await client.from('custom_themes').update({ name: 'diretas' }).eq('id', themeIds.galeri)
      await client.from('custom_themes').delete().eq('id', themeIds.galeri)
    }
    const { data } = await service.from('custom_themes').select('name').eq('id', themeIds.galeri).single()
    expect(data?.name).toBe('galeri')
  })

  it('tema yang dipakai undangan tidak bisa dihapus', async () => {
    const { error } = await service.from('custom_themes').delete().eq('id', themeIds.dipakai)
    expect(error?.code).toBe('23503')
  })

  it('pengaturan situs bisa dibaca publik tetapi tidak bisa diubah selain admin', async () => {
    const { data } = await anon.from('site_settings').select('id, packages').eq('id', 1).single()
    expect(data?.id).toBe(1)
    for (const client of [anon, user]) {
      await client.from('site_settings').update({ email: 'diretas@x.test' }).eq('id', 1)
    }
    const after = await service.from('site_settings').select('email').eq('id', 1).single()
    expect(after.data?.email).not.toBe('diretas@x.test')
  })

  it('nomor WhatsApp & paket divalidasi database', async () => {
    expect((await service.from('site_settings').update({ whatsapp: '0812' }).eq('id', 1)).error).not.toBeNull()
    expect((await service.from('site_settings').update({ packages: [1, 2, 3, 4, 5] }).eq('id', 1)).error).not.toBeNull()
  })
})
