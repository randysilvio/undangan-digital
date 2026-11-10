'use client'

import { useEffect, useState } from 'react'
import { timeLeft } from '@/lib/time'

const UNITS = [
  ['days', 'Hari'],
  ['hours', 'Jam'],
  ['minutes', 'Menit'],
  ['seconds', 'Detik'],
] as const

/** Hitung mundur; merender "--" sampai terpasang di browser agar tidak ada hydration mismatch. */
export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [])

  const left = now === null ? null : timeLeft(new Date(target), new Date(now))
  if (left?.done) return <p className="text-center font-heading text-xl text-inv-accent">Acara telah berlangsung</p>

  return (
    <div className="grid grid-cols-4 gap-2" aria-live="off">
      {UNITS.map(([key, label]) => (
        <div key={key} className="rounded-xl border border-inv-line bg-inv-surface px-1 py-3 text-center">
          <p className="font-heading text-3xl text-inv-accent tabular-nums">{left ? String(left[key]).padStart(2, '0') : '--'}</p>
          <p className="text-xs text-inv-muted">{label}</p>
        </div>
      ))}
    </div>
  )
}
