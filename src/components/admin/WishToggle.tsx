'use client'

import { useTransition } from 'react'
import { setWishHiddenAction } from '@/app/admin/(panel)/response-actions'
import { secondaryButtonClass } from './ui'

export function WishToggle({ invitationId, wishId, hidden }: { invitationId: string; wishId: string; hidden: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => void (await setWishHiddenAction(invitationId, wishId, !hidden)))}
      className={secondaryButtonClass}
    >
      {pending ? '…' : hidden ? 'Tampilkan' : 'Sembunyikan'}
    </button>
  )
}
