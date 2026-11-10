import { Ornament } from './Section'

export function ClosingSection({ coupleName }: { coupleName: string }) {
  return (
    <section data-section="penutup" className="bg-inv-bg px-6 pt-16 pb-28 text-center">
      <div className="inv-fade-in mx-auto max-w-md">
        <p className="text-inv-text">
          Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
          restu.
        </p>
        <p className="mt-6 text-sm text-inv-muted">Kami yang berbahagia,</p>
        <p className="mt-2 font-names text-4xl text-inv-accent">{coupleName}</p>
        <Ornament />
      </div>
    </section>
  )
}
