'use client'

import { useEffect, useState, type CSSProperties } from 'react'
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
      {UNITS.map(([key, label], i) => (
        <div
          key={key}
          data-reveal="zoom"
          style={{ '--d': `${i * 90}ms` } as CSSProperties}
          className="overflow-hidden rounded-xl border border-inv-line bg-inv-surface px-1 py-3 text-center shadow-sm"
        >
          <p className="font-heading text-3xl text-inv-accent tabular-nums">
            {left ? (
              <span key={left[key]} className="inv-tick inline-block">
                {String(left[key]).padStart(2, '0')}
              </span>
            ) : (
              '--'
            )}
          </p>
          <p className="text-xs text-inv-muted">{label}</p>
        </div>
      ))}
    </div>
  )
}
