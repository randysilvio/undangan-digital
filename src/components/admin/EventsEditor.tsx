'use client'

import { Field, inputClass, secondaryButtonClass } from './ui'

export interface EventDraft {
  key: string
  name: string
  date: string
  start_time: string
  end_time: string
  venue_name: string
  address: string
  maps_url: string
}

let counter = 0
export const newEventDraft = (o: Partial<EventDraft> = {}): EventDraft => ({
  key: `ev-${++counter}-${Date.now()}`,
  name: '',
  date: '',
  start_time: '',
  end_time: '',
  venue_name: '',
  address: '',
  maps_url: '',
  ...o,
})

/** Data yang dikirim ke server (tanpa key lokal). */
export const eventsPayload = (events: EventDraft[]) =>
  JSON.stringify(
    events.map((e) => ({
      name: e.name,
      date: e.date,
      start_time: e.start_time,
      end_time: e.end_time,
      venue_name: e.venue_name,
      address: e.address,
      maps_url: e.maps_url,
    })),
  )

export function EventsEditor(props: { events: EventDraft[]; onChange: (e: EventDraft[]) => void; errors: Record<string, string> }) {
  const { events, onChange, errors } = props
  const update = (i: number, patch: Partial<EventDraft>) => onChange(events.map((e, j) => (j === i ? { ...e, ...patch } : e)))
  const move = (i: number, d: number) => {
    const next = [...events]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  const err = (i: number, f: string) => errors[`events.${i}.${f}`]

  return (
    <div className="space-y-4">
      <datalist id="nama-acara">
        <option value="Akad Nikah" />
        <option value="Pemberkatan Nikah" />
        <option value="Resepsi" />
        <option value="Ngunduh Mantu" />
      </datalist>
      {events.length === 0 && <p className="text-sm text-stone-500">Belum ada acara.</p>}
      {events.map((e, i) => (
        <fieldset key={e.key} aria-label={`Acara ${i + 1}`} className="space-y-3 rounded-lg border border-stone-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">Acara {i + 1}</p>
            <div className="flex gap-1">
              <button type="button" className={secondaryButtonClass} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Naikkan">
                ↑
              </button>
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={i === events.length - 1}
                onClick={() => move(i, 1)}
                aria-label="Turunkan"
              >
                ↓
              </button>
              <button type="button" className={secondaryButtonClass} onClick={() => onChange(events.filter((_, j) => j !== i))}>
                Hapus
              </button>
            </div>
          </div>
          <Field label="Nama acara" error={err(i, 'name')}>
            <input list="nama-acara" value={e.name} onChange={(x) => update(i, { name: x.target.value })} className={inputClass} placeholder="Akad Nikah" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Tanggal" error={err(i, 'date')}>
              <input type="date" value={e.date} onChange={(x) => update(i, { date: x.target.value })} className={inputClass} />
            </Field>
            <Field label="Jam mulai" error={err(i, 'start_time')}>
              <input type="time" value={e.start_time} onChange={(x) => update(i, { start_time: x.target.value })} className={inputClass} />
            </Field>
            <Field label="Jam selesai (opsional)" error={err(i, 'end_time')}>
              <input type="time" value={e.end_time} onChange={(x) => update(i, { end_time: x.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="Nama tempat" error={err(i, 'venue_name')}>
            <input value={e.venue_name} onChange={(x) => update(i, { venue_name: x.target.value })} className={inputClass} placeholder="Gedung Serbaguna" />
          </Field>
          <Field label="Alamat" error={err(i, 'address')}>
            <textarea rows={2} value={e.address} onChange={(x) => update(i, { address: x.target.value })} className={inputClass} />
          </Field>
          <Field label="Link Google Maps (opsional)" error={err(i, 'maps_url')} hint="Buka Google Maps → Bagikan → Salin link">
            <input
              type="url"
              value={e.maps_url}
              onChange={(x) => update(i, { maps_url: x.target.value })}
              className={inputClass}
              placeholder="https://maps.app.goo.gl/..."
            />
          </Field>
        </fieldset>
      ))}
      {errors.events && <p className="text-sm text-red-600">{errors.events}</p>}
      <button type="button" className={secondaryButtonClass} onClick={() => onChange([...events, newEventDraft({ date: events.at(-1)?.date ?? '' })])}>
        + Tambah Acara
      </button>
    </div>
  )
}
