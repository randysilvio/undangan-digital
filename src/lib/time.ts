import type { TimeZoneId } from './types'

/** Indonesia tidak memakai DST, jadi offset tetap. */
export const TIMEZONES: Record<TimeZoneId, { label: 'WIB' | 'WITA' | 'WIT'; offsetHours: number }> = {
  'Asia/Jakarta': { label: 'WIB', offsetHours: 7 },
  'Asia/Makassar': { label: 'WITA', offsetHours: 8 },
  'Asia/Jayapura': { label: 'WIT', offsetHours: 9 },
}

/** Waktu absolut dari tanggal + jam lokal di zona undangan. */
export function eventInstant(date: string, time: string, tz: TimeZoneId): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh - TIMEZONES[tz].offsetHours, mm))
}

/** Acara yang paling awal berlangsung (bukan sekadar urutan pertama di daftar). */
export function earliestEvent<E extends { date: string; start_time: string }>(events: E[], tz: TimeZoneId): E | null {
  let best: E | null = null
  for (const e of events) {
    if (!best || eventInstant(e.date, e.start_time, tz) < eventInstant(best.date, best.start_time, tz)) best = e
  }
  return best
}

export function timeLeft(target: Date, now: Date) {
  const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    done: diff === 0,
  }
}

const tanggalFormat = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatTanggal(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return tanggalFormat.format(new Date(Date.UTC(y, m - 1, d)))
}

export function formatJam(time: string, tz: TimeZoneId): string {
  return `${time.slice(0, 5).replace(':', '.')} ${TIMEZONES[tz].label}`
}

/** "dd/MM/yyyy HH.mm" dari timestamp ISO, di zona undangan. */
export function formatTimestamp(iso: string, tz: TimeZoneId): string {
  const t = new Date(new Date(iso).getTime() + TIMEZONES[tz].offsetHours * 3600_000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(t.getUTCDate())}/${p(t.getUTCMonth() + 1)}/${t.getUTCFullYear()} ${p(t.getUTCHours())}.${p(t.getUTCMinutes())}`
}
