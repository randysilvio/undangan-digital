'use client'

import { startTransition, useActionState, type FormEvent } from 'react'
import { saveSettingsAction } from '@/app/admin/(panel)/theme-actions'
import { MAX_PACKAGES } from '@/lib/site-settings'
import type { SiteSettings } from '@/lib/types'
import { initialFormState } from '@/lib/validation'
import { buttonClass, Card, Field, inputClass, Notice } from './ui'

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, initialFormState)
  const e = state.fieldErrors ?? {}
  const packages = Array.isArray(initial.packages) ? initial.packages : []

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    startTransition(() => action(fd))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card title="Kontak">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Nomor WhatsApp" error={e.whatsapp} hint="Tombol “Pesan via WhatsApp” muncul bila diisi.">
            <input name="whatsapp" defaultValue={initial.whatsapp ?? ''} inputMode="tel" className={inputClass} placeholder="081234567890" />
          </Field>
          <Field label="Instagram" error={e.instagram}>
            <input name="instagram" defaultValue={initial.instagram ?? ''} className={inputClass} placeholder="valynz.id" />
          </Field>
          <Field label="Email" error={e.email}>
            <input name="email" type="email" defaultValue={initial.email ?? ''} className={inputClass} placeholder="halo@valynz.id" />
          </Field>
        </div>
      </Card>

      <Card title="Paket Harga">
        <p className="mb-4 text-sm text-stone-500">Isi hingga {MAX_PACKAGES} paket. Paket yang dikosongkan tidak ditampilkan; bila semua kosong, bagian harga disembunyikan.</p>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: MAX_PACKAGES }, (_, i) => {
            const p = packages[i]
            return (
              <fieldset key={i} className="space-y-3 rounded-lg border border-stone-200 p-4">
                <legend className="px-1 text-sm font-medium">Paket {i + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nama paket" error={e[`package_${i}_name`]}>
                    <input name={`package_${i}_name`} defaultValue={p?.name ?? ''} maxLength={40} className={inputClass} placeholder={['Hemat', 'Favorit', 'Eksklusif', 'Custom'][i]} />
                  </Field>
                  <Field label="Harga" error={e[`package_${i}_price`]}>
                    <input name={`package_${i}_price`} defaultValue={p?.price ?? ''} maxLength={40} className={inputClass} placeholder="Rp…" />
                  </Field>
                </div>
                <Field label="Isi paket (satu per baris)" error={e[`package_${i}_features`]}>
                  <textarea name={`package_${i}_features`} rows={4} defaultValue={p?.features.join('\n') ?? ''} className={inputClass} />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`package_${i}_highlight`} defaultChecked={p?.highlight ?? false} />
                  Tandai sebagai paket unggulan
                </label>
              </fieldset>
            )
          })}
        </div>
      </Card>

      <Card title="Promosi di Undangan">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="show_credit" defaultChecked={initial.show_credit} className="mt-1" />
          <span>
            <span className="block font-medium">Tampilkan tulisan kecil “Undangan digital oleh Valynz.id” di akhir setiap undangan</span>
            <span className="block text-sm text-stone-500">Berlaku untuk semua undangan, termasuk yang sudah terbit. Matikan bila klien tidak menginginkannya.</span>
          </span>
        </label>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </button>
        {state.status === 'ok' && <Notice kind="ok">{state.message}</Notice>}
        {state.status === 'error' && <Notice kind="error">{state.message}</Notice>}
      </div>
    </form>
  )
}
