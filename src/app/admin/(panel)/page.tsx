import Link from 'next/link'
import { Suspense } from 'react'
import { buttonClass, inputClass, secondaryButtonClass } from '@/components/admin/ui'
import { requireAdmin } from '@/lib/auth'
import { listInvitations } from '@/lib/data/admin'
import { displayName, KINDS } from '@/lib/kinds'
import { formatTanggal } from '@/lib/time'
import { duplicateAction } from './actions'

export default function AdminHome(props: PageProps<'/admin'>) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Undangan</h1>
        <Link href="/admin/new" className={buttonClass}>
          + Buat Undangan
        </Link>
      </div>
      <Suspense fallback={<p className="text-stone-500">Memuat daftar…</p>}>
        <InvitationList searchParams={props.searchParams} />
      </Suspense>
    </div>
  )
}

async function InvitationList({ searchParams }: { searchParams: PageProps<'/admin'>['searchParams'] }) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  const { supabase } = await requireAdmin()
  const rows = await listInvitations(supabase, q)

  return (
    <>
      <form className="flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Cari nama pasangan atau alamat…" className={inputClass} aria-label="Cari undangan" />
        <button className={secondaryButtonClass}>Cari</button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          {q ? 'Tidak ada undangan yang cocok.' : 'Belum ada undangan. Klik “Buat Undangan” untuk memulai.'}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map((inv) => (
            <li key={inv.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{displayName(inv)}</p>
                  <p className="text-xs font-medium text-amber-700">{KINDS[inv.kind].label}</p>
                  <p className="text-sm text-stone-500">/{inv.slug}</p>
                  <p className="text-xs text-stone-400">Dibuat {formatTanggal(inv.created_at.slice(0, 10))}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    inv.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {inv.status === 'published' ? 'Terbit' : 'Draft'}
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-600">{inv.rsvp_count} RSVP</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/admin/${inv.id}/edit`} className={secondaryButtonClass}>
                  Edit
                </Link>
                <Link href={inv.status === 'published' ? `/${inv.slug}` : `/admin/${inv.id}/preview`} target="_blank" className={secondaryButtonClass}>
                  Lihat
                </Link>
                <form action={duplicateAction}>
                  <input type="hidden" name="id" value={inv.id} />
                  <button className={secondaryButtonClass}>Duplikat</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
