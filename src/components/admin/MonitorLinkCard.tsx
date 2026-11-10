'use client'

import { useState, useTransition } from 'react'
import { createMonitorLinkAction, disableMonitorLinkAction } from '@/app/admin/(panel)/monitor-actions'
import { CopyButton } from '@/components/invitation/CopyButton'
import { waShareUrl } from '@/lib/links'
import { monitorWaMessage } from '@/lib/monitor'
import { buttonClass, Card, dangerButtonClass, Notice, secondaryButtonClass } from './ui'

export function MonitorLinkCard({ invitationId, link, coupleName }: { invitationId: string; link: string | null; coupleName: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(action: (id: string) => Promise<{ ok: boolean; message?: string }>, question?: string) {
    if (question && !confirm(question)) return
    setError(null)
    startTransition(async () => {
      const r = await action(invitationId)
      if (!r.ok) setError(r.message ?? 'Gagal menyimpan, coba lagi')
    })
  }

  return (
    <Card title="Link Pantau Mempelai">
      <div className="space-y-3">
        {link ? (
          <>
            <p className="text-sm text-stone-600">Kirim link ini ke mempelai untuk memantau rekap kehadiran tanpa login.</p>
            <p className="rounded-lg bg-stone-100 px-3 py-2 font-mono text-sm break-all">{link}</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={link} label="Salin" className={secondaryButtonClass} />
              <a
                href={waShareUrl(null, monitorWaMessage({ coupleName, link }))}
                target="_blank"
                rel="noopener noreferrer"
                className={`${secondaryButtonClass} border-green-300 text-green-800 hover:bg-green-50`}
              >
                Kirim WA
              </a>
              <button
                type="button"
                disabled={pending}
                className={secondaryButtonClass}
                onClick={() => run(createMonitorLinkAction, 'Link lama tidak akan berlaku lagi. Lanjutkan?')}
              >
                Buat ulang
              </button>
              <button
                type="button"
                disabled={pending}
                className={dangerButtonClass}
                onClick={() => run(disableMonitorLinkAction, 'Matikan link pantau? Mempelai tidak bisa membukanya lagi.')}
              >
                Matikan
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-600">Buat link agar mempelai bisa memantau rekap kehadiran tanpa login.</p>
            <button type="button" disabled={pending} className={buttonClass} onClick={() => run(createMonitorLinkAction)}>
              Buat link
            </button>
          </>
        )}
        {error && <Notice kind="error">{error}</Notice>}
      </div>
    </Card>
  )
}
