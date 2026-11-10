import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { InvitationView } from '@/components/invitation/InvitationView'
import { requireAdmin } from '@/lib/auth'
import { getInvitation } from '@/lib/data/admin'

export default function PreviewPage(props: PageProps<'/admin/[id]/preview'>) {
  return (
    <Suspense fallback={<p className="text-stone-500">Memuat pratinjau…</p>}>
      <Preview {...props} />
    </Suspense>
  )
}

async function Preview({ params }: PageProps<'/admin/[id]/preview'>) {
  const { id } = await params
  const { supabase } = await requireAdmin()
  const inv = await getInvitation(supabase, id)
  if (!inv) notFound()
  const { data: wishes } = await supabase
    .from('wishes')
    .select('*')
    .eq('invitation_id', id)
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(50)
  return (
    <div className="mx-auto max-w-[420px] overflow-hidden rounded-2xl border border-stone-300 shadow-lg">
      <InvitationView invitation={inv} guestName="Nama Tamu" guestCode={null} wishes={wishes ?? []} preview />
    </div>
  )
}
