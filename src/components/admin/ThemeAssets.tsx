'use client'

import { useState, useTransition } from 'react'
import { setThemeAssetAction } from '@/app/admin/(panel)/theme-actions'
import { THEME_SLOTS, type SlotInfo } from '@/lib/custom-theme'
import { uploadThemeAsset } from '@/lib/storage'
import type { CustomTheme } from '@/lib/types'
import { dangerButtonClass, Notice, secondaryButtonClass } from './ui'

function Slot({ themeId, info, url, onChanged }: { themeId: string; info: SlotInfo; url?: string; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function onFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    const up = await uploadThemeAsset(file, themeId, info)
    if ('error' in up) {
      setError(up.error)
      setBusy(false)
      return
    }
    const r = await setThemeAssetAction(themeId, info.slot, up.url)
    if (!r.ok) setError(r.message)
    else onChanged()
    setBusy(false)
  }

  function remove() {
    if (!confirm(`Hapus ${info.label.toLowerCase()}?`)) return
    startTransition(async () => {
      const r = await setThemeAssetAction(themeId, info.slot, null)
      if (!r.ok) setError(r.message)
      else onChanged()
    })
  }

  const inputId = `slot-${info.slot}`
  return (
    <div className="space-y-2 rounded-lg border border-stone-200 p-3">
      <p className="text-sm font-medium text-stone-800">{info.label}</p>
      <div className="flex h-28 items-center justify-center overflow-hidden rounded-md border border-dashed border-stone-300 bg-[repeating-conic-gradient(#f5f5f4_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- pratinjau unggahan
          <img src={url} alt={info.label} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs text-stone-400">Kosong, memakai tema dasar</span>
        )}
      </div>
      <p className="text-xs text-stone-500">{info.hint}</p>
      <div className="flex flex-wrap gap-2">
        <label htmlFor={inputId} className={`${secondaryButtonClass} cursor-pointer ${busy ? 'pointer-events-none opacity-50' : ''}`}>
          {busy ? 'Mengunggah…' : url ? 'Ganti' : 'Unggah'}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
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
      {error && <Notice kind="error">{error}</Notice>}
    </div>
  )
}

/** Gambar hiasan tema + pratinjau HP yang dimuat ulang setiap ada perubahan. */
export function ThemeAssets({ theme }: { theme: CustomTheme }) {
  const [version, setVersion] = useState(0)
  const [kind, setKind] = useState('pernikahan')
  const bump = () => setVersion((v) => v + 1)
  const previewUrl = `/admin/tema-pratinjau/${theme.id}?jenis=${kind}&v=${version}-${theme.updated_at}`

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-3 sm:grid-cols-2">
        {THEME_SLOTS.map((s) => (
          <Slot key={s.slot} themeId={theme.id} info={s} url={theme.assets[s.slot]} onChanged={bump} />
        ))}
      </div>
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-stone-700">Pratinjau HP</p>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-md border border-stone-300 bg-white px-2 py-1 text-sm">
            <option value="pernikahan">Pernikahan</option>
            <option value="ultah-anak">Ulang tahun anak</option>
            <option value="sweet-seventeen">Sweet seventeen</option>
            <option value="ultah-dewasa">Ulang tahun dewasa</option>
            <option value="ultah-syukur">Syukuran</option>
          </select>
        </div>
        <div className="mx-auto w-[360px] overflow-hidden rounded-[2rem] border-8 border-stone-800 bg-white shadow-xl">
          <iframe key={previewUrl} src={previewUrl} title="Pratinjau tema" className="h-[640px] w-full" />
        </div>
      </div>
    </div>
  )
}
