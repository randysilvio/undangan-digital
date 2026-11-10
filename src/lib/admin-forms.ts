import type { z } from 'zod'
import { eventSchema, fieldErrors, giftSchema, invitationSchema, type EventInput, type GiftInput, type InvitationInput } from './validation'

type Parsed<T> = { data: T; fieldErrors?: undefined } | { data?: undefined; fieldErrors: Record<string, string> }

const MAX_EVENTS = 10
const MAX_GIFTS = 10

function readJsonArray(fd: FormData, key: string): unknown[] | null {
  try {
    const v = JSON.parse(String(fd.get(key) ?? '[]'))
    return Array.isArray(v) ? v : null
  } catch {
    return null
  }
}

/** Validasi tiap item daftar; error diberi kunci "<prefix>.<urutan>.<field>". */
function parseList<S extends z.ZodType>(items: unknown[], schema: S, prefix: string) {
  const errors: Record<string, string> = {}
  const data: z.infer<S>[] = []
  items.forEach((item, i) => {
    const r = schema.safeParse(item)
    if (r.success) data.push(r.data)
    else for (const [k, msg] of Object.entries(fieldErrors(r.error))) errors[`${prefix}.${i}.${k}`] = msg
  })
  return { data, errors }
}

export function parseInvitationForm(fd: FormData): Parsed<{ invitation: InvitationInput; events: EventInput[] }> {
  const errors: Record<string, string> = {}
  const inv = invitationSchema.safeParse(Object.fromEntries(Object.keys(invitationSchema.shape).map((k) => [k, String(fd.get(k) ?? '')])))
  if (!inv.success) Object.assign(errors, fieldErrors(inv.error))

  const raw = readJsonArray(fd, 'events')
  let events: EventInput[] = []
  if (raw === null) errors.events = 'Data acara tidak valid'
  else if (raw.length > MAX_EVENTS) errors.events = `Maksimal ${MAX_EVENTS} acara`
  else {
    const r = parseList(raw, eventSchema, 'events')
    Object.assign(errors, r.errors)
    events = r.data
  }

  if (Object.keys(errors).length || !inv.success) return { fieldErrors: errors }
  return { data: { invitation: inv.data, events } }
}

export function parseGiftsForm(fd: FormData): Parsed<GiftInput[]> {
  const raw = readJsonArray(fd, 'gifts')
  if (raw === null) return { fieldErrors: { gifts: 'Data rekening tidak valid' } }
  if (raw.length > MAX_GIFTS) return { fieldErrors: { gifts: `Maksimal ${MAX_GIFTS} rekening` } }
  const r = parseList(raw, giftSchema, 'gifts')
  return Object.keys(r.errors).length ? { fieldErrors: r.errors } : { data: r.data }
}
