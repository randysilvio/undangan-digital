import type { ReactNode } from 'react'

export type SectionId =
  | 'sampul'
  | 'pembuka'
  | 'mempelai'
  | 'hitung-mundur'
  | 'acara'
  | 'galeri'
  | 'amplop'
  | 'rsvp'
  | 'ucapan'
  | 'penutup'

export function Section(props: { id: SectionId; title?: string; subtitle?: string; tone?: 'bg' | 'surface'; children: ReactNode }) {
  const tone = props.tone === 'surface' ? 'bg-inv-surface' : 'bg-inv-bg'
  return (
    <section data-section={props.id} id={props.id} className={`${tone} px-6 py-16`}>
      <div className="inv-fade-in mx-auto max-w-md">
        {props.title && (
          <header className="mb-8 text-center">
            <h2 className="font-heading text-3xl text-inv-text">{props.title}</h2>
            <Ornament />
            {props.subtitle && <p className="mt-3 text-sm text-inv-muted">{props.subtitle}</p>}
          </header>
        )}
        {props.children}
      </div>
    </section>
  )
}

export function Ornament() {
  return (
    <div aria-hidden className="mx-auto mt-3 flex items-center justify-center gap-2 text-inv-accent">
      <span className="h-px w-10 bg-current opacity-60" />
      <span className="text-xs">✦</span>
      <span className="h-px w-10 bg-current opacity-60" />
    </div>
  )
}

export const accentButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-inv-accent px-5 py-2.5 text-sm font-medium text-inv-on-accent shadow-sm transition hover:opacity-90 disabled:opacity-50'

export const outlineButton =
  'inline-flex items-center justify-center gap-2 rounded-full border border-inv-accent px-4 py-2 text-sm font-medium text-inv-accent transition hover:bg-inv-accent hover:text-inv-on-accent'
