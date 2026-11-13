import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InvitationView } from '@/components/invitation/InvitationView'
import { demoInvitation, demoWishes, kindFromSlug, kindSlug } from '@/lib/demo'
import { KIND_IDS, KINDS } from '@/lib/kinds'
import type { ThemeName } from '@/lib/types'
import { THEME_NAMES, THEMES } from '@/themes'

export function generateStaticParams() {
  return KIND_IDS.flatMap((k) => THEME_NAMES.map((t) => ({ jenis: kindSlug(k), tema: t })))
}

function resolve(jenis: string, tema: string) {
  const kind = kindFromSlug(jenis)
  const theme = (THEME_NAMES as string[]).includes(tema) ? (tema as ThemeName) : null
  return kind && theme ? { kind, theme } : null
}

export async function generateMetadata({ params }: PageProps<'/contoh/[jenis]/[tema]'>): Promise<Metadata> {
  const { jenis, tema } = await params
  const r = resolve(jenis, tema)
  if (!r) return { title: 'Contoh tidak ditemukan' }
  return { title: `Contoh ${KINDS[r.kind].label} — Tema ${THEMES[r.theme].label}` }
}

export default async function DemoPage({ params }: PageProps<'/contoh/[jenis]/[tema]'>) {
  const { jenis, tema } = await params
  const r = resolve(jenis, tema)
  if (!r) notFound()

  return (
    <>
      <InvitationView invitation={demoInvitation(r.kind, r.theme)} guestName="Bapak/Ibu Tamu Undangan" guestCode={null} wishes={demoWishes(r.kind)} demo />
      <nav
        aria-label="Ganti tema contoh"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2 font-sans text-stone-800 shadow-[0_-4px_12px_rgb(0_0_0/0.08)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto">
          <Link href="/#jenis" className="shrink-0 rounded-full px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100">
            ← Kembali
          </Link>
          <span className="shrink-0 text-xs text-stone-500">Tema:</span>
          {THEME_NAMES.map((t) => (
            <Link
              key={t}
              href={`/contoh/${jenis}/${t}`}
              aria-current={t === r.theme ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                t === r.theme ? 'border-amber-600 bg-amber-50 font-medium' : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span aria-hidden className="size-3 rounded-full border border-stone-300" style={{ background: THEMES[t].swatch[2] }} />
              {THEMES[t].label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
