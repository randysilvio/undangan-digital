'use client'

import { useCallback, useEffect, useState } from 'react'
import type { GalleryPhoto } from '@/lib/types'

export function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null)
  const close = useCallback(() => setIndex(null), [])
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? null : (i + d + photos.length) % photos.length)),
    [photos.length],
  )

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [index, close, step])

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`overflow-hidden rounded-lg ${i % 3 === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'}`}
            aria-label={`Perbesar foto ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- foto unggahan sudah dikompres */}
            <img src={p.url} alt={`Foto ${i + 1}`} loading="lazy" className="size-full object-cover transition hover:scale-105" />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${index + 1} dari ${photos.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- foto unggahan sudah dikompres */}
          <img
            src={photos[index].url}
            alt={`Foto ${index + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" onClick={close} aria-label="Tutup" className="absolute top-4 right-4 text-3xl text-white">
            ×
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Sebelumnya"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                className="absolute left-2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Berikutnya"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                className="absolute right-2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
