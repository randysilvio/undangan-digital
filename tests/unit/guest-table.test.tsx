import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/admin/(panel)/guest-actions', () => ({ deleteGuestAction: vi.fn() }))

const { GuestTable } = await import('@/components/admin/GuestTable')

const guest = { id: 'g1', invitation_id: 'inv-1', name: 'Pak Joko', phone: '6281234567890', code: 'abc123', created_at: '2026-11-01T00:00:00Z' }

describe('GuestTable', () => {
  it('tombol Kirim WA memakai pesan WA milik undangan', () => {
    const html = renderToStaticMarkup(
      <GuestTable
        invitationId="inv-1"
        slug="budi-ani"
        coupleName="Budi & Ani"
        siteUrl="https://x.app"
        waTemplate={'Shalom {tamu}! Undangan {mempelai}: {link} Tuhan Yesus memberkati.'}
        guests={[guest]}
      />,
    )
    const href = html.match(/href="(https:\/\/wa\.me\/[^"]+)"/)![1].replace(/&amp;/g, '&')
    const text = new URL(href).searchParams.get('text')
    expect(text).toBe('Shalom Pak Joko! Undangan Budi & Ani: https://x.app/budi-ani?to=Pak+Joko&g=abc123 Tuhan Yesus memberkati.')
  })
})
