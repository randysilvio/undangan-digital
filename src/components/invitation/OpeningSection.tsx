import { Section } from './Section'

export function OpeningSection({ text }: { text: string }) {
  return (
    <Section id="pembuka" tone="surface">
      <blockquote className="text-center">
        <span aria-hidden className="block font-heading text-5xl leading-none text-inv-accent">
          “
        </span>
        <p className="font-heading text-xl leading-relaxed whitespace-pre-line text-inv-text">{text}</p>
      </blockquote>
    </Section>
  )
}
