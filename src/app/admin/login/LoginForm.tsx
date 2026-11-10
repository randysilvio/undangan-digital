'use client'

import { useActionState } from 'react'
import { buttonClass, Field, inputClass, Notice } from '@/components/admin/ui'
import { initialFormState } from '@/lib/validation'
import { login } from './actions'

export function LoginForm({ next, error }: { next: string; error: string | null }) {
  const [state, action, pending] = useActionState(login, initialFormState)
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.status === 'error' && <Notice kind="error">{state.message}</Notice>}
      {state.status === 'idle' && error === 'akses' && <Notice kind="error">Akun ini tidak punya akses admin</Notice>}
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={inputClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? 'Masuk…' : 'Masuk'}
      </button>
    </form>
  )
}
