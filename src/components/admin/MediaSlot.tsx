'use client'

import { useState, useTransition } from 'react'
import { setMediaFieldAction } from '@/app/admin/(panel)/media-actions'
import type { MediaField } from '@/lib/data/admin'
import { uploadMedia } from '@/lib/storage'
import { dangerButtonClass, Notice, secondaryButtonClass } from './ui'

interface MediaSlotProps {
  invitationId: string
  field: MediaField
  label: string
  url: string | null
  kind: 'photo' | 'music'
  hint?: string
}

export function MediaSlot({ invitationId, field, label, url, kind, hint }: MediaSlotProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function onFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    const up = await uploadMedia(file, invitationId, kind)
    if ('error' in up) {
      setError(up.error)
      setBusy(false)
      return
    }
    const r = await setMediaFieldAction(invitationId, field, up.url)
    if (!r.ok) setError(r.message)
    setBusy(false)
  }

  function remove() {
    if (!confirm(`Hapus ${label.toLowerCase()}?`)) return
    startTransition(async () => {
      const r = await setMediaFieldAction(invitationId, field, null)
      if (!r.ok) setError(r.message)
    })
  }

  const inputId = `file-${field}`
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-700">{label}</p>
      {url ? (
        kind === 'photo' ? (
          // eslint-disable-next-line @next/next/no-img-element -- pratinjau unggahan
          <img src={url} alt={label} className="h-40 w-full rounded-lg border border-stone-200 object-cover" />
        ) : (
          <audio src={url} controls className="w-full" preload="none" />
        )
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-stone-300 text-sm text-stone-400">
          Belum ada {kind === 'photo' ? 'foto' : 'musik'}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <label htmlFor={inputId} className={`${secondaryButtonClass} cursor-pointer ${busy ? 'pointer-events-none opacity-50' : ''}`}>
          {busy ? 'Mengunggah…' : url ? 'Ganti' : 'Unggah'}
        </label>
        <input
          id={inputId}
          type="file"
          accept={kind === 'photo' ? 'image/jpeg,image/png,image/webp' : 'audio/mpeg,.mp3'}
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            void onFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        {url && (
          <button type="button" onClick={remove} className={dangerButtonClass}>
            Hapus
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
      {error && <Notice kind="error">{error}</Notice>}
    </div>
  )
}
