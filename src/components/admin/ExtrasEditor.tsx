'use client'

import { useState } from 'react'
import { KINDS } from '@/lib/kinds'
import type { InvitationKind, StoryItem } from '@/lib/types'
import { Field, inputClass, secondaryButtonClass } from './ui'

interface StoryDraft extends StoryItem {
  key: string
}

let counter = 0
const draft = (o: Partial<StoryItem> = {}): StoryDraft => ({ key: `st-${++counter}`, year: '', title: '', text: '', ...o })

const MAX_STORY = 12

const STORY_HINT: Record<InvitationKind, { year: string; title: string; text: string }> = {
  pernikahan: { year: 'Juni 2019', title: 'Pertama bertemu', text: 'Berawal dari satu kelas yang sama di kampus...' },
  ultah_anak: { year: '2022', title: 'Langkah pertama', text: 'Kayla mulai berjalan di usia 11 bulan.' },
  sweet_seventeen: { year: '2015', title: 'Masuk sekolah dasar', text: 'Hari pertama sekolah dengan seragam kebesaran.' },
  ultah_dewasa: { year: '2016', title: 'Lulus kuliah', text: 'Sarjana Teknik dari Universitas Hasanuddin.' },
  ultah_syukur: { year: '1956', title: 'Lahir di Klaten', text: 'Anak ketiga dari tujuh bersaudara.' },
}

const FAMILY_HINT: Record<InvitationKind, string> = {
  pernikahan: 'Keluarga Besar Bapak Slamet\nKeluarga Besar Bapak Joko',
  ultah_anak: 'Opa & Oma Santoso\nKakek & Nenek Wijaya',
  sweet_seventeen: 'Papa & Mama\nKak Rio',
  ultah_dewasa: 'Keluarga Wijaya',
  ultah_syukur: 'Ir. Budi Riyadi & Ani\ndr. Sari Riyadi & Hendra\nCucu: Kayla, Bima, Naura',
}

/** Data cerita yang dikirim ke server (tanpa key lokal). */
const storyPayload = (items: StoryDraft[]) => JSON.stringify(items.map(({ year, title, text }) => ({ year, title, text })))

/** Cerita/perjalanan hidup, daftar keluarga, dan dress code. */
export function ExtrasEditor(props: {
  kind: InvitationKind
  initial?: { story: StoryItem[]; family: string | null; dress_code: string | null }
  errors: Record<string, string>
}) {
  const { kind, errors } = props
  const [items, setItems] = useState<StoryDraft[]>(() => (props.initial?.story ?? []).map((s) => draft(s)))
  const k = KINDS[kind]
  const hint = STORY_HINT[kind]
  const update = (i: number, patch: Partial<StoryItem>) => setItems(items.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const move = (i: number, d: number) => {
    const next = [...items]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    setItems(next)
  }
  const err = (i: number, f: string) => errors[`story.${i}.${f}`]

  return (
    <div className="space-y-6">
      <input type="hidden" name="story" value={storyPayload(items)} />
      <div className="space-y-3">
        <div>
          <p className="font-medium">{k.storyTitle} (opsional)</p>
          <p className="text-sm text-stone-500">Tampil sebagai garis waktu di undangan. Kosongkan bila tidak perlu.</p>
        </div>
        {items.map((s, i) => (
          <fieldset key={s.key} aria-label={`Cerita ${i + 1}`} className="space-y-3 rounded-lg border border-stone-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">Cerita {i + 1}</p>
              <div className="flex gap-1">
                <button type="button" className={secondaryButtonClass} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Naikkan">
                  ↑
                </button>
                <button type="button" className={secondaryButtonClass} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Turunkan">
                  ↓
                </button>
                <button type="button" className={secondaryButtonClass} onClick={() => setItems(items.filter((_, j) => j !== i))}>
                  Hapus
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
              <Field label="Tahun / waktu" error={err(i, 'year')}>
                <input value={s.year} onChange={(x) => update(i, { year: x.target.value })} className={inputClass} placeholder={hint.year} maxLength={20} />
              </Field>
              <Field label="Judul" error={err(i, 'title')}>
                <input value={s.title} onChange={(x) => update(i, { title: x.target.value })} className={inputClass} placeholder={hint.title} maxLength={80} />
              </Field>
            </div>
            <Field label="Keterangan (opsional)" error={err(i, 'text')}>
              <textarea rows={2} value={s.text} onChange={(x) => update(i, { text: x.target.value })} className={inputClass} placeholder={hint.text} maxLength={400} />
            </Field>
          </fieldset>
        ))}
        {errors.story && <p className="text-sm text-red-600">{errors.story}</p>}
        {items.length < MAX_STORY && (
          <button type="button" className={secondaryButtonClass} onClick={() => setItems([...items, draft()])}>
            + Tambah Cerita
          </button>
        )}
      </div>

      <Field label={`${k.familyTitle} (opsional)`} error={errors.family} hint="Satu nama per baris. Maksimal 1500 karakter.">
        <textarea name="family" rows={4} defaultValue={props.initial?.family ?? ''} className={inputClass} placeholder={FAMILY_HINT[kind]} />
      </Field>

      <Field label="Dress code (opsional)" error={errors.dress_code} hint="Tampil di bagian acara, mis. warna atau gaya busana.">
        <input
          name="dress_code"
          defaultValue={props.initial?.dress_code ?? ''}
          className={inputClass}
          placeholder={kind === 'ultah_anak' ? 'Kostum superhero atau putri' : kind === 'ultah_syukur' ? 'Batik' : 'Nuansa putih & emas'}
          maxLength={200}
        />
      </Field>
    </div>
  )
}
