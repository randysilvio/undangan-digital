'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { saveGiftsAction } from '@/app/admin/(panel)/media-actions'
import type { GiftAccount } from '@/lib/types'
import { initialFormState } from '@/lib/validation'
import { buttonClass, Field, inputClass, Notice, secondaryButtonClass } from './ui'

type Draft = { key: string; provider: string; account_number: string; account_holder: string }
let n = 0
const draft = (o: Partial<Draft> = {}): Draft => ({ key: `gift-${++n}`, provider: '', account_number: '', account_holder: '', ...o })

export function GiftsEditor({ invitationId, gifts }: { invitationId: string; gifts: GiftAccount[] }) {
  const [state, action, pending] = useActionState(saveGiftsAction, initialFormState)
  const [rows, setRows] = useState<Draft[]>(() => gifts.map((g) => draft(g)))
  const e = state.fieldErrors ?? {}
  const update = (i: number, patch: Partial<Draft>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const fd = new FormData()
    fd.set('id', invitationId)
    fd.set('gifts', JSON.stringify(rows.map(({ provider, account_number, account_holder }) => ({ provider, account_number, account_holder }))))
    startTransition(() => action(fd))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {rows.length === 0 && <p className="text-sm text-stone-500">Belum ada rekening. Bagian amplop disembunyikan di undangan.</p>}
      {rows.map((r, i) => (
        <fieldset key={r.key} className="grid gap-3 rounded-lg border border-stone-200 p-4 sm:grid-cols-[1fr_1.4fr_1.4fr_auto] sm:items-start">
          <Field label="Bank / e-wallet" error={e[`gifts.${i}.provider`]}>
            <input value={r.provider} onChange={(x) => update(i, { provider: x.target.value })} className={inputClass} placeholder="BCA / DANA" />
          </Field>
          <Field label="Nomor" error={e[`gifts.${i}.account_number`]}>
            <input
              inputMode="numeric"
              value={r.account_number}
              onChange={(x) => update(i, { account_number: x.target.value })}
              className={inputClass}
              placeholder="1234567890"
            />
          </Field>
          <Field label="Atas nama" error={e[`gifts.${i}.account_holder`]}>
            <input value={r.account_holder} onChange={(x) => update(i, { account_holder: x.target.value })} className={inputClass} />
          </Field>
          <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className={`${secondaryButtonClass} sm:mt-6`}>
            Hapus
          </button>
        </fieldset>
      ))}
      {e.gifts && <Notice kind="error">{e.gifts}</Notice>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setRows([...rows, draft()])} className={secondaryButtonClass}>
          + Tambah Rekening
        </button>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Menyimpan…' : 'Simpan Rekening'}
        </button>
        {state.status !== 'idle' && <Notice kind={state.status === 'ok' ? 'ok' : 'error'}>{state.message}</Notice>}
      </div>
    </form>
  )
}
