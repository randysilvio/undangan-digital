import type { ReactNode } from 'react'
import { formatClock } from '@/lib/time'
import type { MonitorSummary } from '@/lib/types'

function Shell({ theme, children }: { theme?: MonitorSummary['theme']; children: ReactNode }) {
  return (
    <main data-theme={theme} className="flex min-h-dvh justify-center bg-inv-bg px-4 py-10 font-body text-inv-text">
      <div className="w-full max-w-md space-y-6 text-center">{children}</div>
    </main>
  )
}

export function MonitorView({ summary: s }: { summary: MonitorSummary }) {
  const stats = [
    ['Hadir', s.hadir],
    ['Tidak Hadir', s.tidak],
    ['Masih Ragu', s.ragu],
    ['Total Orang', s.totalOrang],
  ] as const

  return (
    <Shell theme={s.theme}>
      <header className="space-y-1">
        <h1 className="font-heading text-4xl text-inv-accent [overflow-wrap:anywhere]">
          {s.groomNickname} &amp; {s.brideNickname}
        </h1>
        <p className="text-inv-muted">Rekap Kehadiran Tamu</p>
        {s.status === 'draft' && (
          <p className="inline-block rounded-full border border-inv-line px-3 py-0.5 text-xs text-inv-muted">Belum terbit</p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-inv-line bg-inv-surface p-4">
            <p className="text-sm text-inv-muted">{label}</p>
            {/* Font isi + angka tegak: angka gaya lama Cormorant membuat 1 mirip I dan 0 mirip O. */}
            <p className="font-body text-4xl font-semibold lining-nums tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-inv-muted">Diperbarui {formatClock(s.generatedAt, s.timezone)} · menyegarkan otomatis</p>
    </Shell>
  )
}

export function MonitorUnavailable() {
  return (
    <Shell>
      <p className="text-inv-muted">Sedang ada gangguan, mencoba lagi otomatis…</p>
    </Shell>
  )
}
