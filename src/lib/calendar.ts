import { eventInstant } from './time'
import type { TimeZoneId } from './types'

const DEFAULT_DURATION_MS = 2 * 3600_000

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function googleCalendarUrl(e: {
  title: string
  date: string
  startTime: string
  endTime: string | null
  timezone: TimeZoneId
  location: string
}): string {
  const start = eventInstant(e.date, e.startTime, e.timezone)
  const end = e.endTime ? eventInstant(e.date, e.endTime, e.timezone) : new Date(start.getTime() + DEFAULT_DURATION_MS)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    location: e.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
