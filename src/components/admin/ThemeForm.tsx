'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { saveThemeAction } from '@/app/admin/(panel)/theme-actions'
import { COLOR_KEYS, contrastWarnings, FONT_OPTIONS, FONT_ROLES, PARTICLE_OPTIONS, themeDefaults } from '@/lib/custom-theme'
import { slugify } from '@/lib/slug'
import type { CustomTheme, ParticleMode, ThemeColorKey, ThemeFontRole, ThemeName } from '@/lib/types'
import { initialFormState } from '@/lib/validation'
import { THEME_NAMES, THEMES } from '@/themes'
import { buttonClass, Card, Field, inputClass, Notice, secondaryButtonClass } from './ui'

/** Pengaturan tema kustom: nama, tema dasar, warna, huruf, partikel, dan tampil di galeri. */
export function ThemeForm({ theme }: { theme?: CustomTheme }) {
  const [state, action, pending] = useActionState(saveThemeAction, initialFormState)
  const [base, setBase] = useState<ThemeName>(theme?.base_theme ?? 'elegan')
  const [colors, setColors] = useState<Record<ThemeColorKey, string>>(() => ({ ...themeDefaults(base).colors, ...theme?.colors }))
  const [fonts, setFonts] = useState<Record<ThemeFontRole, string>>(() => ({ ...themeDefaults(base).fonts, ...theme?.fonts }))
  const [name, setName] = useState(theme?.name ?? '')
  const [slug, setSlug] = useState(theme?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(theme))
  const e = state.fieldErrors ?? {}
  const warnings = contrastWarnings(colors)

  function resetToBase(next: ThemeName) {
    setBase(next)
    const d = themeDefaults(next)
    setColors(d.colors)
    setFonts(d.fonts)
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    startTransition(() => action(fd))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {theme && <input type="hidden" name="id" value={theme.id} />}
      <Card title="Identitas Tema">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama tema" error={e.name}>
            <input
              name="name"
              value={name}
              maxLength={40}
              onChange={(x) => {
                setName(x.target.value)
                if (!slugTouched) setSlug(slugify(x.target.value).slice(0, 40))
              }}
              className={inputClass}
              placeholder="Batik Jawa Klasik"
            />
          </Field>
          <Field label="Alamat tema" error={e.slug} hint={`Dipakai di link contoh: /contoh/pernikahan/${slug || 'batik-jawa'}`}>
            <input
              name="slug"
              value={slug}
              maxLength={40}
              onChange={(x) => {
                setSlugTouched(true)
                setSlug(x.target.value.toLowerCase())
              }}
              className={inputClass}
              placeholder="batik-jawa"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Keterangan singkat (opsional)" error={e.description}>
              <input name="description" defaultValue={theme?.description ?? ''} maxLength={120} className={inputClass} placeholder="Cokelat sogan dan emas, motif parang" />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Tema Dasar">
        <p className="mb-3 text-sm text-stone-500">Tata letak, animasi bawaan, dan gaya huruf nama mengikuti tema dasar. Mengganti tema dasar mengisi ulang warna dan huruf.</p>
        <div className="flex flex-wrap gap-2">
          {THEME_NAMES.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm has-checked:border-amber-600 has-checked:bg-amber-50">
              <input
                type="radio"
                name="base_theme"
                value={t}
                checked={base === t}
                onChange={() => {
                  if (theme && !confirm('Warna dan huruf akan diisi ulang dari tema dasar. Lanjutkan?')) return
                  resetToBase(t)
                }}
              />
              <span aria-hidden className="size-3 rounded-full border border-stone-300" style={{ background: THEMES[t].swatch[2] }} />
              {THEMES[t].label}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Warna" actions={<button type="button" className={secondaryButtonClass} onClick={() => resetToBase(base)}>Kembalikan ke tema dasar</button>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLOR_KEYS.map((c) => (
            <label key={c.key} className="flex items-center gap-2 rounded-lg border border-stone-200 p-2">
              <input
                type="color"
                name={`color_${c.key}`}
                value={colors[c.key]}
                onChange={(x) => setColors({ ...colors, [c.key]: x.target.value })}
                className="size-9 shrink-0 cursor-pointer rounded border border-stone-300 bg-white"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{c.label}</span>
                <span className="block font-mono text-xs text-stone-500">{colors[c.key]}</span>
              </span>
            </label>
          ))}
        </div>
        {e.colors && <p className="mt-2 text-sm text-red-600">{e.colors}</p>}
        <div className="mt-4 overflow-hidden rounded-xl border border-stone-200" style={{ background: colors.bg, color: colors.text }}>
          <div className="p-4 text-center">
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: colors.muted }}>
              Contoh tampilan
            </p>
            <p className="mt-1 text-2xl" style={{ color: colors.accent, fontFamily: FONT_OPTIONS[fonts.names]?.css }}>
              Budi &amp; Ani
            </p>
            <p className="mt-1 text-lg" style={{ fontFamily: FONT_OPTIONS[fonts.heading]?.css }}>
              Waktu &amp; Tempat
            </p>
            <div className="mx-auto mt-3 max-w-xs rounded-lg border p-3 text-sm" style={{ background: colors.surface, borderColor: colors.line, fontFamily: FONT_OPTIONS[fonts.body]?.css }}>
              Sabtu, 14 Agustus 2027
              <span className="mt-2 block rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: colors.accent, color: colors.on_accent }}>
                Simpan ke Kalender
              </span>
            </div>
          </div>
        </div>
        {warnings.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-amber-800">
            {warnings.map((w) => (
              <li key={w}>Perhatian: {w}</li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Huruf & Partikel">
        <div className="grid gap-4 sm:grid-cols-2">
          {FONT_ROLES.map((f) => (
            <Field key={f.role} label={f.label}>
              <select name={`font_${f.role}`} value={fonts[f.role]} onChange={(x) => setFonts({ ...fonts, [f.role]: x.target.value })} className={inputClass}>
                {Object.entries(FONT_OPTIONS).map(([id, o]) => (
                  <option key={id} value={id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          ))}
          <Field label="Partikel bergerak" hint="Gambar partikel bisa diunggah di bagian Gambar Hiasan.">
            <select name="particles" defaultValue={theme?.particles ?? 'tema'} className={inputClass}>
              {(Object.entries(PARTICLE_OPTIONS) as [ParticleMode, string][]).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {e.fonts && <p className="mt-2 text-sm text-red-600">{e.fonts}</p>}
        <label className="mt-4 flex items-start gap-3 rounded-lg border border-stone-200 p-3">
          <input type="checkbox" name="show_in_gallery" defaultChecked={theme?.show_in_gallery ?? false} className="mt-1" />
          <span>
            <span className="block font-medium">Tampilkan di galeri publik</span>
            <span className="block text-sm text-stone-500">Tema muncul di halaman depan dan halaman contoh sebagai bahan promosi.</span>
          </span>
        </label>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Menyimpan…' : theme ? 'Simpan Tema' : 'Buat Tema'}
        </button>
        {state.status === 'ok' && <Notice kind="ok">{state.message}</Notice>}
        {state.status === 'error' && <Notice kind="error">{state.message}</Notice>}
      </div>
    </form>
  )
}
