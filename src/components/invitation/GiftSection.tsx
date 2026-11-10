import type { GiftAccount } from '@/lib/types'
import { CopyButton } from './CopyButton'
import { outlineButton, Section } from './Section'

export function GiftSection({ gifts }: { gifts: GiftAccount[] }) {
  return (
    <Section
      id="amplop"
      title="Amplop Digital"
      tone="surface"
      subtitle="Doa restu Anda merupakan karunia yang sangat berarti. Bila ingin memberikan tanda kasih, dapat melalui:"
    >
      <div className="space-y-4">
        {gifts.map((g) => (
          <div key={g.id} className="rounded-2xl border border-inv-line bg-inv-bg p-5 text-center">
            <p className="text-sm font-semibold tracking-widest text-inv-accent uppercase">{g.provider}</p>
            <p className="mt-2 font-mono text-xl tracking-wider text-inv-text">{g.account_number}</p>
            <p className="text-sm text-inv-muted">a.n. {g.account_holder}</p>
            <CopyButton text={g.account_number.replace(/\s/g, '')} label="Salin Nomor" className={`${outlineButton} mt-4`} />
          </div>
        ))}
      </div>
    </Section>
  )
}
