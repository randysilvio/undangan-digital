'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { submitWish } from '@/app/[slug]/actions'
import type { Wish } from '@/lib/types'
import { initialFormState } from '@/lib/validation'
import { guestInput, honeypotProps } from './guest-form'
import { RelativeTime } from './RelativeTime'
import { accentButton } from './Section'

interface WishesProps {
  invitationId: string
  slug: string
  guestName: string | null
  wishes: Wish[]
  disabled?: boolean
}

export function WishesForm({ invitationId, slug, guestName, wishes, disabled }: WishesProps) {
  const [state, action, pending] = useActionState(submitWish, initialFormState)
  const [message, setMessage] = useState('')
  const [seen, setSeen] = useState(state)
  const v = state.values
  const e = state.fieldErrors ?? {}

  // Kosongkan ucapan hanya setelah berhasil terkirim (isian tetap ada bila gagal).
  if (state !== seen) {
    setSeen(state)
    if (state.status === 'ok') setMessage('')
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    startTransition(() => action(fd))
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="relative space-y-4">
        <input type="hidden" name="invitation_id" value={invitationId} />
        <input type="hidden" name="slug" value={slug} />
        <input {...honeypotProps} />
        <label className="block">
          <span className="mb-1 block text-sm text-inv-muted">Nama</span>
          <input name="name" required maxLength={100} defaultValue={v?.name ?? guestName ?? ''} className={guestInput} />
          {e.name && <span className="mt-1 block text-sm text-inv-error">{e.name}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-inv-muted">Ucapan & doa</span>
          <textarea
            name="message"
            required
            maxLength={500}
            rows={4}
            value={message}
            onChange={(x) => setMessage(x.target.value)}
            className={guestInput}
          />
          {e.message && <span className="mt-1 block text-sm text-inv-error">{e.message}</span>}
        </label>
        {state.status === 'error' && state.message && (
          <p className="text-sm text-inv-error" role="alert">
            {state.message}
          </p>
        )}
        {state.status === 'ok' && (
          <p className="text-sm text-inv-accent" role="status">
            Terima kasih atas ucapan dan doanya.
          </p>
        )}
        <button type="submit" disabled={pending || disabled} className={`${accentButton} w-full`}>
          {pending ? 'Mengirim…' : 'Kirim Ucapan'}
        </button>
      </form>

      {wishes.length > 0 && (
        <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {wishes.map((w) => (
            <li key={w.id} className="rounded-xl border border-inv-line bg-inv-bg p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold text-inv-text">{w.name}</p>
                <p className="shrink-0 text-xs text-inv-muted">
                  <RelativeTime iso={w.created_at} />
                </p>
              </div>
              <p className="mt-1 text-sm whitespace-pre-line text-inv-text">{w.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
