'use client'

import { useEffect, useState } from 'react'

const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86400],
  ['month', 30 * 86400],
  ['week', 7 * 86400],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function relativeTime(iso: string, now: number): string {
  const diff = Math.round((new Date(iso).getTime() - now) / 1000)
  for (const [unit, secs] of STEPS) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.trunc(diff / secs), unit)
  }
  return 'baru saja'
}

/** Waktu relatif ("3 jam yang lalu"), dihitung setelah terpasang agar tidak bentrok dengan render server. */
export function RelativeTime({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const t = setTimeout(() => setNow(Date.now()), 0)
    return () => clearTimeout(t)
  }, [])
  return <time dateTime={iso}>{now === null ? '' : relativeTime(iso, now)}</time>
}
