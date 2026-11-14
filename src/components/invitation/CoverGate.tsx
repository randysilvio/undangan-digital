'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Icon, type IconName } from '@/components/icons'
import { MusicToggle } from './MusicToggle'
import { ConfettiBurst } from './Motion'

interface CoverGateProps {
  guestName: string | null
  coupleName: string
  /** Baris kecil di atas nama, mis. "Undangan Pernikahan". */
  label: string
  /** Ikon khas jenis undangan di atas label. */
  motif?: IconName
  /** Baris di bawah nama, mis. "Ulang Tahun ke-5". */
  subtitle?: string | null
  dateLabel: string | null
  coverUrl: string | null
  musicUrl: string | null
  /** Konfeti saat undangan dibuka (ulang tahun). */
  celebrate?: boolean
  /** Pratinjau admin: tidak mengunci layar. */
  preview?: boolean
  children: ReactNode
}

/** Hiasan sudut dari tema kustom (tersembunyi bila tema tidak punya gambar sudut). */
function Corners() {
  return (
    <>
      <span aria-hidden className="inv-corner inv-corner-tl" />
      <span aria-hidden className="inv-corner inv-corner-tr" />
      <span aria-hidden className="inv-corner inv-corner-bl" />
      <span aria-hidden className="inv-corner inv-corner-br" />
    </>
  )
}

const step = (i: number) => ({ '--i': i }) as CSSProperties

/** Sampul layar penuh. Scroll dikunci sampai tamu menekan "Buka Undangan", lalu musik diputar. */
export function CoverGate({ guestName, coupleName, label, motif, subtitle, dateLabel, coverUrl, musicUrl, celebrate, preview, children }: CoverGateProps) {
  const [opened, setOpened] = useState(Boolean(preview))
  const [burst, setBurst] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (opened) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => {
      document.body.style.overflow = prev
    }
  }, [opened])

  function open() {
    setOpened(true)
    if (celebrate) setBurst(true)
    audioRef.current?.play().catch(() => {
      // Browser menolak autoplay atau file gagal dimuat: abaikan, tamu bisa menekan tombol musik.
    })
    requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <>
      <section
        data-section="sampul"
        className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[var(--inv-cover-bg,var(--inv-text))] px-6 py-16 text-center text-white"
      >
        {coverUrl && (
          <div
            aria-hidden
            className="inv-kenburns absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: `url("${encodeURI(coverUrl)}")` }}
          />
        )}
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'var(--inv-cover-overlay)' }} />
        <div aria-hidden className="inv-default-frame pointer-events-none absolute inset-3 rounded-[1.75rem] border border-white/30 sm:inset-5" />
        <div aria-hidden className="inv-default-frame pointer-events-none absolute inset-5 rounded-[1.4rem] border border-white/15 sm:inset-7" />
        <div aria-hidden className="inv-cover-frame" />
        <Corners />

        <div className="relative">
          {motif && (
            <div className="inv-rise mx-auto mb-5 flex size-16 items-center justify-center rounded-full border border-white/50" style={step(0)}>
              <Icon name={motif} className="inv-draw size-8" />
            </div>
          )}
          <p className="inv-rise text-sm tracking-[0.3em] uppercase opacity-90" style={step(1)}>
            {label}
          </p>
          <h1 className="inv-rise mt-4 font-names text-6xl leading-tight drop-shadow-sm" style={step(2)}>
            {coupleName}
          </h1>
          {subtitle && (
            <p className="inv-rise mt-3 font-heading text-2xl" style={step(3)}>
              {subtitle}
            </p>
          )}
          {dateLabel && (
            <p className="inv-rise mt-4 inline-flex items-center gap-3 font-heading text-xl" style={step(4)}>
              <span aria-hidden className="h-px w-8 bg-white/60" />
              {dateLabel}
              <span aria-hidden className="h-px w-8 bg-white/60" />
            </p>
          )}
          <div className="inv-rise mt-10 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-sm" style={step(5)}>
            <p className="text-sm opacity-90">Kepada Yth.</p>
            <p className="text-sm opacity-90">Bapak/Ibu/Saudara/i</p>
            {guestName && <p className="mt-1 font-heading text-2xl font-semibold">{guestName}</p>}
          </div>
          {!opened && (
            <div className="inv-rise" style={step(6)}>
              <button
                type="button"
                onClick={open}
                className="inv-pulse mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                <Icon name="envelope" className="size-4" /> Buka Undangan
              </button>
            </div>
          )}
        </div>
      </section>
      {burst && <ConfettiBurst />}
      <div ref={contentRef}>{children}</div>
      {musicUrl && <MusicToggle audioRef={audioRef} src={musicUrl} visible={opened} />}
    </>
  )
}
