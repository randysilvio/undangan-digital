import type { CSSProperties, ReactNode } from 'react'

export type SectionId =
  | 'sampul'
  | 'pembuka'
  | 'mempelai'
  | 'cerita'
  | 'hitung-mundur'
  | 'acara'
  | 'galeri'
  | 'keluarga'
  | 'amplop'
  | 'rsvp'
  | 'ucapan'
  | 'penutup'

const WAVE = 'M0 48h1440V18c-96 14-216 26-360 16S852 0 720 4 468 38 336 38 108 10 0 20z'

/** Gelombang lembut di tepi bagian berwarna "surface", agar perpindahan bagian tidak kaku. */
function Wave({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={`inv-wave pointer-events-none absolute inset-x-0 z-10 h-5 w-full text-inv-surface sm:h-8 ${
        edge === 'top' ? 'top-px -translate-y-full' : 'bottom-px translate-y-full rotate-180'
      }`}
    >
      <path fill="currentColor" d={WAVE} />
    </svg>
  )
}

export function Section(props: { id: SectionId; title?: string; subtitle?: string; tone?: 'bg' | 'surface'; children: ReactNode }) {
  const surface = props.tone === 'surface'
  return (
    <section data-section={props.id} id={props.id} className={`${surface ? 'bg-inv-surface' : 'bg-inv-bg'} relative px-6 py-16`}>
      {surface && <Wave edge="top" />}
      <div className="mx-auto max-w-md">
        {props.title && (
          <header data-reveal="blur" className="mb-8 text-center">
            <h2 className="font-heading text-3xl text-inv-text">{props.title}</h2>
            <Ornament />
            {props.subtitle && <p className="mt-3 text-sm whitespace-pre-line text-inv-muted">{props.subtitle}</p>}
          </header>
        )}
        <div data-reveal="up" style={{ '--d': '120ms' } as CSSProperties}>
          {props.children}
        </div>
      </div>
      {surface && <Wave edge="bottom" />}
    </section>
  )
}

/** Hiasan pemisah; bentuknya mengikuti tema (lihat --inv-ornament di globals.css). */
export function Ornament() {
  return (
    <div aria-hidden className="mx-auto mt-3 flex justify-center text-inv-accent">
      <span className="inv-ornament" />
    </div>
  )
}

export const accentButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-inv-accent px-5 py-2.5 text-sm font-medium text-inv-on-accent shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:opacity-95 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0'

export const outlineButton =
  'inline-flex items-center justify-center gap-2 rounded-full border border-inv-accent px-4 py-2 text-sm font-medium text-inv-accent transition hover:bg-inv-accent hover:text-inv-on-accent'
