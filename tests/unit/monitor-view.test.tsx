import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MonitorView } from '@/components/monitor/MonitorView'
import type { MonitorSummary } from '@/lib/types'

const summary = (o: Partial<MonitorSummary> = {}): MonitorSummary => ({
  groomNickname: 'Budi',
  brideNickname: 'Ani',
  theme: 'elegan',
  timezone: 'Asia/Jayapura',
  status: 'published',
  hadir: 48,
  tidak: 12,
  ragu: 5,
  totalOrang: 97,
  generatedAt: '2026-11-10T05:42:00Z',
  ...o,
})
const html = (o?: Partial<MonitorSummary>) => renderToStaticMarkup(<MonitorView summary={summary(o)} />)

describe('MonitorView', () => {
  it('menampilkan nama pasangan, 4 label dan angka', () => {
    const out = html()
    expect(out).toContain('Budi &amp; Ani')
    expect(out).toContain('Rekap Kehadiran Tamu')
    for (const text of ['Hadir', 'Tidak Hadir', 'Masih Ragu', 'Total Orang', '>48<', '>12<', '>5<', '>97<']) expect(out).toContain(text)
  })

  it('angka memakai font isi dengan angka tegak (Cormorant: 1 mirip I, 0 mirip O)', () => {
    const value = html().match(/<p class="([^"]*)">48<\/p>/)?.[1] ?? ''
    expect(value).toContain('font-body')
    expect(value).toContain('lining-nums')
    expect(value).not.toContain('font-heading')
  })

  it('data-theme mengikuti tema', () => {
    expect(html({ theme: 'modern' })).toContain('data-theme="modern"')
  })

  it('label Belum terbit hanya untuk draft', () => {
    expect(html({ status: 'draft' })).toContain('Belum terbit')
    expect(html()).not.toContain('Belum terbit')
  })

  it('baris Diperbarui memakai zona undangan', () => {
    expect(html()).toContain('Diperbarui 14.42 WIT · menyegarkan otomatis')
  })
})
