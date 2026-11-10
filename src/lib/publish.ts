import type { InvitationFull } from './types'

/** Pesan alasan bila undangan belum boleh diterbitkan, atau null bila boleh. */
export function canPublish(inv: InvitationFull): string | null {
  if (inv.events.length === 0) return 'Tambahkan minimal satu acara sebelum menerbitkan'
  return null
}
