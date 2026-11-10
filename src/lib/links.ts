import { normalizePhone } from './phone'

const MAX_GUEST_NAME = 100
const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/** Nama tamu dari query `?to=`: dirapikan, maksimal 100 karakter (per code point). Escape dilakukan React saat render. */
export function parseGuestName(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  const tidy = value.replace(/\s+/g, ' ').trim()
  const name = Array.from(tidy).slice(0, MAX_GUEST_NAME).join('').trim()
  return name || null
}

export function guestLink(baseUrl: string, slug: string, guest: { name: string; code?: string | null }): string {
  const params = new URLSearchParams({ to: guest.name })
  if (guest.code) params.set('g', guest.code)
  return `${baseUrl.replace(/\/+$/, '')}/${slug}?${params.toString()}`
}

export function guestCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

export function waMessage(p: { guestName: string; coupleName: string; link: string }): string {
  return `Kepada Yth.
Bapak/Ibu/Saudara/i *${p.guestName}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

*${p.coupleName}*

Berikut link undangan kami:
${p.link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih.`
}

export function waShareUrl(phone: string | null, message: string): string {
  const number = normalizePhone(phone) ?? ''
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
