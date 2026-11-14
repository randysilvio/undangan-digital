'use client'

import { useState, type RefObject } from 'react'
import { Icon } from '@/components/icons'

export function MusicToggle({ src, visible, audioRef }: { src: string; visible: boolean; audioRef: RefObject<HTMLAudioElement | null> }) {
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => setFailed(true))
    else audio.pause()
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      {visible && !failed && (
        <button
          type="button"
          aria-label={playing ? 'Jeda musik' : 'Putar musik'}
          onClick={toggle}
          className="fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full bg-inv-accent text-inv-on-accent shadow-lg ring-4 ring-inv-accent/20 transition hover:scale-105"
        >
          {playing ? (
            <span aria-hidden className="inv-eq flex h-4 items-end gap-[3px]">
              <span className="h-full" />
              <span className="h-full" />
              <span className="h-full" />
            </span>
          ) : (
            <Icon name="music" className="size-5" />
          )}
        </button>
      )}
    </>
  )
}
