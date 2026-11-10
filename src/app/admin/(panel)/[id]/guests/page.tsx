import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { GuestPaste } from '@/components/admin/GuestPaste'
import { GuestTable } from '@/components/admin/GuestTable'
import { Card, Notice, secondaryButtonClass } from '@/components/admin/ui'
import { CopyButton } from '@/components/invitation/CopyButton'
import { requireAdmin } from '@/lib/auth'
import { getInvitation, listGuests } from '@/lib/data/admin'
import { GuestListShare } from '@/components/admin/GuestListShare'
import { SITE_URL } from '@/lib/supabase/env'
import { effectiveTexts } from '@/lib/text-templates'

export default function GuestsPage(props: PageProps<'/admin/[id]/guests'>) {
  return (
    <Suspense fallback={<p className="text-stone-500">Memuat…</p>}>
      <Guests {...props} />
    </Suspense>
  )
}

async function Guests({ params }: PageProps<'/admin/[id]/guests'>) {
  const { id } = await params
  const { supabase } = await requireAdmin()
  const [inv, guests] = await Promise.all([getInvitation(supabase, id), listGuests(supabase, id)])
  if (!inv) notFound()
  const publicLink = `${SITE_URL}/${inv.slug}`
  return (
    <div className="space-y-6">
      {inv.status !== 'published' && (
        <Notice kind="error">Undangan masih draft. Tamu belum bisa membuka link sampai undangan diterbitkan.</Notice>
      )}
      <Card title="Link Umum">
        <p className="mb-3 text-sm text-stone-600">Untuk dibagikan di grup atau media sosial (tanpa nama tamu).</p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded bg-stone-100 px-2 py-1 text-sm break-all">{publicLink}</code>
          <CopyButton text={publicLink} label="Salin" className={secondaryButtonClass} />
        </div>
      </Card>
      <Card title="Tambah Tamu">
        <GuestPaste invitationId={inv.id} />
      </Card>
      <Card title="Kirim Daftar ke Mempelai">
        <GuestListShare
          coupleName={`${inv.groom_nickname} & ${inv.bride_nickname}`}
          siteUrl={SITE_URL}
          slug={inv.slug}
          guests={guests}
        />
      </Card>
      <Card title={`Daftar Tamu (${guests.length})`}>
        <GuestTable
          invitationId={inv.id}
          slug={inv.slug}
          coupleName={`${inv.groom_nickname} & ${inv.bride_nickname}`}
          siteUrl={SITE_URL}
          waTemplate={effectiveTexts(inv).wa}
          guests={guests}
        />
      </Card>
    </div>
  )
}
