import Link from 'next/link'
import { InvitationForm } from '@/components/admin/InvitationForm'
import { SITE_URL } from '@/lib/supabase/env'

export default function NewInvitationPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">
          ← Semua undangan
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Buat Undangan</h1>
        <p className="text-sm text-stone-500">Foto, musik, dan rekening bisa ditambahkan setelah undangan dibuat.</p>
      </div>
      <InvitationForm siteUrl={SITE_URL} />
    </div>
  )
}
