import { Icon, type IconName } from '@/components/icons'
import { Ornament } from './Section'

export function ClosingSection({
  coupleName,
  text,
  signOff = 'Kami yang berbahagia,',
  motif,
}: {
  coupleName: string
  text: string
  signOff?: string
  motif?: IconName
}) {
  return (
    <section data-section="penutup" className="relative bg-inv-bg px-6 pt-20 pb-28 text-center">
      <div className="mx-auto max-w-md">
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
      </div>
    </section>
  )
}
