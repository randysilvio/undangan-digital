import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AutoRefresh } from '@/components/monitor/AutoRefresh'
import { MonitorUnavailable, MonitorView } from '@/components/monitor/MonitorView'
import { getMonitorSummary } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Rekap Kehadiran',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function MonitorPage(props: PageProps<'/pantau/[token]'>) {
  return (
    <Suspense fallback={<p className="p-6 text-center text-stone-500">Memuat…</p>}>
      <Monitor {...props} />
    </Suspense>
  )
}

async function Monitor({ params }: PageProps<'/pantau/[token]'>) {
  const { token } = await params
  const r = await getMonitorSummary(token)
  if (r.kind === 'invalid') notFound()
  return (
    <>
      {r.kind === 'ok' ? <MonitorView summary={r.summary} /> : <MonitorUnavailable />}
      <AutoRefresh />
    </>
  )
}
