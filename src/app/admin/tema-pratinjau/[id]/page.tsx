import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { InvitationView } from '@/components/invitation/InvitationView'
import { requireAdmin } from '@/lib/auth'
import { getTheme } from '@/lib/data/themes'
import { demoInvitation, demoWishes, kindFromSlug } from '@/lib/demo'

export const metadata: Metadata = { title: 'Pratinjau Tema', robots: { index: false } }

/** Pratinjau tema kustom dengan data contoh (dipakai di iframe halaman edit tema). */
export default function ThemePreviewPage(props: PageProps<'/admin/tema-pratinjau/[id]'>) {
  return (
    <Suspense fallback={<p className="p-6 text-stone-500">Memuat…</p>}>
      <Preview {...props} />
    </Suspense>
  )
}

async function Preview({ params, searchParams }: PageProps<'/admin/tema-pratinjau/[id]'>) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const { supabase } = await requireAdmin()
  const theme = await getTheme(supabase, id)
  if (!theme) notFound()
  const kind = kindFromSlug(typeof sp.jenis === 'string' ? sp.jenis : '') ?? 'pernikahan'
  const inv = { ...demoInvitation(kind, theme.base_theme), custom_theme_id: theme.id, custom_theme: theme }
  return <InvitationView invitation={inv} guestName="Bapak/Ibu Tamu Undangan" guestCode={null} wishes={demoWishes(kind)} demo />
}
