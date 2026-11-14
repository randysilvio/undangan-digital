'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { saveInvitationAction } from '@/app/admin/(panel)/actions'
import { isWedding, JOINT_LABEL, KIND_IDS, KINDS } from '@/lib/kinds'
import { slugify } from '@/lib/slug'
import { effectiveTexts } from '@/lib/text-templates'
import { TIMEZONES } from '@/lib/time'
import { themeColors } from '@/lib/custom-theme'
import type { CustomTheme, InvitationFull, InvitationKind } from '@/lib/types'
import { initialFormState } from '@/lib/validation'
import { THEMES } from '@/themes'
import { Icon } from '@/components/icons'
import { EventsEditor, eventsPayload, newEventDraft, type EventDraft } from './EventsEditor'
import { ExtrasEditor } from './ExtrasEditor'
import { TextsEditor } from './TextsEditor'
import { buttonClass, Card, Field, inputClass, Notice } from './ui'

const SLUG_PREFIX: Record<InvitationKind, string> = {
  pernikahan: '',
  ultah_anak: 'ultah',
  sweet_seventeen: 'sweet17',
  ultah_dewasa: 'ultah',
  ultah_syukur: 'syukur',
}

function suggestSlug(kind: InvitationKind, groom: string, bride: string, age: string, joint: boolean): string {
  if (isWedding(kind)) return slugify(`${groom} ${bride}`)
  if (joint) return slugify(`${SLUG_PREFIX[kind]} ${groom} ${bride}`)
  return slugify(`${SLUG_PREFIX[kind]} ${groom} ${kind === 'sweet_seventeen' ? '' : age}`)
}

const defaultEvents = (kind: InvitationKind) => KINDS[kind].eventNames.map((name) => newEventDraft({ name }))

/** Acara belum diisi apa pun selain nama bawaan: aman diganti saat jenis undangan berubah. */
const pristine = (events: EventDraft[]) =>
  events.every((e) => !e.date && !e.start_time && !e.end_time && !e.venue_name && !e.address && !e.maps_url)

const PARENTS_LABEL: Record<InvitationKind, string> = {
  pernikahan: 'Keterangan orang tua (opsional)',
  ultah_anak: 'Keterangan orang tua (opsional)',
  sweet_seventeen: 'Keterangan orang tua (opsional)',
  ultah_dewasa: 'Keterangan tambahan (opsional)',
  ultah_syukur: 'Keterangan keluarga (opsional)',
}

export type CustomThemeChoice = Pick<CustomTheme, 'id' | 'name' | 'base_theme' | 'colors' | 'description'>

export function InvitationForm({
  invitation,
  siteUrl,
  customThemes = [],
}: {
  invitation?: InvitationFull
  siteUrl: string
  customThemes?: CustomThemeChoice[]
}) {
  const [state, action, pending] = useActionState(saveInvitationAction, initialFormState)
  const [kind, setKind] = useState<InvitationKind>(invitation?.kind ?? 'pernikahan')
  /** Nama tema bawaan, atau "custom:<id>" untuk tema kustom. */
  const [theme, setTheme] = useState<string>(
    invitation?.custom_theme_id ? `custom:${invitation.custom_theme_id}` : (invitation?.theme ?? KINDS[kind].defaultTheme),
  )
  const [themeTouched, setThemeTouched] = useState(Boolean(invitation))
  const [events, setEvents] = useState<EventDraft[]>(() =>
    invitation
      ? invitation.events.map((e) => newEventDraft({ ...e, end_time: e.end_time ?? '', maps_url: e.maps_url ?? '' }))
      : defaultEvents(kind),
  )
  const [slug, setSlug] = useState(invitation?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(invitation))
  const [nick, setNick] = useState({ groom: invitation?.groom_nickname ?? '', bride: invitation?.bride_nickname ?? '' })
  const [age, setAge] = useState(invitation?.age ? String(invitation.age) : '')
  const [joint, setJoint] = useState(Boolean(invitation && !isWedding(invitation.kind) && invitation.bride_nickname))
  const e = state.fieldErrors ?? {}
  const wedding = isWedding(kind)
  const k = KINDS[kind]

  function suggest(next: { kind?: InvitationKind; groom?: string; bride?: string; age?: string; joint?: boolean }) {
    if (slugTouched) return
    setSlug(suggestSlug(next.kind ?? kind, next.groom ?? nick.groom, next.bride ?? nick.bride, next.age ?? age, next.joint ?? joint))
  }

  function onNick(which: 'groom' | 'bride', value: string) {
    setNick({ ...nick, [which]: value })
    suggest({ [which]: value })
  }

  function onAge(value: string) {
    setAge(value)
    suggest({ age: value })
  }

  function onKind(next: InvitationKind) {
    setKind(next)
    if (!themeTouched) setTheme(KINDS[next].defaultTheme)
    if (!invitation && pristine(events)) setEvents(defaultEvents(next))
    const nextAge = next === 'sweet_seventeen' && !age ? '17' : age
    setAge(nextAge)
    suggest({ kind: next, age: nextAge })
  }

  const slugChangedWhilePublished = invitation?.status === 'published' && slug !== invitation.slug
  const hadSecond = invitation !== undefined && Boolean(invitation.bride_nickname)
  const hasSecond = wedding || joint
  const losesBride = hadSecond && !hasSecond

  // Kirim tanpa reset formulir bawaan React, agar isian tetap ada bila ada error.
  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (
      slugChangedWhilePublished &&
      !confirm(`Alamat undangan akan berubah dari /${invitation.slug} menjadi /${slug}.\n\nSemua link yang SUDAH dikirim ke tamu tidak akan bisa dibuka lagi. Lanjutkan?`)
    ) {
      return
    }
    if (losesBride && !confirm('Data orang kedua (mempelai wanita / yang dirayakan bersama) akan dihapus. Lanjutkan?')) return
    const fd = new FormData(ev.currentTarget)
    fd.set('events', eventsPayload(events))
    startTransition(() => action(fd))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {invitation && <input type="hidden" name="id" value={invitation.id} />}

      <Card title="Jenis Undangan">
        <fieldset>
          <legend className="sr-only">Jenis undangan</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {KIND_IDS.map((id) => (
              <label
                key={id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 has-checked:border-amber-600 has-checked:bg-amber-50"
              >
                <input type="radio" name="kind" value={id} checked={kind === id} onChange={() => onKind(id)} className="mt-1" />
                <span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon name={KINDS[id].motif} className="size-4 text-amber-700" />
                    {KINDS[id].label}
                  </span>
                  <span className="block text-sm text-stone-500">{KINDS[id].description}</span>
                </span>
              </label>
            ))}
          </div>
          {e.kind && <p className="mt-1 text-sm text-red-600">{e.kind}</p>}
        </fieldset>
        {losesBride && (
          <div className="mt-3">
            <Notice kind="error">Saat disimpan, data orang kedua (mempelai wanita / yang dirayakan bersama) akan dihapus.</Notice>
          </div>
        )}
      </Card>

      <Card title={k.personTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <Field label={wedding ? 'Nama lengkap mempelai pria' : 'Nama lengkap'} error={e.groom_name}>
              <input
                name="groom_name"
                defaultValue={invitation?.groom_name}
                className={inputClass}
                placeholder={wedding ? 'Budi Santoso, S.T.' : k.placeholder.name}
              />
            </Field>
            <Field label={wedding ? 'Nama panggilan pria' : 'Nama panggilan'} error={e.groom_nickname}>
              <input
                name="groom_nickname"
                value={nick.groom}
                onChange={(x) => onNick('groom', x.target.value)}
                className={inputClass}
                placeholder={wedding ? 'Budi' : k.placeholder.nickname}
              />
            </Field>
            <Field label={PARENTS_LABEL[kind]} error={e.groom_parents}>
              <input
                name="groom_parents"
                defaultValue={invitation?.groom_parents ?? ''}
                className={inputClass}
                placeholder={wedding ? 'Putra dari Bapak ... & Ibu ...' : k.placeholder.parents || 'Boleh dikosongkan'}
              />
            </Field>
          </div>
          {wedding ? (
            <div key="mempelai-wanita" className="space-y-3">
              <Field label="Nama lengkap mempelai wanita" error={e.bride_name}>
                <input name="bride_name" defaultValue={invitation?.bride_name ?? ''} className={inputClass} placeholder="Ani Lestari, S.Pd." />
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
          ) : (
            <div key="usia" className="space-y-3">
              <Field label={kind === 'ultah_syukur' ? 'Usia yang disyukuri (tahun)' : 'Ulang tahun ke-'} error={e.age}>
                <input
                  name="age"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={150}
                  value={age}
                  onChange={(x) => onAge(x.target.value)}
                  className={inputClass}
                  placeholder={k.placeholder.age}
                />
              </Field>
              <Field label="Tanggal lahir (opsional)" error={e.birth_date} hint="Tampil di bawah usia, mis. Lahir 12 Maret 2022.">
                <input name="birth_date" type="date" defaultValue={invitation?.birth_date ?? ''} className={inputClass} />
              </Field>
            </div>
          )}
        </div>
        {!wedding && (
          <div className="mt-5 border-t border-stone-200 pt-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="joint"
                checked={joint}
                onChange={(x) => {
                  setJoint(x.target.checked)
                  suggest({ joint: x.target.checked })
                }}
              />
              <span className="font-medium">{JOINT_LABEL[kind as Exclude<InvitationKind, 'pernikahan'>].toggle}</span>
            </label>
            <p className="mt-1 text-sm text-stone-500">Masing-masing tampil dengan foto, nama, usia, dan tanggal lahir sendiri, walau tanggal lahirnya berbeda.</p>
            {joint && (
              <div key="orang-kedua" className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-stone-800">{JOINT_LABEL[kind as Exclude<InvitationKind, 'pernikahan'>].second}</p>
                  <Field label="Nama lengkap" error={e.bride_name}>
                    <input
                      name="bride_name"
                      defaultValue={invitation?.bride_name ?? ''}
                      className={inputClass}
                      placeholder={kind === 'ultah_syukur' ? 'Ibu Sri Rahayu' : 'Bima Putra Santoso'}
                    />
                  </Field>
                  <Field label="Nama panggilan" error={e.bride_nickname}>
                    <input
                      name="bride_nickname"
                      value={nick.bride}
                      onChange={(x) => onNick('bride', x.target.value)}
                      className={inputClass}
                      placeholder={kind === 'ultah_syukur' ? 'Oma Sri' : 'Bima'}
                    />
                  </Field>
                  <Field label={PARENTS_LABEL[kind]} error={e.bride_parents}>
                    <input name="bride_parents" defaultValue={invitation?.bride_parents ?? ''} className={inputClass} placeholder="Boleh dikosongkan" />
                  </Field>
                </div>
                <div className="space-y-3">
                  <p className="hidden text-sm font-semibold sm:block">&nbsp;</p>
              <Field label={kind === 'ultah_syukur' ? 'Usia yang disyukuri (tahun)' : 'Ulang tahun ke-'} error={e.age2}>
                <input
                  name="age2"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={150}
                  defaultValue={invitation?.age2 ?? ''}
                  className={inputClass}
                  placeholder={kind === 'ultah_syukur' ? '65' : '3'}
                />
              </Field>
                  <Field label="Tanggal lahir (opsional)" error={e.birth_date2}>
                    <input name="birth_date2" type="date" defaultValue={invitation?.birth_date2 ?? ''} className={inputClass} />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card title="Alamat Undangan">
        <Field label="Alamat (slug)" error={e.slug} hint={`Link undangan: ${siteUrl}/${slug || (wedding ? 'nama-pasangan' : 'ultah-nama')}`}>
          <input
            name="slug"
            value={slug}
            onChange={(x) => {
              setSlugTouched(true)
              setSlug(x.target.value.toLowerCase())
            }}
            className={inputClass}
            placeholder={wedding ? 'budi-ani' : 'ultah-kayla-5'}
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
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-stone-700">Tema</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(THEMES).map((t) => (
                <label
                  key={t.name}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 has-checked:border-amber-600 has-checked:bg-amber-50"
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t.name}
                    checked={theme === t.name}
                    onChange={() => {
                      setTheme(t.name)
                      setThemeTouched(true)
                    }}
                    className="mt-1"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-medium">
                      {t.label}
                      <span aria-hidden className="flex">
                        {t.swatch.map((c) => (
                          <span key={c} className="-ml-1 size-4 rounded-full border border-stone-300 first:ml-0" style={{ background: c }} />
                        ))}
                      </span>
                    </span>
                    <span className="block text-sm text-stone-500">{t.description}</span>
                    {t.suits.includes(kind) && <span className="mt-1 inline-block text-xs font-medium text-amber-700">Cocok untuk {k.label}</span>}
                  </span>
                </label>
              ))}
            </div>
            {customThemes.length > 0 && (
              <>
                <p className="mt-4 mb-2 text-sm font-medium text-stone-700">Tema kustom</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {customThemes.map((t) => {
                    const c = themeColors(t)
                    const value = `custom:${t.id}`
                    return (
                      <label
                        key={t.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 has-checked:border-amber-600 has-checked:bg-amber-50"
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={value}
                          checked={theme === value}
                          onChange={() => {
                            setTheme(value)
                            setThemeTouched(true)
                          }}
                          className="mt-1"
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 font-medium">
                            {t.name}
                            <span aria-hidden className="flex">
                              {[c.bg, c.surface, c.accent].map((x, i) => (
                                <span key={i} className="-ml-1 size-4 rounded-full border border-stone-300 first:ml-0" style={{ background: x }} />
                              ))}
                            </span>
                          </span>
                          <span className="block text-sm text-stone-500">{t.description || `Berdasar tema ${THEMES[t.base_theme].label}`}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </>
            )}
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

      <Card title="Cerita, Keluarga & Dress Code">
        <ExtrasEditor
          kind={kind}
          initial={invitation ? { story: invitation.story ?? [], family: invitation.family, dress_code: invitation.dress_code } : undefined}
          errors={e}
        />
      </Card>

      <Card title="Teks Undangan">
        <TextsEditor kind={kind} initial={invitation ? effectiveTexts(invitation) : undefined} errors={e} />
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
