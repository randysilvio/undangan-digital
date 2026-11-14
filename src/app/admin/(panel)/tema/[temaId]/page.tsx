import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ThemeAssets } from '@/components/admin/ThemeAssets'
import { ThemeDanger } from '@/components/admin/ThemeDanger'
import { ThemeForm } from '@/components/admin/ThemeForm'
import { Card, Notice } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getTheme, themeUsage } from '@/lib/data/themes'

export default function EditThemePage(props: PageProps<'/admin/tema/[temaId]'>) {
  return (
    <Suspense fallback={<p className="text-stone-500">Memuat…</p>}>
      <EditTheme {...props} />
    </Suspense>
  )
}

async function EditTheme({ params, searchParams }: PageProps<'/admin/tema/[temaId]'>) {
  const [{ temaId }, sp] = await Promise.all([params, searchParams])
  const { supabase } = await requireAdmin()
  const theme = await getTheme(supabase, temaId)
  if (!theme) notFound()
  const usage = await themeUsage(supabase, theme.id)
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tema" className="text-sm text-stone-500 hover:text-stone-900">
          ← Tema Saya
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{theme.name}</h1>
      </div>
      {sp.baru === '1' && <Notice kind="ok">Tema dibuat. Sekarang unggah gambar hiasan dan lihat hasilnya di pratinjau.</Notice>}
      {usage > 0 && (
        <Notice kind="error">
          Tema ini dipakai {usage} undangan. Setiap perubahan langsung terlihat di undangan tersebut, termasuk yang sudah dikirim ke tamu. Untuk
          mencoba variasi, gunakan Duplikat Tema.
        </Notice>
      )}
      <Card title="Gambar Hiasan">
        <ThemeAssets theme={theme} />
      </Card>
      <ThemeForm theme={theme} />
      <ThemeDanger id={theme.id} usage={usage} />
    </div>
  )
}
