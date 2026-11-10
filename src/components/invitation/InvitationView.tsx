import { effectiveTexts } from '@/lib/text-templates'
import { earliestEvent, eventInstant, formatTanggal } from '@/lib/time'
import type { InvitationFull, Wish } from '@/lib/types'
import { ClosingSection } from './ClosingSection'
import { Countdown } from './Countdown'
import { CoupleSection } from './CoupleSection'
import { CoverGate } from './CoverGate'
import { EventsSection } from './EventsSection'
import { GallerySection } from './GallerySection'
import { GiftSection } from './GiftSection'
import { OpeningSection } from './OpeningSection'
import { RsvpForm } from './RsvpForm'
import { Section } from './Section'
import { WishesForm } from './WishesSection'

export interface InvitationViewProps {
  invitation: InvitationFull
  guestName: string | null
  guestCode: string | null
  wishes: Wish[]
  preview?: boolean
}

export function InvitationView({ invitation: inv, guestName, guestCode, wishes, preview }: InvitationViewProps) {
  const coupleName = `${inv.groom_nickname} & ${inv.bride_nickname}`
  const texts = effectiveTexts(inv)
  const first = earliestEvent(inv.events, inv.timezone)

  return (
    <main data-theme={inv.theme} className="min-h-dvh bg-inv-bg font-body text-inv-text [overflow-wrap:anywhere]">
      {preview && (
        <p className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
          Mode pratinjau{inv.status === 'draft' ? ' — undangan belum terbit' : ''}
        </p>
      )}

      <CoverGate
        guestName={guestName}
        coupleName={coupleName}
        dateLabel={first ? formatTanggal(first.date) : null}
        coverUrl={inv.cover_photo_url}
        musicUrl={inv.music_url}
        preview={preview}
      >
        {inv.opening_text && <OpeningSection text={inv.opening_text} />}
        <CoupleSection invitation={inv} intro={texts.intro} />

        {first && (
          <Section id="hitung-mundur" title="Menuju Hari Bahagia">
            <Countdown target={eventInstant(first.date, first.start_time, inv.timezone).toISOString()} />
          </Section>
        )}

        {inv.events.length > 0 && <EventsSection events={inv.events} timezone={inv.timezone} coupleName={coupleName} />}
        {inv.gallery.length > 0 && <GallerySection photos={inv.gallery} />}
        {inv.gifts.length > 0 && <GiftSection gifts={inv.gifts} />}

        <Section id="rsvp" title="Konfirmasi Kehadiran" subtitle="Mohon konfirmasi kehadiran Anda untuk membantu persiapan kami.">
          <RsvpForm invitationId={inv.id} slug={inv.slug} guestName={guestName} guestCode={guestCode} disabled={preview} />
        </Section>

        <Section id="ucapan" title="Ucapan & Doa" tone="surface">
          <WishesForm invitationId={inv.id} slug={inv.slug} guestName={guestName} wishes={wishes} disabled={preview} />
        </Section>

        <ClosingSection coupleName={coupleName} text={texts.closing} />
      </CoverGate>
    </main>
  )
}
