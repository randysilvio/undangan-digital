'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MusicToggle } from './MusicToggle'

interface CoverGateProps {
  guestName: string | null
  coupleName: string
  /** Baris kecil di atas nama, mis. "Undangan Pernikahan". */
  label: string
  /** Hiasan di atas label (boleh kosong). */
  emoji?: string
  /** Baris di bawah nama, mis. "Ulang Tahun ke-5". */
  subtitle?: string | null
  dateLabel: string | null
  coverUrl: string | null
  musicUrl: string | null
  /** Pratinjau admin: tidak mengunci layar. */
  preview?: boolean
  children: ReactNode
}

/** Sampul layar penuh. Scroll dikunci sampai tamu menekan "Buka Undangan", lalu musik diputar. */
export function CoverGate({ guestName, coupleName, label, emoji, subtitle, dateLabel, coverUrl, musicUrl, preview, children }: CoverGateProps) {
  const [opened, setOpened] = useState(Boolean(preview))
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
    audioRef.current?.play().catch(() => {
      // Browser menolak autoplay atau file gagal dimuat: abaikan, tamu bisa menekan tombol musik.
    })
    requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <>
      <section
        data-section="sampul"
        className="relative flex min-h-dvh flex-col items-center justify-center bg-[var(--inv-cover-bg,var(--inv-text))] bg-cover bg-center px-6 py-16 text-center text-white"
        style={coverUrl ? { backgroundImage: `url("${encodeURI(coverUrl)}")` } : undefined}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: 'var(--inv-cover-overlay)' }} />
        <div className="inv-fade-in relative">
          {emoji && (
            <p aria-hidden className="mb-3 text-4xl">
              {emoji}
            </p>
          )}
          <p className="text-sm tracking-[0.3em] uppercase opacity-90">{label}</p>
          <h1 className="mt-4 font-names text-6xl leading-tight">{coupleName}</h1>
          {subtitle && <p className="mt-3 font-heading text-2xl">{subtitle}</p>}
          {dateLabel && <p className="mt-4 font-heading text-xl">{dateLabel}</p>}
          <div className="mt-10 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">Kepada Yth.</p>
            <p className="text-sm opacity-90">Bapak/Ibu/Saudara/i</p>
            {guestName && <p className="mt-1 font-heading text-2xl font-semibold">{guestName}</p>}
          </div>
          {!opened && (
            <button
              type="button"
              onClick={open}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-800 shadow-lg transition hover:bg-white/90"
            >
              <span aria-hidden>✉</span> Buka Undangan
            </button>
          )}
        </div>
      </section>
      <div ref={contentRef}>{children}</div>
      {musicUrl && <MusicToggle audioRef={audioRef} src={musicUrl} visible={opened} />}
    </>
  )
}
