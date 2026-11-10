import { describe, expect, it, vi } from 'vitest'
import { handleRsvp, handleWish } from '@/lib/guest-actions'

const fd = (o: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) f.set(k, v)
  return f
}

const rsvp = { invitation_id: 'inv-1', slug: 'budi-ani', g: 'ab12cd', name: 'Joko', attendance: 'hadir', party_size: '2', website: '' }
const wish = { invitation_id: 'inv-1', slug: 'budi-ani', name: 'Joko', message: 'Selamat menempuh hidup baru', website: '' }

describe('handleRsvp', () => {
  it('honeypot terisi → ok tanpa menyimpan', async () => {
    const insert = vi.fn()
    expect((await handleRsvp(fd({ ...rsvp, website: 'spam' }), insert)).status).toBe('ok')
    expect(insert).not.toHaveBeenCalled()
  })

  it('input tidak valid → error per field, isian dikembalikan', async () => {
    const insert = vi.fn()
    const s = await handleRsvp(fd({ ...rsvp, name: '' }), insert)
    expect(s.status).toBe('error')
    expect(s.fieldErrors?.name).toBe('Nama wajib diisi')
    expect(s.values?.party_size).toBe('2')
    expect(insert).not.toHaveBeenCalled()
  })

  it('gagal menyimpan → pesan umum, isian utuh', async () => {
    const s = await handleRsvp(fd(rsvp), async () => ({ error: new Error('db') }))
    expect(s).toMatchObject({ status: 'error', message: 'Gagal mengirim, coba lagi' })
    expect(s.values?.name).toBe('Joko')
  })

  it('penyimpanan melempar exception → pesan umum, isian utuh', async () => {
    const s = await handleRsvp(fd(rsvp), () => {
      throw new Error('network')
    })
    expect(s).toMatchObject({ status: 'error', message: 'Gagal mengirim, coba lagi' })
    expect(s.values?.party_size).toBe('2')
  })

  it('sukses → menyimpan baris RSVP', async () => {
    const insert = vi.fn(async () => ({ error: null }))
    expect((await handleRsvp(fd(rsvp), insert)).status).toBe('ok')
    expect(insert).toHaveBeenCalledWith({ invitation_id: 'inv-1', guest_code: 'ab12cd', name: 'Joko', attendance: 'hadir', party_size: 2 })
  })

  it('kode tamu tidak valid → guest_code null', async () => {
    const insert = vi.fn(async () => ({ error: null }))
    await handleRsvp(fd({ ...rsvp, g: '<x>' }), insert)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ guest_code: null }))
  })

  it('tanpa invitation_id → error umum', async () => {
    const insert = vi.fn()
    expect((await handleRsvp(fd({ ...rsvp, invitation_id: '' }), insert)).status).toBe('error')
    expect(insert).not.toHaveBeenCalled()
  })
})

describe('handleWish', () => {
  it('honeypot terisi → ok tanpa menyimpan', async () => {
    const insert = vi.fn()
    expect((await handleWish(fd({ ...wish, website: 'x' }), insert)).status).toBe('ok')
    expect(insert).not.toHaveBeenCalled()
  })

  it('ucapan terlalu panjang → error per field', async () => {
    const insert = vi.fn()
    const s = await handleWish(fd({ ...wish, message: 'x'.repeat(501) }), insert)
    expect(s.fieldErrors?.message).toBe('Ucapan maksimal 500 karakter')
    expect(insert).not.toHaveBeenCalled()
  })

  it('gagal menyimpan → pesan umum, isian utuh', async () => {
    const s = await handleWish(fd(wish), async () => ({ error: new Error('db') }))
    expect(s).toMatchObject({ status: 'error', message: 'Gagal mengirim, coba lagi' })
    expect(s.values?.message).toBe('Selamat menempuh hidup baru')
  })

  it('penyimpanan melempar exception → pesan umum', async () => {
    const s = await handleWish(fd(wish), async () => {
      throw new Error('network')
    })
    expect(s).toMatchObject({ status: 'error', message: 'Gagal mengirim, coba lagi' })
  })

  it('sukses → menyimpan ucapan', async () => {
    const insert = vi.fn(async () => ({ error: null }))
    const s = await handleWish(fd(wish), insert)
    expect(s.status).toBe('ok')
    expect(s.values).toEqual({ name: 'Joko', message: '' })
    expect(insert).toHaveBeenCalledWith({ invitation_id: 'inv-1', name: 'Joko', message: 'Selamat menempuh hidup baru' })
  })
})
