import type { CSSProperties, ReactNode } from 'react'
import { seeded } from '@/lib/seeded'
import type { ThemeName } from '@/lib/types'

const PETAL = <path d="M12 2C6.5 7.5 6.5 15 12 22c5.5-7 5.5-14.5 0-20z" fill="currentColor" />
const LEAF = (
  <>
    <path d="M3 21C3 10 10 3 21 3c0 11-7 18-18 18z" fill="currentColor" />
    <path d="M3 21 15 9" stroke="white" strokeOpacity=".45" strokeWidth="1" fill="none" />
  </>
)
const BALLOON = (
  <>
    <ellipse cx="12" cy="9" rx="6.5" ry="8" fill="currentColor" />
    <path d="m11 17 1 1.6 1-1.6z" fill="currentColor" />
    <path d="M12 18.6c-1.6 1.4 1.6 2.4 0 4.4" stroke="currentColor" strokeWidth=".8" fill="none" />
    <ellipse cx="9.6" cy="6" rx="1.4" ry="2.2" fill="white" fillOpacity=".45" />
  </>
)
const DUST = <circle cx="12" cy="12" r="4" fill="currentColor" />

interface Preset {
  mode: 'fall' | 'rise' | 'twinkle'
  count: number
  shape: ReactNode
  colors: string[]
  size: [number, number]
  duration: [number, number]
  opacity: number
}

const PRESETS: Partial<Record<ThemeName, Preset>> = {
  elegan: { mode: 'fall', count: 9, shape: PETAL, colors: ['#d8b98a', '#e9cfa8', '#c9a46b'], size: [10, 16], duration: [13, 20], opacity: 0.65 },
  botani: { mode: 'fall', count: 9, shape: LEAF, colors: ['#7c9a76', '#9cb592', '#5f7a5b'], size: [12, 18], duration: [14, 22], opacity: 0.6 },
  mewah: { mode: 'twinkle', count: 18, shape: DUST, colors: ['#d4af6a', '#f3dca6'], size: [3, 7], duration: [3, 6], opacity: 0.85 },
  ceria: { mode: 'rise', count: 7, shape: BALLOON, colors: ['#ff6b6b', '#4ecdc4', '#ffd166', '#a78bfa'], size: [26, 40], duration: [16, 24], opacity: 0.75 },
  pastel: { mode: 'fall', count: 10, shape: PETAL, colors: ['#f4b6d2', '#d9c2f0', '#f9d1e3'], size: [9, 15], duration: [12, 19], opacity: 0.7 },
}

const lerp = ([a, b]: [number, number], t: number) => a + (b - a) * t

/** Partikel dekoratif per tema (kelopak, daun, balon, serbuk emas). Tema Modern sengaja polos. */
export function Ambient({ theme }: { theme: ThemeName }) {
  const p = PRESETS[theme]
  if (!p) return null
  return (
    <div aria-hidden className="inv-ambient" data-mode={p.mode}>
      {Array.from({ length: p.count }, (_, i) => {
        const t = p.duration
        const dur = lerp(t, seeded(i, 11))
        const style = {
          '--x': `${(i / p.count) * 100 + seeded(i, 12) * (80 / p.count)}%`,
          '--y': `${seeded(i, 13) * 92 + 4}%`,
          '--s': `${Math.round(lerp(p.size, seeded(i, 14)))}px`,
          '--c': p.colors[i % p.colors.length],
          '--t': `${dur.toFixed(1)}s`,
          '--delay': `${(-seeded(i, 15) * dur).toFixed(1)}s`,
          '--drift': `${Math.round(seeded(i, 16) * 160 - 80)}px`,
          '--spin': `${Math.round(seeded(i, 17) * 540 - 270)}deg`,
          '--o': p.opacity,
        } as CSSProperties
        return (
          <i key={i} style={style}>
            <svg viewBox="0 0 24 24">{p.shape}</svg>
          </i>
        )
      })}
    </div>
  )
}
