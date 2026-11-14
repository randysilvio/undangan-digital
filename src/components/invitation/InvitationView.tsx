import { customThemeAttrs, customThemeStyle } from '@/lib/custom-theme'
import { ageLabel, displayName, eventTitle, KINDS } from '@/lib/kinds'
import { effectiveTexts } from '@/lib/text-templates'
import { earliestEvent, eventInstant, formatTanggal } from '@/lib/time'
import type { InvitationFull, Wish } from '@/lib/types'
import { Ambient } from './Ambient'
import { ClosingSection } from './ClosingSection'
import { Countdown } from './Countdown'
import { CoupleSection } from './CoupleSection'
import { CoverGate } from './CoverGate'
import { EventsSection } from './EventsSection'
import { GallerySection } from './GallerySection'
import { GiftSection } from './GiftSection'
import { RevealObserver } from './Motion'
import { OpeningSection } from './OpeningSection'
import { RsvpForm } from './RsvpForm'
import { Section } from './Section'
import { FamilySection, StorySection } from './StorySection'
import { WishesForm } from './WishesSection'

export interface InvitationViewProps {
  invitation: InvitationFull
  guestName: string | null
  guestCode: string | null
  wishes: Wish[]
  preview?: boolean
  /** Contoh di halaman depan: formulir nonaktif, sampul tetap tampil. */
  demo?: boolean
  /** Kredit kecil pembuat undangan di bagian penutup. */
  credit?: { label: string; href: string } | null
}

export function InvitationView({ invitation: inv, guestName, guestCode, wishes, preview, demo, credit }: InvitationViewProps) {
  const ct = inv.custom_theme ?? null
  const kind = KINDS[inv.kind]
  const coupleName = displayName(inv)
  const disabled = preview || demo
  const texts = effectiveTexts(inv)
  const first = earliestEvent(inv.events, inv.timezone)

  return (
    <main
      data-theme={inv.theme}
      data-reveal-root
      {...customThemeAttrs(ct)}
      style={customThemeStyle(ct)}
      className="min-h-dvh overflow-x-clip bg-inv-bg font-body text-inv-text [overflow-wrap:anywhere]">
      <RevealObserver />
      <Ambient theme={inv.theme} custom={ct ? { mode: ct.particles, image: ct.assets.particle } : undefined} />
      {(preview || demo) && (
        <p className="sticky top-0 z-50 bg-[#2a211c] px-4 py-2 text-center font-sans text-sm font-medium text-[#f6efe4]">
          {demo ? 'Contoh tampilan, semua data fiktif' : `Mode pratinjau${inv.status === 'draft' ? ': undangan belum terbit' : ''}`}
        </p>
      )}

      <CoverGate
        guestName={guestName}
        coupleName={coupleName}
        label={kind.coverLabel}
        motif={kind.motif}
        celebrate={kind.celebrate}
        subtitle={ageLabel(inv.kind, inv.age)}
        dateLabel={first ? formatTanggal(first.date) : null}
        coverUrl={inv.cover_photo_url ?? ct?.assets.cover_bg ?? null}
        musicUrl={inv.music_url}
        preview={preview}
      >
        {inv.opening_text && <OpeningSection text={inv.opening_text} />}
        <CoupleSection invitation={inv} intro={texts.intro} />
        {inv.story?.length > 0 && <StorySection title={kind.storyTitle} items={inv.story} />}

        {first && (
          <Section id="hitung-mundur" title={kind.countdownTitle}>
            <Countdown target={eventInstant(first.date, first.start_time, inv.timezone).toISOString()} />
          </Section>
        )}

        {inv.events.length > 0 && <EventsSection events={inv.events} timezone={inv.timezone} calendarTitle={eventTitle(inv)} dressCode={inv.dress_code} />}
        {inv.gallery.length > 0 && <GallerySection photos={inv.gallery} />}
        {inv.family?.trim() && <FamilySection title={kind.familyTitle} family={inv.family} />}
        {inv.gifts.length > 0 && <GiftSection gifts={inv.gifts} />}

        <Section id="rsvp" title="Konfirmasi Kehadiran" subtitle="Mohon konfirmasi kehadiran Anda untuk membantu persiapan kami.">
          <RsvpForm invitationId={inv.id} slug={inv.slug} guestName={guestName} guestCode={guestCode} disabled={disabled} />
        </Section>

        <Section id="ucapan" title="Ucapan & Doa" tone="surface">
          <WishesForm invitationId={inv.id} slug={inv.slug} guestName={guestName} wishes={wishes} disabled={disabled} />
        </Section>

        <ClosingSection coupleName={coupleName} text={texts.closing} signOff={kind.signOff} motif={kind.motif} credit={credit} />
      </CoverGate>
    </main>
  )
}
