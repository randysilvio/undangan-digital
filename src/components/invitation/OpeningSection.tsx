import { Section } from './Section'

export function OpeningSection({ text }: { text: string }) {
  return (
    <Section id="pembuka" tone="surface">
      <blockquote className="relative text-center">
        <span aria-hidden className="block font-heading text-7xl leading-none text-inv-accent opacity-40">
          &ldquo;
        </span>
        <p className="-mt-6 font-heading text-xl leading-relaxed whitespace-pre-line text-inv-text">{text}</p>
      </blockquote>
    </Section>
  )
}
