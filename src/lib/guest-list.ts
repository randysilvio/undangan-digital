import { guestLink } from './links'

/**
 * Batas panjang teks (setelah di-encode) untuk tombol "Kirim WA". Link wa.me yang terlalu panjang
 * sering gagal dibuka; di atas batas ini admin memakai "Salin daftar" saja (±40–50 tamu).
 */
const WA_MAX_ENCODED = 6000

/** Satu teks berisi semua tamu (nomor, nama, link pribadi) untuk dikirim sekali ke mempelai. */
export function guestListMessage(p: { coupleName: string; siteUrl: string; slug: string; guests: { name: string; code: string }[] }): string {
  const items = p.guests.map((g, i) => `${i + 1}. ${g.name}\n${guestLink(p.siteUrl, p.slug, g)}`)
  return [
    `Daftar link undangan *${p.coupleName}* (${p.guests.length} tamu).`,
    'Kirim setiap link ke tamu yang namanya tertulis di atasnya.',
    '',
    items.join('\n\n'),
  ].join('\n')
}

export function canShareListViaWa(text: string): boolean {
  return encodeURIComponent(text).length <= WA_MAX_ENCODED
}
