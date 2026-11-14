import type { CSSProperties } from 'react'
import { isJoint, isWedding, KINDS, singleAgeLabel } from '@/lib/kinds'
import { formatTanggalLahir } from '@/lib/time'
import type { Invitation, InvitationKind } from '@/lib/types'
import { Section } from './Section'

interface PersonProps {
  photo: string | null
  name: string
  nickname: string
  parents: string | null
  from?: 'left' | 'right' | 'zoom'
}

function Person(props: PersonProps) {
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

/**
 * Lencana usia + tanggal lahir. Varian "solid" (warna aksen) untuk orang pertama dan "ring" (garis aksen)
 * untuk orang kedua, agar dua usia mudah dibedakan.
 */
function AgeBadge({ kind, age, birthDate, variant = 'solid', delay = 250 }: { kind: InvitationKind; age: number | null; birthDate: string | null; variant?: 'solid' | 'ring'; delay?: number }) {
  if (!age && !birthDate) return null
  const label = singleAgeLabel(kind, age)
  return (
    <div data-reveal="zoom" style={{ '--d': `${delay}ms` } as CSSProperties} className="mt-6 flex flex-col items-center">
      {age && (
        <div
          className={`relative flex size-24 items-center justify-center rounded-full shadow-lg ${
            variant === 'solid' ? 'bg-inv-accent text-inv-on-accent' : 'border-2 border-inv-accent bg-inv-surface text-inv-accent'
          }`}
        >
          <span aria-hidden className="absolute inset-1.5 rounded-full border border-current opacity-40" />
          <span className="font-heading text-4xl leading-none tabular-nums">{age}</span>
        </div>
      )}
      {label && <p className="mt-3 font-heading text-lg text-inv-text">{label}</p>}
      {birthDate && <p className="mt-0.5 text-sm text-inv-muted">Lahir {formatTanggalLahir(birthDate)}</p>}
    </div>
  )
}

/** Tokoh utama: dua mempelai, satu orang yang berulang tahun, atau dua orang yang dirayakan bersama. */
export function CoupleSection({ invitation: i, intro }: { invitation: Invitation; intro: string }) {
  if (!isWedding(i.kind)) {
    const title = KINDS[i.kind].personTitle
    if (isJoint(i)) {
      return (
        <Section id="mempelai" title={title} subtitle={intro}>
          <div className="space-y-10">
            <div>
              <Person photo={i.groom_photo_url} name={i.groom_name} nickname={i.groom_nickname} parents={i.groom_parents} from="left" />
              <AgeBadge kind={i.kind} age={i.age} birthDate={i.birth_date} />
            </div>
            <p data-reveal="zoom" aria-hidden className="text-center font-names text-5xl text-inv-accent">
              &amp;
            </p>
            <div>
              <Person photo={i.bride_photo_url} name={i.bride_name ?? ''} nickname={i.bride_nickname ?? ''} parents={i.bride_parents} from="right" />
              <AgeBadge kind={i.kind} age={i.age2} birthDate={i.birth_date2} variant="ring" />
            </div>
          </div>
        </Section>
      )
    }
    return (
      <Section id="mempelai" title={title} subtitle={intro}>
        <Person photo={i.groom_photo_url} name={i.groom_name} nickname={i.groom_nickname} parents={i.groom_parents} />
        <AgeBadge kind={i.kind} age={i.age} birthDate={i.birth_date} />
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
