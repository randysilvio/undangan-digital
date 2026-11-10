'use client'

import { useState, type RefObject } from 'react'

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
          className="fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full bg-inv-accent text-lg text-inv-on-accent shadow-lg"
        >
          <span aria-hidden className={playing ? 'inline-block animate-[spin_4s_linear_infinite]' : ''}>
            {playing ? '♫' : '▶'}
          </span>
        </button>
      )}
    </>
  )
}
