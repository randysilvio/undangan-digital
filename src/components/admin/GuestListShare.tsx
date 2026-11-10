'use client'

import { CopyButton } from '@/components/invitation/CopyButton'
import { canShareListViaWa, guestListMessage } from '@/lib/guest-list'
import { waShareUrl } from '@/lib/links'
import { buttonClass, secondaryButtonClass } from './ui'

/** Satu teks berisi nama + link pribadi semua tamu, untuk dikirim sekali ke mempelai. */
export function GuestListShare(props: { coupleName: string; siteUrl: string; slug: string; guests: { name: string; code: string }[] }) {
  if (props.guests.length === 0) {
    return <p className="text-sm text-stone-500">Belum ada tamu. Tambahkan tamu dulu di atas.</p>
  }
  const text = guestListMessage(props)
  const viaWa = canShareListViaWa(text)

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-600">
        Untuk tamu tanpa nomor WA: kirim daftar {props.guests.length} tamu (nama + link pribadi) ke mempelai, lalu mempelai
        meneruskan setiap link ke tamunya.
      </p>
      <div className="flex flex-wrap gap-2">
        <CopyButton text={text} label="Salin daftar" className={buttonClass} />
        {viaWa && (
          <a
            href={waShareUrl(null, text)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${secondaryButtonClass} border-green-300 text-green-800 hover:bg-green-50`}
          >
            Kirim WA
          </a>
        )}
      </div>
      {!viaWa && (
        <p className="text-xs text-stone-500">
          Daftar ini terlalu panjang untuk tombol WhatsApp. Klik <strong>Salin daftar</strong>, lalu tempel di chat mempelai.
        </p>
      )}
    </div>
  )
}
