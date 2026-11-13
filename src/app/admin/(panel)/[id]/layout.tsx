import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import { requireAdmin } from '@/lib/auth'
import { getInvitation } from '@/lib/data/admin'
import { displayName, KINDS } from '@/lib/kinds'
import { SITE_URL } from '@/lib/supabase/env'

export default function InvitationAdminLayout({ children, params }: LayoutProps<'/admin/[id]'>) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-20" />}>
        <Header params={params} />
      </Suspense>
      {children}
    </div>
  )
}

async function Header({ params }: { params: LayoutProps<'/admin/[id]'>['params'] }) {
  const { id } = await params
  const { supabase } = await requireAdmin()
  const inv = await getInvitation(supabase, id)
  if (!inv) notFound()
  const published = inv.status === 'published'
  return (
    <div className="space-y-3">
      <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">
        ← Semua undangan
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{displayName(inv)}</h1>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">{KINDS[inv.kind].label}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${published ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'}`}>
          {published ? 'Terbit' : 'Draft'}
        </span>
        {published && (
          <a href={`/${inv.slug}`} target="_blank" className="text-sm text-amber-700 underline">
            {SITE_URL.replace(/^https?:\/\//, '')}/{inv.slug}
          </a>
        )}
      </div>
      <AdminNav id={inv.id} />
    </div>
  )
}
