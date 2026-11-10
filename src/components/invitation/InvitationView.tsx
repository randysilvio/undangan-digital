import { eventInstant, formatTanggal } from '@/lib/time'
import type { InvitationFull, Wish } from '@/lib/types'
import { ClosingSection } from './ClosingSection'
import { CoupleSection } from './CoupleSection'
import { EventsSection } from './EventsSection'
import { GallerySection } from './GallerySection'
import { GiftSection } from './GiftSection'
import { OpeningSection } from './OpeningSection'
import { Section } from './Section'

export interface InvitationViewProps {
  invitation: InvitationFull
  guestName: string | null
  guestCode: string | null
  wishes: Wish[]
  preview?: boolean
}

export function InvitationView({ invitation: inv, guestName, preview }: InvitationViewProps) {
  const coupleName = `${inv.groom_nickname} & ${inv.bride_nickname}`
  const first = inv.events[0]

  return (
    <main data-theme={inv.theme} className="min-h-dvh bg-inv-bg font-body text-inv-text">
      {preview && (
        <p className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
          Mode pratinjau{inv.status === 'draft' ? ' — undangan belum terbit' : ''}
        </p>
      )}

      <section
        data-section="sampul"
        className="relative flex min-h-dvh flex-col items-center justify-center bg-inv-text bg-cover bg-center px-6 py-16 text-center text-white"
        style={inv.cover_photo_url ? { backgroundImage: `url("${encodeURI(inv.cover_photo_url)}")` } : undefined}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: 'var(--inv-cover-overlay)' }} />
        <div className="relative">
          <p className="text-sm tracking-[0.3em] uppercase opacity-90">Undangan Pernikahan</p>
          <h1 className="mt-4 font-names text-6xl leading-tight">{coupleName}</h1>
          {first && <p className="mt-4 font-heading text-xl">{formatTanggal(first.date)}</p>}
          <div className="mt-10 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">Kepada Yth.</p>
            <p className="text-sm opacity-90">Bapak/Ibu/Saudara/i</p>
            {guestName && <p className="mt-1 font-heading text-2xl font-semibold">{guestName}</p>}
          </div>
        </div>
      </section>

      {inv.opening_text && <OpeningSection text={inv.opening_text} />}
      <CoupleSection invitation={inv} />

      {first && (
        <Section id="hitung-mundur" title="Menuju Hari Bahagia">
          <div className="text-center" data-countdown={eventInstant(first.date, first.start_time, inv.timezone).toISOString()} />
        </Section>
      )}

      {inv.events.length > 0 && <EventsSection events={inv.events} timezone={inv.timezone} coupleName={coupleName} />}
      {inv.gallery.length > 0 && <GallerySection photos={inv.gallery} />}
      {inv.gifts.length > 0 && <GiftSection gifts={inv.gifts} />}
      <ClosingSection coupleName={coupleName} />
    </main>
  )
}
