import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Card, secondaryButtonClass } from '@/components/admin/ui'
import { WishToggle } from '@/components/admin/WishToggle'
import { requireAdmin } from '@/lib/auth'
import { ATTENDANCE_LABEL } from '@/lib/csv'
import { getInvitation, listAllWishes, listRsvps } from '@/lib/data/admin'
import { latestRsvps, summarizeRsvps } from '@/lib/rsvp'
import { formatTimestamp } from '@/lib/time'

export default function ResponsesPage(props: PageProps<'/admin/[id]/responses'>) {
  return (
    <Suspense fallback={<p className="text-stone-500">Memuat…</p>}>
      <Responses {...props} />
    </Suspense>
  )
}

async function Responses({ params }: PageProps<'/admin/[id]/responses'>) {
  const { id } = await params
  const { supabase } = await requireAdmin()
  const [inv, rsvps, wishes] = await Promise.all([getInvitation(supabase, id), listRsvps(supabase, id), listAllWishes(supabase, id)])
  if (!inv) notFound()
  const summary = summarizeRsvps(rsvps)
  const latest = new Set(latestRsvps(rsvps).map((r) => r.id))

  const stats = [
    ['Hadir', summary.hadir],
    ['Tidak Hadir', summary.tidak],
    ['Masih Ragu', summary.ragu],
    ['Total Orang', summary.totalOrang],
  ] as const

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-stone-500">{label}</p>
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <Card
        title={`RSVP (${rsvps.length})`}
        actions={
          rsvps.length > 0 && (
            <a href={`/admin/${inv.id}/responses/rsvp.csv`} className={secondaryButtonClass} download>
              Unduh CSV
            </a>
          )
        }
      >
        {rsvps.length === 0 ? (
          <p className="text-sm text-stone-500">Belum ada RSVP.</p>
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-stone-200 text-stone-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">Nama</th>
                  <th className="py-2 pr-3 font-medium">Kehadiran</th>
                  <th className="py-2 pr-3 font-medium">Orang</th>
                  <th className="py-2 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rsvps.map((r) => (
                  <tr key={r.id} className={latest.has(r.id) ? '' : 'text-stone-400 line-through'} title={latest.has(r.id) ? undefined : 'Jawaban lama (sudah diperbarui tamu)'}>
                    <td className="py-2 pr-3">{r.name}</td>
                    <td className="py-2 pr-3">{ATTENDANCE_LABEL[r.attendance]}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.party_size}</td>
                    <td className="py-2 whitespace-nowrap">{formatTimestamp(r.created_at, inv.timezone)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-stone-500">Baris dicoret = jawaban lama; rekap hanya memakai jawaban terakhir tiap tamu.</p>
          </div>
        )}
      </Card>

      <Card title={`Ucapan (${wishes.length})`}>
        {wishes.length === 0 ? (
          <p className="text-sm text-stone-500">Belum ada ucapan.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {wishes.map((w) => (
              <li key={w.id} className={`flex items-start justify-between gap-3 py-3 ${w.hidden ? 'opacity-50' : ''}`}>
                <div className="min-w-0">
                  <p className="font-medium">
                    {w.name} {w.hidden && <span className="ml-1 rounded bg-stone-200 px-1.5 text-xs">disembunyikan</span>}
                  </p>
                  <p className="text-sm whitespace-pre-line text-stone-700">{w.message}</p>
                  <p className="text-xs text-stone-400">{formatTimestamp(w.created_at, inv.timezone)}</p>
                </div>
                <WishToggle invitationId={inv.id} wishId={w.id} hidden={w.hidden} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
