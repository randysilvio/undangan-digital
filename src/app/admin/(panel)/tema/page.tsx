import Link from 'next/link'
import { Suspense } from 'react'
import { buttonClass, Card } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { themeColors } from '@/lib/custom-theme'
import { listThemes } from '@/lib/data/themes'
import { THEMES } from '@/themes'

export default function ThemesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tema Saya</h1>
          <p className="text-sm text-stone-500">Tema dengan warna, huruf, dan gambar hiasan sendiri. Bisa dipakai untuk undangan mana pun.</p>
        </div>
        <Link href="/admin/tema/baru" className={buttonClass}>
          + Buat Tema
        </Link>
      </div>
      <Suspense fallback={<p className="text-stone-500">Memuat…</p>}>
        <ThemeList />
      </Suspense>
    </div>
  )
}

async function ThemeList() {
  const { supabase } = await requireAdmin()
  const themes = await listThemes(supabase)
  if (themes.length === 0) {
    return (
      <Card>
        <p className="text-stone-600">Belum ada tema kustom. Mulai dari salah satu tema bawaan, lalu unggah gambar hiasan buatan Anda.</p>
      </Card>
    )
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {themes.map((t) => {
        const c = themeColors(t)
        return (
          <li key={t.id}>
            <Link href={`/admin/tema/${t.id}`} className="block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm hover:border-stone-400">
              <div className="flex h-24 items-center justify-center gap-2" style={{ background: c.bg }}>
                {[c.surface, c.accent, c.text].map((x, i) => (
                  <span key={i} className="size-7 rounded-full border border-black/10" style={{ background: x }} />
                ))}
              </div>
              <div className="p-3">
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-stone-500">
                  Dasar {THEMES[t.base_theme].label} · dipakai {t.usage} undangan
                  {t.show_in_gallery && ' · tampil di galeri'}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
