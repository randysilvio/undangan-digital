import { Ornament } from './Section'

export function ClosingSection({ coupleName, text, signOff = 'Kami yang berbahagia,' }: { coupleName: string; text: string; signOff?: string }) {
  return (
    <section data-section="penutup" className="bg-inv-bg px-6 pt-16 pb-28 text-center">
      <div className="inv-fade-in mx-auto max-w-md">
        <p className="whitespace-pre-line text-inv-text">{text}</p>
        <p className="mt-6 text-sm text-inv-muted">{signOff}</p>
        <p className="mt-2 font-names text-4xl text-inv-accent">{coupleName}</p>
        <Ornament />
      </div>
    </section>
  )
}
