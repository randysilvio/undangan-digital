import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 disabled:bg-stone-100'

export const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50'

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50'

export const dangerButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50'

export function Field(props: { label: string; name?: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-stone-700">{props.label}</span>
      {props.children}
      {props.hint && !props.error && <span className="block text-xs text-stone-500">{props.hint}</span>}
      {props.error && (
        <span className="block text-sm text-red-600" role="alert">
          {props.error}
        </span>
      )}
    </label>
  )
}

export function Card(props: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      {(props.title || props.actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {props.title && <h2 className="text-lg font-semibold text-stone-900">{props.title}</h2>}
          {props.actions}
        </div>
      )}
      {props.children}
    </section>
  )
}

export function Notice(props: { kind: 'ok' | 'error'; children: ReactNode }) {
  const cls = props.kind === 'ok' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'
  return (
    <p className={`rounded-lg border px-3 py-2 text-sm ${cls}`} role={props.kind === 'error' ? 'alert' : 'status'}>
      {props.children}
    </p>
  )
}
