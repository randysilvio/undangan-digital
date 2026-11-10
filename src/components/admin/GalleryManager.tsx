'use client'

import { useState, useTransition } from 'react'
import { addGalleryPhotosAction, deleteGalleryPhotoAction } from '@/app/admin/(panel)/media-actions'
import { uploadMedia } from '@/lib/storage'
import type { GalleryPhoto } from '@/lib/types'
import { MAX_GALLERY_PHOTOS } from '@/lib/upload'
import { Notice, secondaryButtonClass } from './ui'

export function GalleryManager({ invitationId, photos }: { invitationId: string; photos: GalleryPhoto[] }) {
  const [progress, setProgress] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [, startTransition] = useTransition()
  const remaining = MAX_GALLERY_PHOTOS - photos.length

  async function onFiles(list: FileList | null) {
    if (!list?.length) return
    const files = Array.from(list)
    const errs: string[] = []
    if (files.length > remaining) {
      errs.push(`Maksimal ${MAX_GALLERY_PHOTOS} foto galeri — ${files.length - Math.max(remaining, 0)} foto dilewati`)
    }
    const accepted = files.slice(0, Math.max(remaining, 0))
    const urls: string[] = []
    for (const [i, file] of accepted.entries()) {
      setProgress(`Mengunggah ${i + 1} dari ${accepted.length}…`)
      const r = await uploadMedia(file, invitationId, 'photo')
      if ('error' in r) errs.push(`${file.name}: ${r.error}`)
      else urls.push(r.url)
    }
    if (urls.length) {
      setProgress('Menyimpan…')
      const r = await addGalleryPhotosAction(invitationId, urls)
      if (!r.ok) errs.push(r.message)
    }
    setErrors(errs)
    setProgress(null)
  }

  function remove(photoId: string) {
    if (!confirm('Hapus foto ini dari galeri?')) return
    startTransition(async () => {
      const r = await deleteGalleryPhotoAction(invitationId, photoId)
      if (!r.ok) setErrors([r.message])
    })
  }

  return (
    <div className="space-y-4">
      {photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((p) => (
            <li key={p.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau unggahan */}
              <img src={p.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label="Hapus foto"
                className="absolute top-1 right-1 rounded-full bg-black/60 px-2 text-white"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone-500">Belum ada foto galeri.</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="gallery-files"
          className={`${secondaryButtonClass} cursor-pointer ${progress || remaining <= 0 ? 'pointer-events-none opacity-50' : ''}`}
        >
          + Tambah Foto
        </label>
        <input
          id="gallery-files"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={Boolean(progress) || remaining <= 0}
          onChange={(e) => {
            void onFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <span className="text-sm text-stone-500">{progress ?? `${photos.length}/${MAX_GALLERY_PHOTOS} foto`}</span>
      </div>
      {errors.length > 0 && (
        <Notice kind="error">
          {errors.map((e) => (
            <span key={e} className="block">
              {e}
            </span>
          ))}
        </Notice>
      )}
    </div>
  )
}
