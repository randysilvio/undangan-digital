'use client'

import { startTransition, useActionState, type FormEvent } from 'react'
import { addGuestsAction } from '@/app/admin/(panel)/guest-actions'
import { initialFormState } from '@/lib/validation'
import { buttonClass, Field, inputClass, Notice } from './ui'

export function GuestPaste({ invitationId }: { invitationId: string }) {
  const [state, action, pending] = useActionState(addGuestsAction, initialFormState)

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const form = ev.currentTarget
    const fd = new FormData(form)
    startTransition(() => action(fd))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="id" value={invitationId} />
      <Field label="Tempel daftar nama" hint="Satu nama per baris. Nomor WA opsional setelah koma, contoh: Bu Sri, 0812-3456-7890">
        <textarea
          key={state.status === 'ok' ? state.message : 'draft'}
          name="names"
          rows={6}
          defaultValue={state.values?.names ?? ''}
          className={inputClass}
          placeholder={'Bapak Joko & Keluarga\nBu Sri, 081234567890\nRina'}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Menambahkan…' : 'Tambah Tamu'}
        </button>
        {state.status !== 'idle' && <Notice kind={state.status === 'ok' ? 'ok' : 'error'}>{state.message}</Notice>}
      </div>
    </form>
  )
}
