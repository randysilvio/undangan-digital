import type { CSSProperties } from 'react'
import { ageLabel, isWedding, KINDS } from '@/lib/kinds'
import type { Invitation } from '@/lib/types'
import { Section } from './Section'

function Person(props: { photo: string | null; name: string; nickname: string; parents: string | null; from?: 'left' | 'right' | 'zoom' }) {
  return (
    <div data-reveal={props.from ?? 'zoom'} className="text-center">
      <div className="relative mx-auto size-48">
        <svg aria-hidden viewBox="0 0 100 100" className="inv-spin-slow absolute inset-0 size-full text-inv-accent">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth=".6" strokeDasharray="1.5 3.2" />
        </svg>
        {props.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto unggahan sudah dikompres
          <img
            src={props.photo}
            alt={props.name}
            loading="lazy"
            className="absolute inset-4 size-40 rounded-full border-4 border-inv-surface object-cover shadow-md ring-1 ring-inv-line"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-4 flex size-40 items-center justify-center rounded-full bg-inv-surface font-names text-5xl text-inv-accent ring-1 ring-inv-line"
          >
            {props.nickname.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="mt-4 font-names text-4xl text-inv-accent">{props.nickname}</h3>
      <p className="mt-1 font-heading text-xl text-inv-text">{props.name}</p>
      {props.parents && <p className="mt-2 text-sm text-inv-muted">{props.parents}</p>}
    </div>
  )
}

/** Tokoh utama: dua mempelai (pernikahan) atau satu orang yang berulang tahun. */
export function CoupleSection({ invitation: i, intro }: { invitation: Invitation; intro: string }) {
  if (!isWedding(i.kind)) {
    const age = ageLabel(i.kind, i.age)
    return (
      <Section id="mempelai" title={KINDS[i.kind].personTitle} subtitle={intro}>
        <Person photo={i.groom_photo_url} name={i.groom_name} nickname={i.groom_nickname} parents={i.groom_parents} />
        {i.age && (
          <div data-reveal="zoom" style={{ '--d': '250ms' } as CSSProperties} className="mt-8 flex flex-col items-center">
            <div className="relative flex size-28 items-center justify-center rounded-full bg-inv-accent text-inv-on-accent shadow-lg">
              <span aria-hidden className="absolute inset-1.5 rounded-full border border-current opacity-40" />
              <span className="font-heading text-5xl leading-none tabular-nums">{i.age}</span>
            </div>
            {age && <p className="mt-3 font-heading text-lg text-inv-text">{age}</p>}
          </div>
        )}
      </Section>
    )
  }
  return (
    <Section id="mempelai" title="Mempelai" subtitle={intro}>
      <div className="space-y-8">
        <Person photo={i.groom_photo_url} name={i.groom_name} nickname={i.groom_nickname} parents={i.groom_parents} from="left" />
        <p data-reveal="zoom" aria-hidden className="text-center font-names text-5xl text-inv-accent">
          &amp;
        </p>
        <Person photo={i.bride_photo_url} name={i.bride_name ?? ''} nickname={i.bride_nickname ?? ''} parents={i.bride_parents} from="right" />
      </div>
    </Section>
  )
}
