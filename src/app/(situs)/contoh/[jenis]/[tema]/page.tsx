import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@/components/icons'
import { InvitationView } from '@/components/invitation/InvitationView'
import { BRAND } from '@/lib/brand'
import { getGalleryThemes, getSiteSettings, waLink } from '@/lib/data/site'
import { demoInvitation, demoWishes, kindFromSlug, kindSlug } from '@/lib/demo'
import { KIND_IDS, KINDS } from '@/lib/kinds'
import type { CustomTheme, InvitationKind, ThemeName } from '@/lib/types'
import { THEME_NAMES, THEMES } from '@/themes'

export function generateStaticParams() {
  return KIND_IDS.flatMap((k) => THEME_NAMES.map((t) => ({ jenis: kindSlug(k), tema: t })))
}

type Resolved = { kind: InvitationKind; theme: ThemeName; custom: CustomTheme | null; label: string }

/** Tema bawaan, atau tema kustom yang dipamerkan di galeri. */
async function resolve(jenis: string, tema: string): Promise<Resolved | null> {
  const kind = kindFromSlug(jenis)
  if (!kind) return null
  if ((THEME_NAMES as string[]).includes(tema)) {
    const theme = tema as ThemeName
    return { kind, theme, custom: null, label: THEMES[theme].label }
  }
  const custom = (await getGalleryThemes()).find((t) => t.slug === tema)
  return custom ? { kind, theme: custom.base_theme, custom, label: custom.name } : null
}

export async function generateMetadata({ params }: PageProps<'/contoh/[jenis]/[tema]'>): Promise<Metadata> {
  const { jenis, tema } = await params
  const r = await resolve(jenis, tema)
  if (!r) return { title: 'Contoh tidak ditemukan' }
  return {
    title: `Contoh ${KINDS[r.kind].label}, Tema ${r.label}`,
    description: `Contoh undangan digital ${KINDS[r.kind].label.toLowerCase()} dengan tema ${r.label} dari ${BRAND}.`,
  }
}

const chip = 'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm'

export default async function DemoPage({ params }: PageProps<'/contoh/[jenis]/[tema]'>) {
  const { jenis, tema } = await params
  const r = await resolve(jenis, tema)
  if (!r) notFound()
  const [settings, gallery] = await Promise.all([getSiteSettings(), getGalleryThemes()])
  const invitation = { ...demoInvitation(r.kind, r.theme), custom_theme_id: r.custom?.id ?? null, custom_theme: r.custom }
  const order = settings.whatsapp
    ? waLink(settings.whatsapp, `Halo ${BRAND}, saya tertarik membuat undangan ${KINDS[r.kind].label.toLowerCase()} dengan tema ${r.label}.`)
    : null

  return (
    <>
      <InvitationView invitation={invitation} guestName="Bapak/Ibu Tamu Undangan" guestCode={null} wishes={demoWishes(r.kind)} demo />
      <nav
        aria-label="Ganti tema contoh"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2 font-sans text-stone-800 shadow-[0_-4px_12px_rgb(0_0_0/0.08)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <Link href="/#jenis" className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-sm text-stone-600 hover:bg-stone-100">
            <Icon name="arrowLeft" className="size-4" /> <span className="hidden sm:inline">Kembali</span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            <span className="shrink-0 text-xs text-stone-500">Tema:</span>
            {gallery.map((t) => (
              <Link
                key={t.id}
                href={`/contoh/${jenis}/${t.slug}`}
                aria-current={t.slug === tema ? 'page' : undefined}
                className={`${chip} ${t.slug === tema ? 'border-[#7a2e2a] bg-[#f6f1ea] font-medium' : 'border-stone-200 hover:bg-stone-50'}`}
              >
                <span aria-hidden className="size-3 rounded-full border border-stone-300" style={{ background: t.colors.accent ?? THEMES[t.base_theme].swatch[2] }} />
                {t.name}
              </Link>
            ))}
            {THEME_NAMES.map((t) => (
              <Link
                key={t}
                href={`/contoh/${jenis}/${t}`}
                aria-current={t === tema ? 'page' : undefined}
                className={`${chip} ${t === tema ? 'border-[#7a2e2a] bg-[#f6f1ea] font-medium' : 'border-stone-200 hover:bg-stone-50'}`}
              >
                <span aria-hidden className="size-3 rounded-full border border-stone-300" style={{ background: THEMES[t].swatch[2] }} />
                {THEMES[t].label}
              </Link>
            ))}
          </div>
          {order && (
            <a href={order} target="_blank" rel="noopener" className="shrink-0 rounded-full bg-[#7a2e2a] px-4 py-2 text-sm font-medium text-[#f6efe4] hover:bg-[#62231f]">
              Pesan
            </a>
          )}
        </div>
      </nav>
    </>
  )
}
