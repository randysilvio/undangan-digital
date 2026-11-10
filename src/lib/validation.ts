import { z } from 'zod'
import { normalizePhone } from './phone'
import { isValidSlug, RESERVED_SLUGS } from './slug'

export type FormState = {
  status: 'idle' | 'ok' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

export const initialFormState: FormState = { status: 'idle' }

/** Pesan pertama untuk setiap field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_form')
    out[key] ??= issue.message
  }
  return out
}

const required = (max: number, label?: string) =>
  z
    .string({ error: label ? `${label} wajib diisi` : 'Wajib diisi' })
    .trim()
    .min(1, label ? `${label} wajib diisi` : 'Wajib diisi')
    .max(max, label ? `${label} maksimal ${max} karakter` : `Maksimal ${max} karakter`)

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter`)
    .optional()
    .transform((v) => v || null)

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export const rsvpSchema = z
  .object({
    name: required(100, 'Nama'),
    attendance: z.enum(['hadir', 'tidak', 'ragu'], { error: 'Pilih kehadiran' }),
    party_size: z.coerce.number({ error: 'Jumlah orang harus angka' }).int('Jumlah orang harus angka'),
  })
  .superRefine((d, ctx) => {
    if (d.attendance === 'tidak') return
    if (d.party_size < 1) ctx.addIssue({ code: 'custom', path: ['party_size'], message: 'Minimal 1 orang' })
    if (d.party_size > 10) ctx.addIssue({ code: 'custom', path: ['party_size'], message: 'Maksimal 10 orang' })
  })
  .transform((d) => ({ ...d, party_size: d.attendance === 'tidak' ? 0 : d.party_size }))

export const wishSchema = z.object({
  name: required(100, 'Nama'),
  message: required(500, 'Ucapan'),
})

export const invitationSchema = z.object({
  slug: z
    .string()
    .trim()
    .superRefine((s, ctx) => {
      if ((RESERVED_SLUGS as readonly string[]).includes(s)) {
        ctx.addIssue({ code: 'custom', message: 'Alamat ini tidak bisa dipakai' })
      } else if (!isValidSlug(s)) {
        ctx.addIssue({ code: 'custom', message: 'Hanya huruf kecil, angka, dan tanda - (3–60 karakter)' })
      }
    }),
  theme: z.enum(['elegan', 'modern'], { error: 'Pilih tema' }),
  timezone: z.enum(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'], { error: 'Pilih zona waktu' }),
  groom_name: required(100),
  groom_nickname: required(30),
  groom_parents: optional(200),
  bride_name: required(100),
  bride_nickname: required(30),
  bride_parents: optional(200),
  opening_text: optional(1000),
})

function isRealDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

export const eventSchema = z
  .object({
    name: required(60),
    date: z.string().refine(isRealDate, 'Tanggal tidak valid'),
    start_time: z.string().regex(TIME, 'Jam tidak valid'),
    end_time: z
      .string()
      .optional()
      .transform((v) => v || null)
      .refine((v) => v === null || TIME.test(v), 'Jam tidak valid'),
    venue_name: required(100),
    address: required(300),
    maps_url: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || null)
      .refine((v) => v === null || (/^https:\/\//.test(v) && URL.canParse(v)), 'Link harus diawali https://'),
  })
  .superRefine((e, ctx) => {
    if (e.end_time && e.end_time <= e.start_time) {
      ctx.addIssue({ code: 'custom', path: ['end_time'], message: 'Jam selesai harus setelah jam mulai' })
    }
  })

export const giftSchema = z.object({
  provider: required(50),
  account_number: z
    .string()
    .trim()
    .regex(/^[0-9 ]{5,30}$/, 'Nomor hanya angka (5–30 digit)'),
  account_holder: required(100),
})

export type InvitationInput = z.infer<typeof invitationSchema>
export type EventInput = z.infer<typeof eventSchema>
export type GiftInput = z.infer<typeof giftSchema>

/** Daftar tamu: satu nama per baris, nomor WA opsional setelah koma terakhir. */
export function parseGuestList(text: string): { guests: { name: string; phone: string | null }[]; duplicates: number } {
  const guests: { name: string; phone: string | null }[] = []
  const seen = new Set<string>()
  let duplicates = 0
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    let name = line
    let phone: string | null = null
    // Nomor opsional setelah TAB (tempelan Excel/Sheets) atau koma terakhir.
    const tab = raw.indexOf('\t')
    if (tab > 0) {
      name = raw.slice(0, tab)
      phone = normalizePhone(raw.slice(tab + 1))
    } else {
      const comma = line.lastIndexOf(',')
      if (comma > 0) {
        const maybe = normalizePhone(line.slice(comma + 1))
        if (maybe) {
          phone = maybe
          name = line.slice(0, comma)
        }
      }
    }
    name = name.replace(/\s+/g, ' ').trim().slice(0, 100)
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) {
      duplicates++
      continue
    }
    seen.add(key)
    guests.push({ name, phone })
  }
  return { guests, duplicates }
}
