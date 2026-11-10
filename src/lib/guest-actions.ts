import type { Rsvp, Wish } from './types'
import { fieldErrors, rsvpSchema, wishSchema, type FormState } from './validation'

const CODE = /^[a-z0-9]{6}$/
const FAILED = 'Gagal mengirim, coba lagi'

type InsertResult = PromiseLike<{ error: unknown }>

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '')

export async function handleRsvp(fd: FormData, insert: (row: Omit<Rsvp, 'id' | 'created_at'>) => InsertResult): Promise<FormState> {
  const values = { name: str(fd, 'name'), attendance: str(fd, 'attendance'), party_size: str(fd, 'party_size') }
  if (str(fd, 'website')) return { status: 'ok', values }

  const invitationId = str(fd, 'invitation_id')
  if (!invitationId) return { status: 'error', message: FAILED, values }

  const parsed = rsvpSchema.safeParse(values)
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrors(parsed.error), values }

  const g = str(fd, 'g')
  const { error } = await insert({ invitation_id: invitationId, guest_code: CODE.test(g) ? g : null, ...parsed.data })
  if (error) return { status: 'error', message: FAILED, values }
  return { status: 'ok', values }
}

export async function handleWish(
  fd: FormData,
  insert: (row: Pick<Wish, 'invitation_id' | 'name' | 'message'>) => InsertResult,
): Promise<FormState> {
  const values = { name: str(fd, 'name'), message: str(fd, 'message') }
  if (str(fd, 'website')) return { status: 'ok', values: { ...values, message: '' } }

  const invitationId = str(fd, 'invitation_id')
  if (!invitationId) return { status: 'error', message: FAILED, values }

  const parsed = wishSchema.safeParse(values)
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrors(parsed.error), values }

  const { error } = await insert({ invitation_id: invitationId, ...parsed.data })
  if (error) return { status: 'error', message: FAILED, values }
  // Nama dipertahankan agar mudah mengirim ucapan lagi; isi ucapan dikosongkan.
  return { status: 'ok', values: { name: values.name, message: '' } }
}
