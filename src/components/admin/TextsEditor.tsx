'use client'

import { useState } from 'react'
import { findTemplate, matchesTemplate, TEXT_TEMPLATES, templateTexts, type InvitationTexts, type TextTemplateId } from '@/lib/text-templates'
import { Field, inputClass, secondaryButtonClass } from './ui'

/** Teks undangan + pemilih template agama. Undangan baru mulai dari template Umum. */
export function TextsEditor({ initial, errors }: { initial?: InvitationTexts; errors: Record<string, string> }) {
  const [texts, setTexts] = useState<InvitationTexts>(initial ?? templateTexts('umum'))
  const [template, setTemplate] = useState<TextTemplateId>(() => findTemplate(initial ?? templateTexts('umum')) ?? 'umum')
  const set = (k: keyof InvitationTexts) => (ev: { target: { value: string } }) => setTexts({ ...texts, [k]: ev.target.value })

  function apply() {
    if (!matchesTemplate(texts) && !confirm('Teks yang sudah Anda ubah akan diganti dengan template. Lanjutkan?')) return
    setTexts(templateTexts(template))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Template teks">
          <select value={template} onChange={(ev) => setTemplate(ev.target.value as TextTemplateId)} className={inputClass}>
            {(Object.keys(TEXT_TEMPLATES) as TextTemplateId[]).map((id) => (
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
      <Field label="Kalimat pengantar" error={errors.intro_text} hint="Tampil di atas nama mempelai. Maksimal 500 karakter.">
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
        hint="Kode otomatis: {tamu} = nama tamu, {mempelai} = nama pasangan, {link} = link pribadi tamu (wajib ada)."
      >
        <textarea name="wa_message" rows={10} value={texts.wa} onChange={set('wa')} className={inputClass} />
      </Field>
    </div>
  )
}
