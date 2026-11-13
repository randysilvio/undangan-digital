'use client'

import { useState } from 'react'
import { isWedding } from '@/lib/kinds'
import {
  defaultTemplate,
  findTemplate,
  matchesTemplate,
  TEXT_TEMPLATES,
  templatesFor,
  templateTexts,
  type InvitationTexts,
  type TextTemplateId,
} from '@/lib/text-templates'
import type { InvitationKind } from '@/lib/types'
import { Field, inputClass, secondaryButtonClass } from './ui'

/** Template yang cocok dengan teks, bila template itu milik jenis undangan ini; selain itu template bawaan. */
function pickTemplate(kind: InvitationKind, texts: InvitationTexts): TextTemplateId {
  const hit = findTemplate(texts)
  return hit && TEXT_TEMPLATES[hit].kind === kind ? hit : defaultTemplate(kind)
}

/**
 * Teks undangan + pemilih template (per jenis undangan dan agama). Undangan baru mulai dari template
 * bawaan jenisnya. Bila jenis undangan diganti dan teks belum diedit, teks ikut berganti.
 */
export function TextsEditor({
  kind = 'pernikahan',
  initial,
  errors,
}: {
  kind?: InvitationKind
  initial?: InvitationTexts
  errors: Record<string, string>
}) {
  const [texts, setTexts] = useState<InvitationTexts>(initial ?? templateTexts(defaultTemplate(kind)))
  const [template, setTemplate] = useState<TextTemplateId>(() => pickTemplate(kind, initial ?? templateTexts(defaultTemplate(kind))))
  const [prevKind, setPrevKind] = useState(kind)
  const set = (k: keyof InvitationTexts) => (ev: { target: { value: string } }) => setTexts({ ...texts, [k]: ev.target.value })

  if (kind !== prevKind) {
    setPrevKind(kind)
    const id = defaultTemplate(kind)
    setTemplate(id)
    if (matchesTemplate(texts)) setTexts(templateTexts(id))
  }

  function apply() {
    if (!matchesTemplate(texts) && !confirm('Teks yang sudah Anda ubah akan diganti dengan template. Lanjutkan?')) return
    setTexts(templateTexts(template))
  }

  const wedding = isWedding(kind)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Template teks">
          <select value={template} onChange={(ev) => setTemplate(ev.target.value as TextTemplateId)} className={inputClass}>
            {templatesFor(kind).map((id) => (
              <option key={id} value={id}>
                {TEXT_TEMPLATES[id].label}
              </option>
            ))}
          </select>
        </Field>
        <button type="button" onClick={apply} className={secondaryButtonClass}>
          Terapkan template
        </button>
      </div>
      <Field
        label="Kalimat pengantar"
        error={errors.intro_text}
        hint={`Tampil di atas nama ${wedding ? 'mempelai' : 'yang berulang tahun'}. Maksimal 500 karakter.`}
      >
        <textarea name="intro_text" rows={3} value={texts.intro} onChange={set('intro')} className={inputClass} />
      </Field>
      <Field label="Ayat / kutipan (opsional)" error={errors.opening_text} hint="Tampil setelah sampul. Kosongkan bila tidak perlu. Maksimal 1000 karakter.">
        <textarea name="opening_text" rows={4} value={texts.opening} onChange={set('opening')} className={inputClass} />
      </Field>
      <Field label="Kalimat penutup" error={errors.closing_text} hint="Tampil di akhir undangan. Maksimal 500 karakter.">
        <textarea name="closing_text" rows={3} value={texts.closing} onChange={set('closing')} className={inputClass} />
      </Field>
      <Field
        label="Pesan WhatsApp ke tamu"
        error={errors.wa_message}
        hint={
          wedding
            ? 'Kode otomatis: {tamu} = nama tamu, {mempelai} = nama pasangan, {link} = link pribadi tamu (wajib ada).'
            : 'Kode otomatis: {tamu} = nama tamu, {nama} = nama yang berulang tahun, {link} = link pribadi tamu (wajib ada).'
        }
      >
        <textarea name="wa_message" rows={10} value={texts.wa} onChange={set('wa')} className={inputClass} />
      </Field>
    </div>
  )
}
