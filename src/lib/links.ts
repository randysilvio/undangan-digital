import { normalizePhone } from './phone'
import { fillWaMessage, TEXT_TEMPLATES } from './text-templates'

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

/** Pesan WA dengan template Umum (dipakai bila undangan belum punya pesan sendiri). */
export function waMessage(p: { guestName: string; coupleName: string; link: string }): string {
  return fillWaMessage(TEXT_TEMPLATES.umum.wa, p)
}

export function waShareUrl(phone: string | null, message: string): string {
  const number = normalizePhone(phone) ?? ''
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
