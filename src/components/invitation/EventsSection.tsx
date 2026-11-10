import { googleCalendarUrl } from '@/lib/calendar'
import { formatJam, formatTanggal } from '@/lib/time'
import type { InvitationEvent, TimeZoneId } from '@/lib/types'
import { outlineButton, Section } from './Section'

export function EventsSection(props: { events: InvitationEvent[]; timezone: TimeZoneId; coupleName: string }) {
  return (
    <Section id="acara" title="Waktu & Tempat" tone="surface">
      <div className="space-y-6">
        {props.events.map((e) => (
          <article key={e.id} className="rounded-2xl border border-inv-line bg-inv-bg p-6 text-center shadow-sm">
            <h3 className="font-heading text-2xl text-inv-accent">{e.name}</h3>
            <p className="mt-3 font-medium text-inv-text">{formatTanggal(e.date)}</p>
            <p className="text-inv-text">
              {formatJam(e.start_time, props.timezone)}
              {e.end_time ? ` – ${formatJam(e.end_time, props.timezone)}` : ' – selesai'}
            </p>
            <p className="mt-3 font-medium text-inv-text">{e.venue_name}</p>
            <p className="text-sm text-inv-muted">{e.address}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {e.maps_url && (
                <a href={e.maps_url} target="_blank" rel="noopener noreferrer" className={outlineButton}>
                  Lihat Peta
                </a>
              )}
              <a
                href={googleCalendarUrl({
                  title: `${e.name} — Pernikahan ${props.coupleName}`,
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
      </div>
    </Section>
  )
}
