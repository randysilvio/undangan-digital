/** Menormalkan nomor HP Indonesia ke format internasional tanpa "+" (contoh: 6281234567890). */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  else if (digits.startsWith('8')) digits = '62' + digits
  if (!digits.startsWith('62') || digits.length < 10 || digits.length > 15) return null
  return digits
}
