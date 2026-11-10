'use client'

import { useActionState } from 'react'
import { duplicateAction, setStatusAction } from '@/app/admin/(panel)/actions'
import type { InvitationStatus } from '@/lib/types'
import { initialFormState } from '@/lib/validation'
import { buttonClass, Card, Notice, secondaryButtonClass } from './ui'

export function PublishPanel({ id, status }: { id: string; status: InvitationStatus }) {
  const [state, action, pending] = useActionState(setStatusAction, initialFormState)
  const published = status === 'published'
  return (
    <Card title="Status">
      <p className="mb-3 text-sm text-stone-600">
        {published
          ? 'Undangan sudah terbit dan bisa dibuka tamu.'
          : 'Undangan masih draft: tamu belum bisa membukanya. Periksa di tab Pratinjau, lalu terbitkan.'}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={published ? 'draft' : 'published'} />
          <button disabled={pending} className={published ? secondaryButtonClass : buttonClass}>
            {pending ? 'Memproses…' : published ? 'Jadikan Draft' : 'Terbitkan'}
          </button>
        </form>
        <form action={duplicateAction}>
          <input type="hidden" name="id" value={id} />
          <button className={secondaryButtonClass}>Duplikat</button>
        </form>
      </div>
      {state.status !== 'idle' && (
        <div className="mt-3">
          <Notice kind={state.status === 'ok' ? 'ok' : 'error'}>{state.message}</Notice>
        </div>
      )}
    </Card>
  )
}
