import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { GalleryManager } from '@/components/admin/GalleryManager'
import { GiftsEditor } from '@/components/admin/GiftsEditor'
import { MediaSlot } from '@/components/admin/MediaSlot'
import { Card } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { getInvitation } from '@/lib/data/admin'
import { isWedding } from '@/lib/kinds'

export default function MediaPage(props: PageProps<'/admin/[id]/media'>) {
  return (
    <Suspense fallback={<p className="text-stone-500">Memuat…</p>}>
      <Media {...props} />
    </Suspense>
  )
}

async function Media({ params }: PageProps<'/admin/[id]/media'>) {
  const { id } = await params
  const { supabase } = await requireAdmin()
  const inv = await getInvitation(supabase, id)
  if (!inv) notFound()
  return (
    <div className="space-y-6">
      <Card title="Foto Utama">
        <div className="grid gap-6 sm:grid-cols-3">
          <MediaSlot
            invitationId={inv.id}
            field="cover_photo_url"
            label="Foto sampul"
            url={inv.cover_photo_url}
            kind="photo"
            hint="Sebaiknya foto tegak (portrait)."
          />
          {isWedding(inv.kind) ? (
            <>
              <MediaSlot invitationId={inv.id} field="groom_photo_url" label="Foto mempelai pria" url={inv.groom_photo_url} kind="photo" />
              <MediaSlot invitationId={inv.id} field="bride_photo_url" label="Foto mempelai wanita" url={inv.bride_photo_url} kind="photo" />
            </>
          ) : (
            <MediaSlot invitationId={inv.id} field="groom_photo_url" label="Foto yang berulang tahun" url={inv.groom_photo_url} kind="photo" />
          )}
        </div>
      </Card>
      <Card title="Galeri">
        <GalleryManager invitationId={inv.id} photos={inv.gallery} />
      </Card>
      <Card title="Musik Latar">
        <div className="max-w-md">
          <MediaSlot
            invitationId={inv.id}
            field="music_url"
            label="Lagu (MP3, maks. 10 MB)"
            url={inv.music_url}
            kind="music"
            hint="Diputar saat tamu menekan “Buka Undangan”."
          />
        </div>
      </Card>
      <Card title="Amplop Digital">
        <GiftsEditor invitationId={inv.id} gifts={inv.gifts} />
      </Card>
    </div>
  )
}
