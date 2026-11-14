import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { InvitationView } from '@/components/invitation/InvitationView'
import { BRAND } from '@/lib/brand'
import { getPublishedInvitation, getVisibleWishes } from '@/lib/data/public'
import { getSiteSettings } from '@/lib/data/site'
import { SITE_URL } from '@/lib/supabase/env'
import { eventTitle } from '@/lib/kinds'
import { parseGuestName } from '@/lib/links'
import { earliestEvent, formatTanggal } from '@/lib/time'

const CODE = /^[a-z0-9]{6}$/

export async function generateMetadata({ params }: PageProps<'/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const inv = await getPublishedInvitation(slug)
  if (!inv) return { title: { absolute: 'Undangan tidak ditemukan' }, robots: { index: false } }
  const title = `Undangan ${eventTitle(inv)}`
  const first = earliestEvent(inv.events, inv.timezone)
  const description = first ? formatTanggal(first.date) : `Undangan ${eventTitle(inv)}`
  const images = inv.cover_photo_url ? [{ url: inv.cover_photo_url }] : undefined
  return {
    title: { absolute: title },
    description,
    robots: { index: false },
    openGraph: { title, description, type: 'website', images },
  }
}

export default function InvitationPage(props: PageProps<'/[slug]'>) {
  return (
    <Suspense fallback={<Loading />}>
      <InvitationContent {...props} />
    </Suspense>
  )
}

async function InvitationContent({ params, searchParams }: PageProps<'/[slug]'>) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const inv = await getPublishedInvitation(slug)
  if (!inv) notFound()
  const [wishes, settings] = await Promise.all([getVisibleWishes(inv.id), getSiteSettings()])
  const g = typeof sp.g === 'string' && CODE.test(sp.g) ? sp.g : null
  const credit = settings.show_credit ? { label: BRAND, href: SITE_URL } : null
  return <InvitationView invitation={inv} guestName={parseGuestName(sp.to)} guestCode={g} wishes={wishes} credit={credit} />
}

function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-stone-100">
      <p className="animate-pulse text-stone-500">Membuka undangan…</p>
    </div>
  )
}
