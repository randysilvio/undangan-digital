import { Icon, type IconName } from '@/components/icons'
import { Ornament } from './Section'

function Corners() {
  return (
    <>
      <span aria-hidden className="inv-corner inv-corner-tl" />
      <span aria-hidden className="inv-corner inv-corner-tr" />
      <span aria-hidden className="inv-corner inv-corner-bl" />
      <span aria-hidden className="inv-corner inv-corner-br" />
    </>
  )
}

export function ClosingSection({
  coupleName,
  text,
  signOff = 'Kami yang berbahagia,',
  motif,
  credit,
}: {
  coupleName: string
  text: string
  signOff?: string
  motif?: IconName
  /** Kredit kecil pembuat undangan (diatur di Pengaturan Situs). */
  credit?: { label: string; href: string } | null
}) {
  return (
    <section data-section="penutup" className="relative overflow-hidden bg-inv-bg px-6 pt-20 pb-28 text-center">
      <Corners />
      <div className="relative mx-auto max-w-md">
        {motif && (
          <div data-reveal="zoom" className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-inv-accent/50 text-inv-accent">
            <Icon name={motif} className="size-7" />
          </div>
        )}
        <p data-reveal="blur" className="whitespace-pre-line text-inv-text">
          {text}
        </p>
        <div data-reveal="up">
          <p className="mt-6 text-sm text-inv-muted">{signOff}</p>
          <p className="mt-2 font-names text-4xl text-inv-accent">{coupleName}</p>
          <Ornament />
        </div>
        {credit && (
          <p className="mt-12 text-xs text-inv-muted">
            Undangan digital oleh{' '}
            <a href={credit.href} target="_blank" rel="noopener" className="font-medium underline-offset-2 hover:underline">
              {credit.label}
            </a>
          </p>
        )}
      </div>
    </section>
  )
}
