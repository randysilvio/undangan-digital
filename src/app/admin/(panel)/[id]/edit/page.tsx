import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { InvitationForm } from '@/components/admin/InvitationForm'
import { PublishPanel } from '@/components/admin/PublishPanel'
import { Notice } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getInvitation } from '@/lib/data/admin'
import { SITE_URL } from '@/lib/supabase/env'

export default function EditPage(props: PageProps<'/admin/[id]/edit'>) {
  return (
    <Suspense fallback={<p className="text-stone-500">Memuat…</p>}>
      <Edit {...props} />
    </Suspense>
  )
}

async function Edit({ params, searchParams }: PageProps<'/admin/[id]/edit'>) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const { supabase } = await requireAdmin()
  const inv = await getInvitation(supabase, id)
  if (!inv) notFound()
  return (
    <div className="space-y-6">
      {sp.baru === '1' && (
        <Notice kind="ok">Undangan dibuat sebagai draft. Lanjutkan dengan foto & rekening di tab “Media & Amplop”.</Notice>
      )}
      <PublishPanel id={inv.id} status={inv.status} />
      <InvitationForm invitation={inv} siteUrl={SITE_URL} />
    </div>
  )
}
