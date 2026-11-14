import { normalizePhone } from './phone'
import type { SitePackage, SiteSettings } from './types'

export const MAX_PACKAGES = 4

type Parsed = { data: SiteSettings } | { fieldErrors: Record<string, string> }

/** Formulir Pengaturan Situs: kontak, paket harga (maks. 4), dan kredit di undangan. */
export function parseSettingsForm(fd: FormData): Parsed {
  const errors: Record<string, string> = {}
  const get = (k: string) => String(fd.get(k) ?? '').trim()

  const waRaw = get('whatsapp')
  const whatsapp = waRaw ? normalizePhone(waRaw) : null
  if (waRaw && !whatsapp) errors.whatsapp = 'Nomor WhatsApp tidak valid, contoh 081234567890'
  if (whatsapp && !/^62[0-9]{8,13}$/.test(whatsapp)) errors.whatsapp = 'Nomor WhatsApp tidak valid'

  const igRaw = get('instagram')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
  const instagram = igRaw || null
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) errors.instagram = 'Nama akun Instagram tidak valid'

  const email = get('email') || null
  if (email && (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) errors.email = 'Email tidak valid'

  const packages: SitePackage[] = []
  for (let i = 0; i < MAX_PACKAGES; i++) {
    const name = get(`package_${i}_name`)
    const price = get(`package_${i}_price`)
    const features = String(fd.get(`package_${i}_features`) ?? '')
      .split(/\r?\n/)
      .map((f) => f.trim())
      .filter(Boolean)
    if (!name && !price && features.length === 0) continue
    if (!name) errors[`package_${i}_name`] = 'Nama paket wajib diisi'
    else if (name.length > 40) errors[`package_${i}_name`] = 'Maksimal 40 karakter'
    if (!price) errors[`package_${i}_price`] = 'Harga wajib diisi'
    else if (price.length > 40) errors[`package_${i}_price`] = 'Maksimal 40 karakter'
    if (features.length > 10 || features.some((f) => f.length > 80)) errors[`package_${i}_features`] = 'Maksimal 10 baris, 80 karakter per baris'
    packages.push({ name, price, features, highlight: fd.get(`package_${i}_highlight`) === 'on' })
  }

  if (Object.keys(errors).length) return { fieldErrors: errors }
  return { data: { whatsapp, instagram, email, packages, show_credit: fd.get('show_credit') === 'on' } }
}
