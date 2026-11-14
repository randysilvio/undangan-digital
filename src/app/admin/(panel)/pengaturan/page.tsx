import { Suspense } from 'react'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { requireAdmin } from '@/lib/auth'
import { EMPTY_SETTINGS } from '@/lib/data/site'
import type { SiteSettings } from '@/lib/types'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pengaturan Situs</h1>
        <p className="text-sm text-stone-500">Kontak dan paket harga yang tampil di halaman depan. Kolom yang kosong tidak ditampilkan.</p>
      </div>
      <Suspense fallback={<p className="text-stone-500">Memuat…</p>}>
        <Settings />
      </Suspense>
    </div>
  )
}

async function Settings() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('site_settings').select('whatsapp, instagram, email, packages, show_credit').eq('id', 1).maybeSingle()
  return <SettingsForm initial={(data as SiteSettings | null) ?? EMPTY_SETTINGS} />
}
