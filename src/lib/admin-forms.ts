import type { z } from 'zod'
import {
  eventSchema,
  fieldErrors,
  giftSchema,
  invitationFields,
  invitationSchema,
  parseGuestList,
  storySchema,
  type EventInput,
  type GiftInput,
  type InvitationInput,
  type StoryInput,
} from './validation'

type Parsed<T> = { data: T; fieldErrors?: undefined } | { data?: undefined; fieldErrors: Record<string, string> }

const MAX_EVENTS = 10
const MAX_GIFTS = 10
const MAX_STORY = 12

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

export function parseInvitationForm(fd: FormData): Parsed<{ invitation: InvitationInput & { story: StoryInput[] }; events: EventInput[] }> {
  const errors: Record<string, string> = {}
  const inv = invitationSchema.safeParse(Object.fromEntries(Object.keys(invitationFields.shape).map((k) => [k, String(fd.get(k) ?? '')])))
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

  const rawStory = readJsonArray(fd, 'story')
  let story: StoryInput[] = []
  if (rawStory === null) errors.story = 'Data cerita tidak valid'
  else if (rawStory.length > MAX_STORY) errors.story = `Maksimal ${MAX_STORY} cerita`
  else {
    const r = parseList(rawStory, storySchema, 'story')
    Object.assign(errors, r.errors)
    story = r.data
  }

  if (Object.keys(errors).length || !inv.success) return { fieldErrors: errors }
  return { data: { invitation: { ...inv.data, story }, events } }
}

const MAX_GUEST_PASTE = 500

/** Daftar tamu tempelan, tanpa nama yang sudah ada. */
export function prepareGuestPaste(
  text: string,
  existingNames: string[],
): { guests: { name: string; phone: string | null }[]; skipped: number } | { error: string } {
  const { guests, duplicates } = parseGuestList(text)
  if (guests.length === 0) return { error: 'Tempel minimal satu nama' }
  if (guests.length > MAX_GUEST_PASTE) return { error: `Maksimal ${MAX_GUEST_PASTE} tamu sekali tempel` }
  const existing = new Set(existingNames.map((n) => n.toLowerCase()))
  const fresh = guests.filter((g) => !existing.has(g.name.toLowerCase()))
  return { guests: fresh, skipped: duplicates + (guests.length - fresh.length) }
}

export function parseGiftsForm(fd: FormData): Parsed<GiftInput[]> {
  const raw = readJsonArray(fd, 'gifts')
  if (raw === null) return { fieldErrors: { gifts: 'Data rekening tidak valid' } }
  if (raw.length > MAX_GIFTS) return { fieldErrors: { gifts: `Maksimal ${MAX_GIFTS} rekening` } }
  const r = parseList(raw, giftSchema, 'gifts')
  return Object.keys(r.errors).length ? { fieldErrors: r.errors } : { data: r.data }
}
