import type { Invitation } from '@/lib/types'
import { Section } from './Section'

function Person(props: { photo: string | null; name: string; nickname: string; parents: string | null }) {
  return (
    <div className="text-center">
      {props.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto unggahan sudah dikompres
        <img
          src={props.photo}
          alt={props.name}
          loading="lazy"
          className="mx-auto size-40 rounded-full border-4 border-inv-surface object-cover shadow-md ring-1 ring-inv-line"
        />
      ) : (
        <div
          aria-hidden
          className="mx-auto flex size-40 items-center justify-center rounded-full bg-inv-surface font-names text-5xl text-inv-accent ring-1 ring-inv-line"
        >
          {props.nickname.charAt(0)}
        </div>
      )}
      <h3 className="mt-5 font-names text-4xl text-inv-accent">{props.nickname}</h3>
      <p className="mt-1 font-heading text-xl text-inv-text">{props.name}</p>
      {props.parents && <p className="mt-2 text-sm text-inv-muted">{props.parents}</p>}
    </div>
  )
}

export function CoupleSection({ invitation: i }: { invitation: Invitation }) {
  return (
    <Section id="mempelai" title="Mempelai" subtitle="Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan:">
      <div className="space-y-8">
        <Person photo={i.groom_photo_url} name={i.groom_name} nickname={i.groom_nickname} parents={i.groom_parents} />
        <p aria-hidden className="text-center font-names text-5xl text-inv-accent">
          &amp;
        </p>
        <Person photo={i.bride_photo_url} name={i.bride_name} nickname={i.bride_nickname} parents={i.bride_parents} />
      </div>
    </Section>
  )
}
