'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { saveInvitationAction } from '@/app/admin/(panel)/actions'
import { slugify } from '@/lib/slug'
import { TIMEZONES } from '@/lib/time'
import type { InvitationFull } from '@/lib/types'
import { initialFormState } from '@/lib/validation'
import { THEMES } from '@/themes'
import { EventsEditor, eventsPayload, newEventDraft, type EventDraft } from './EventsEditor'
import { buttonClass, Card, Field, inputClass, Notice } from './ui'

export function InvitationForm({ invitation, siteUrl }: { invitation?: InvitationFull; siteUrl: string }) {
  const [state, action, pending] = useActionState(saveInvitationAction, initialFormState)
  const [events, setEvents] = useState<EventDraft[]>(() =>
    invitation
      ? invitation.events.map((e) => newEventDraft({ ...e, end_time: e.end_time ?? '', maps_url: e.maps_url ?? '' }))
      : [newEventDraft({ name: 'Akad Nikah' }), newEventDraft({ name: 'Resepsi' })],
  )
  const [slug, setSlug] = useState(invitation?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(invitation))
  const [nick, setNick] = useState({ groom: invitation?.groom_nickname ?? '', bride: invitation?.bride_nickname ?? '' })
  const e = state.fieldErrors ?? {}

  function onNick(which: 'groom' | 'bride', value: string) {
    const next = { ...nick, [which]: value }
    setNick(next)
    if (!slugTouched) setSlug(slugify(`${next.groom} ${next.bride}`))
  }

  // Kirim tanpa reset formulir bawaan React, agar isian tetap ada bila ada error.
  const slugChangedWhilePublished = invitation?.status === 'published' && slug !== invitation.slug

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (
      slugChangedWhilePublished &&
      !confirm(`Alamat undangan akan berubah dari /${invitation.slug} menjadi /${slug}.\n\nSemua link yang SUDAH dikirim ke tamu tidak akan bisa dibuka lagi. Lanjutkan?`)
    ) {
      return
    }
    const fd = new FormData(ev.currentTarget)
    fd.set('events', eventsPayload(events))
    startTransition(() => action(fd))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {invitation && <input type="hidden" name="id" value={invitation.id} />}

      <Card title="Mempelai">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <Field label="Nama lengkap mempelai pria" error={e.groom_name}>
              <input name="groom_name" defaultValue={invitation?.groom_name} className={inputClass} placeholder="Budi Santoso, S.T." />
            </Field>
            <Field label="Nama panggilan pria" error={e.groom_nickname}>
              <input name="groom_nickname" value={nick.groom} onChange={(x) => onNick('groom', x.target.value)} className={inputClass} placeholder="Budi" />
            </Field>
            <Field label="Keterangan orang tua (opsional)" error={e.groom_parents}>
              <input
                name="groom_parents"
                defaultValue={invitation?.groom_parents ?? ''}
                className={inputClass}
                placeholder="Putra dari Bapak ... & Ibu ..."
              />
            </Field>
          </div>
          <div className="space-y-3">
            <Field label="Nama lengkap mempelai wanita" error={e.bride_name}>
              <input name="bride_name" defaultValue={invitation?.bride_name} className={inputClass} placeholder="Ani Lestari, S.Pd." />
            </Field>
            <Field label="Nama panggilan wanita" error={e.bride_nickname}>
              <input name="bride_nickname" value={nick.bride} onChange={(x) => onNick('bride', x.target.value)} className={inputClass} placeholder="Ani" />
            </Field>
            <Field label="Keterangan orang tua (opsional)" error={e.bride_parents}>
              <input
                name="bride_parents"
                defaultValue={invitation?.bride_parents ?? ''}
                className={inputClass}
                placeholder="Putri dari Bapak ... & Ibu ..."
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Alamat Undangan">
        <Field label="Alamat (slug)" error={e.slug} hint={`Link undangan: ${siteUrl}/${slug || 'nama-pasangan'}`}>
          <input
            name="slug"
            value={slug}
            onChange={(x) => {
              setSlugTouched(true)
              setSlug(x.target.value.toLowerCase())
            }}
            className={inputClass}
            placeholder="budi-ani"
          />
        </Field>
        {slugChangedWhilePublished && (
          <div className="mt-3">
            <Notice kind="error">
              Undangan ini sudah terbit. Mengubah alamat membuat semua link yang sudah dikirim ke tamu tidak bisa dibuka.
            </Notice>
          </div>
        )}
      </Card>

      <Card title="Acara">
        <EventsEditor events={events} onChange={setEvents} errors={e} />
      </Card>

      <Card title="Tema & Zona Waktu">
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-stone-700">Tema</legend>
            <div className="space-y-2">
              {Object.values(THEMES).map((t) => (
                <label key={t.name} className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 has-checked:border-amber-600 has-checked:bg-amber-50">
                  <input type="radio" name="theme" value={t.name} defaultChecked={(invitation?.theme ?? 'elegan') === t.name} className="mt-1" />
                  <span>
                    <span className="block font-medium">{t.label}</span>
                    <span className="block text-sm text-stone-500">{t.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {e.theme && <p className="mt-1 text-sm text-red-600">{e.theme}</p>}
          </fieldset>
          <Field label="Zona waktu acara" error={e.timezone}>
            <select name="timezone" defaultValue={invitation?.timezone ?? 'Asia/Jakarta'} className={inputClass}>
              {Object.entries(TIMEZONES).map(([id, tz]) => (
                <option key={id} value={id}>
                  {tz.label} ({id === 'Asia/Jakarta' ? 'Jawa, Sumatra, Kalbar, Kalteng' : id === 'Asia/Makassar' ? 'Bali, NTB, NTT, Sulawesi, Kalsel, Kaltim' : 'Maluku, Papua'})
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Kata Pembuka">
        <Field label="Ayat / kutipan (opsional)" error={e.opening_text} hint="Tampil setelah sampul. Maksimal 1000 karakter.">
          <textarea name="opening_text" rows={4} defaultValue={invitation?.opening_text ?? ''} className={inputClass} />
        </Field>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Menyimpan…' : invitation ? 'Simpan Perubahan' : 'Buat Undangan'}
        </button>
        {state.status === 'ok' && <Notice kind="ok">{state.message}</Notice>}
        {state.status === 'error' && <Notice kind="error">{state.message}</Notice>}
      </div>
    </form>
  )
}
