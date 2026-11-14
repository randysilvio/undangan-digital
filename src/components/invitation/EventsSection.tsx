import type { CSSProperties } from 'react'
import { Icon } from '@/components/icons'
import { googleCalendarUrl } from '@/lib/calendar'
import { formatJam, formatTanggal } from '@/lib/time'
import type { InvitationEvent, TimeZoneId } from '@/lib/types'
import { outlineButton, Section } from './Section'

export function EventsSection(props: {
  events: InvitationEvent[]
  timezone: TimeZoneId
  /** Judul acara di kalender, mis. "Pernikahan Budi & Ani". */
  calendarTitle: string
  dressCode?: string | null
}) {
  return (
    <Section id="acara" title="Waktu & Tempat" tone="surface">
      <div className="space-y-6">
        {props.events.map((e, i) => (
          <article
            key={e.id}
            data-reveal="zoom"
            style={{ '--d': `${i * 120}ms` } as CSSProperties}
            className="relative overflow-hidden rounded-2xl border border-inv-line bg-inv-bg p-6 text-center shadow-sm"
          >
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-inv-accent opacity-70" />
            <h3 className="font-heading text-2xl text-inv-accent">{e.name}</h3>
            <p className="mt-4 flex items-center justify-center gap-2 font-medium text-inv-text">
              <Icon name="calendar" className="size-4 shrink-0 text-inv-accent" />
              {formatTanggal(e.date)}
            </p>
            <p className="mt-1 flex items-center justify-center gap-2 text-inv-text">
              <Icon name="hourglass" className="size-4 shrink-0 text-inv-accent" />
              {formatJam(e.start_time, props.timezone)}
              {e.end_time ? ` – ${formatJam(e.end_time, props.timezone)}` : ' – selesai'}
            </p>
            <div className="mx-auto my-4 h-px w-16 bg-inv-line" />
            <p className="flex items-center justify-center gap-2 font-medium text-inv-text">
              <Icon name="pin" className="size-4 shrink-0 text-inv-accent" />
              {e.venue_name}
            </p>
            <p className="text-sm text-inv-muted">{e.address}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {e.maps_url && (
                <a href={e.maps_url} target="_blank" rel="noopener noreferrer" className={outlineButton}>
                  Lihat Peta
                </a>
              )}
              <a
                href={googleCalendarUrl({
                  title: `${e.name}: ${props.calendarTitle}`,
                  date: e.date,
                  startTime: e.start_time,
                  endTime: e.end_time,
                  timezone: props.timezone,
                  location: `${e.venue_name}, ${e.address}`,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className={outlineButton}
              >
                Simpan ke Kalender
              </a>
            </div>
          </article>
        ))}
        {props.dressCode && (
          <div data-reveal="up" className="flex items-center gap-4 rounded-2xl border border-dashed border-inv-accent/60 bg-inv-bg px-5 py-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-inv-accent text-inv-on-accent">
              <Icon name="shirt" className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-inv-accent uppercase">Dress code</p>
              <p className="text-inv-text">{props.dressCode}</p>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}
