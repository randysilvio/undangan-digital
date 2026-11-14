'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { seeded } from '@/lib/seeded'

/**
 * Mengaktifkan animasi "muncul saat digulir" untuk semua elemen [data-reveal] di dalam [data-reveal-root].
 * Tanpa skrip (atau tanpa IntersectionObserver) semua konten tetap tampil seperti biasa.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-reveal-root]')
    if (!root || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    root.setAttribute('data-reveal-ready', '')
    return () => {
      io.disconnect()
      root.removeAttribute('data-reveal-ready')
    }
  }, [])
  return null
}

const CONFETTI_COLORS = ['var(--inv-accent)', '#ffd166', '#4ecdc4', '#ff8fab', '#a78bfa', '#f4a261']

/** Hujan konfeti singkat dari tengah layar, lalu hilang sendiri. */
export function ConfettiBurst() {
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 4200)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div aria-hidden className="inv-confetti">
      {Array.from({ length: 48 }, (_, i) => {
        const angle = seeded(i, 2) * Math.PI * 2
        const dist = 140 + seeded(i, 3) * 260
        const long = seeded(i, 4) > 0.5
        return (
          <i
            key={i}
            style={
              {
                '--dx': `${Math.cos(angle) * dist}px`,
                '--dy': `${Math.sin(angle) * dist * 0.8 + 260}px`,
                '--spin': `${Math.round(seeded(i, 5) * 900 - 450)}deg`,
                '--w': long ? '6px' : '9px',
                '--h': long ? '14px' : '9px',
                '--r': long ? '2px' : '50%',
                '--c': CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                '--t': `${2.4 + seeded(i, 6) * 1.4}s`,
                '--delay': `${seeded(i, 7) * 0.25}s`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
