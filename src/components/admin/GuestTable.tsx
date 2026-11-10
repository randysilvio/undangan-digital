'use client'

import { useMemo, useState, useTransition } from 'react'
import { deleteGuestAction } from '@/app/admin/(panel)/guest-actions'
import { CopyButton } from '@/components/invitation/CopyButton'
import { guestLink, waShareUrl } from '@/lib/links'
import { fillWaMessage } from '@/lib/text-templates'
import type { Guest } from '@/lib/types'
import { dangerButtonClass, inputClass, secondaryButtonClass } from './ui'

interface GuestTableProps {
  invitationId: string
  slug: string
  coupleName: string
  siteUrl: string
  /** Pesan WA undangan dengan kode {tamu}, {mempelai}, {link}. */
  waTemplate: string
  guests: Guest[]
}

export function GuestTable({ invitationId, slug, coupleName, siteUrl, waTemplate, guests }: GuestTableProps) {
  const [q, setQ] = useState('')
  const [, startTransition] = useTransition()
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? guests.filter((g) => g.name.toLowerCase().includes(s)) : guests
  }, [q, guests])

  function remove(g: Guest) {
    if (!confirm(`Hapus tamu "${g.name}"? Link pribadinya tetap bisa dibuka, tapi tidak tercatat lagi di daftar.`)) return
    startTransition(async () => {
      await deleteGuestAction(invitationId, g.id)
    })
  }

  if (guests.length === 0) return <p className="text-sm text-stone-500">Belum ada tamu.</p>

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari di ${guests.length} tamu…`} className={inputClass} aria-label="Cari tamu" />
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {shown.map((g) => {
          const link = guestLink(siteUrl, slug, g)
          return (
            <li key={g.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium">{g.name}</p>
                <p className="text-xs text-stone-500">{g.phone ? `+${g.phone}` : 'Tanpa nomor WA'}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <CopyButton text={link} label="Salin link" className={secondaryButtonClass} />
                <a
                  href={waShareUrl(g.phone, fillWaMessage(waTemplate, { guestName: g.name, coupleName, link }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${secondaryButtonClass} border-green-300 text-green-800 hover:bg-green-50`}
                >
                  Kirim WA
                </a>
                <button type="button" onClick={() => remove(g)} className={dangerButtonClass} aria-label={`Hapus ${g.name}`}>
                  Hapus
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      {shown.length === 0 && <p className="text-sm text-stone-500">Tidak ada tamu yang cocok.</p>}
    </div>
  )
}
