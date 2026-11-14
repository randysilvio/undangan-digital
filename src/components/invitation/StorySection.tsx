import type { CSSProperties } from 'react'
import { Icon } from '@/components/icons'
import type { StoryItem } from '@/lib/types'
import { Section } from './Section'

/** Garis waktu cerita / perjalanan hidup. */
export function StorySection({ title, items }: { title: string; items: StoryItem[] }) {
  return (
    <Section id="cerita" title={title} tone="surface">
      <ol className="relative space-y-8 pl-10">
        <span aria-hidden className="absolute top-2 bottom-2 left-[15px] w-px bg-gradient-to-b from-transparent via-inv-accent/60 to-transparent" />
        {items.map((s, i) => (
          <li key={i} data-reveal={i % 2 ? 'right' : 'left'} style={{ '--d': `${80 * (i % 3)}ms` } as CSSProperties} className="relative">
            <span
              aria-hidden
              className="absolute top-1 -left-10 flex size-8 items-center justify-center rounded-full border border-inv-accent bg-inv-bg text-inv-accent shadow-sm"
            >
              <span className="size-2.5 rounded-full bg-inv-accent" />
            </span>
            {s.year && <p className="font-heading text-sm font-semibold tracking-[0.2em] text-inv-accent uppercase">{s.year}</p>}
            <h3 className="mt-0.5 font-heading text-xl text-inv-text">{s.title}</h3>
            {s.text && <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-inv-muted">{s.text}</p>}
          </li>
        ))}
      </ol>
    </Section>
  )
}

/** Daftar keluarga (satu nama per baris). */
export function FamilySection({ title, family }: { title: string; family: string }) {
  const names = family
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean)
  return (
    <Section id="keluarga" title={title}>
      <div className="text-center">
        <Icon name="family" className="mx-auto mb-5 size-10 text-inv-accent" />
        <ul className="space-y-2">
          {names.map((n, i) => (
            <li key={i} data-reveal="blur" style={{ '--d': `${60 * Math.min(i, 8)}ms` } as CSSProperties} className="font-heading text-lg text-inv-text">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
