import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/admin/(panel)/monitor-actions', () => ({
  createMonitorLinkAction: vi.fn(),
  disableMonitorLinkAction: vi.fn(),
}))

const { MonitorLinkCard } = await import('@/components/admin/MonitorLinkCard')

const link = `https://x.app/pantau/${'T'.repeat(32)}`
const html = (l: string | null) => renderToStaticMarkup(<MonitorLinkCard invitationId="inv-1" link={l} coupleName="Budi & Ani" />)

describe('MonitorLinkCard', () => {
  it('tanpa link: tombol Buat link, tidak ada Salin/Kirim WA', () => {
    const out = html(null)
    expect(out).toContain('Link Pantau Mempelai')
    expect(out).toContain('Buat link')
    expect(out).not.toContain('Kirim WA')
    expect(out).not.toContain('Salin')
  })

  it('dengan link: tampil link, Salin, Kirim WA, Buat ulang, Matikan', () => {
    const out = html(link)
    for (const text of [link, 'Salin', 'Kirim WA', 'Buat ulang', 'Matikan']) expect(out).toContain(text)
    expect(out).not.toContain('Buat link')
  })

  it('href Kirim WA berisi pesan dengan link', () => {
    const href = html(link).match(/href="(https:\/\/wa\.me\/[^"]+)"/)?.[1].replace(/&amp;/g, '&')
    expect(href).toBeDefined()
    expect(href!.startsWith('https://wa.me/?text=')).toBe(true)
    expect(href).toContain(encodeURIComponent(link))
  })
})
