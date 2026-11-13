'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { submitRsvp } from '@/app/[slug]/actions'
import { initialFormState } from '@/lib/validation'
import { guestInput, honeypotProps } from './guest-form'
import { accentButton } from './Section'

const OPTIONS = [
  ['hadir', 'Hadir'],
  ['tidak', 'Tidak hadir'],
  ['ragu', 'Masih ragu'],
] as const

interface RsvpFormProps {
  invitationId: string
  slug: string
  guestName: string | null
  guestCode: string | null
  disabled?: boolean
}

export function RsvpForm({ invitationId, slug, guestName, guestCode, disabled }: RsvpFormProps) {
  const [state, action, pending] = useActionState(submitRsvp, initialFormState)
  const [attendance, setAttendance] = useState('')
  const [partySize, setPartySize] = useState('1')
  const [editing, setEditing] = useState(false)

  // Kirim tanpa reset formulir bawaan React agar pilihan tamu tetap ada bila gagal.
  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    setEditing(false)
    startTransition(() => action(fd))
  }
  const v = state.values
  const e = state.fieldErrors ?? {}

  if (state.status === 'ok' && !editing) {
    return (
      <div className="rounded-2xl border border-inv-line bg-inv-surface p-6 text-center" role="status">
        <p className="font-heading text-2xl text-inv-accent">Terima kasih</p>
        <p className="mt-2 text-inv-text">Konfirmasi Anda sudah kami terima.</p>
        <button type="button" onClick={() => setEditing(true)} className="mt-4 text-sm text-inv-muted underline">
          Ubah jawaban
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      <input type="hidden" name="invitation_id" value={invitationId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="g" value={guestCode ?? ''} />
      <input {...honeypotProps} />

      <label className="block">
        <span className="mb-1 block text-sm text-inv-muted">Nama</span>
        <input name="name" required maxLength={100} defaultValue={v?.name ?? guestName ?? ''} className={guestInput} />
        {e.name && <span className="mt-1 block text-sm text-inv-error">{e.name}</span>}
      </label>

      <fieldset>
        <legend className="mb-2 text-sm text-inv-muted">Kehadiran</legend>
        <div className="grid grid-cols-3 gap-2">
          {OPTIONS.map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-sm transition ${
                attendance === value ? 'border-inv-accent bg-inv-accent text-inv-on-accent' : 'border-inv-line bg-inv-bg text-inv-text'
              }`}
            >
              <input
                type="radio"
                name="attendance"
                value={value}
                checked={attendance === value}
                onChange={() => setAttendance(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        {e.attendance && <span className="mt-1 block text-sm text-inv-error">{e.attendance}</span>}
      </fieldset>

      {attendance !== 'tidak' && (
        <label className="block">
          <span className="mb-1 block text-sm text-inv-muted">Jumlah orang</span>
          <select name="party_size" value={partySize} onChange={(x) => setPartySize(x.target.value)} className={guestInput}>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} orang
              </option>
            ))}
          </select>
          {e.party_size && <span className="mt-1 block text-sm text-inv-error">{e.party_size}</span>}
        </label>
      )}
      {attendance === 'tidak' && <input type="hidden" name="party_size" value="0" />}

      {state.status === 'error' && state.message && (
        <p className="text-sm text-inv-error" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending || disabled} className={`${accentButton} w-full`}>
        {pending ? 'Mengirim…' : 'Kirim Konfirmasi'}
      </button>
      {disabled && <p className="text-center text-xs text-inv-muted">Formulir nonaktif di mode pratinjau.</p>}
    </form>
  )
}
