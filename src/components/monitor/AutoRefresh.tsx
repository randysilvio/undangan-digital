'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type Listenable = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>
export type RefreshEnv = {
  doc: Listenable & Pick<Document, 'visibilityState'>
  win: Listenable & { navigator: Pick<Navigator, 'onLine'> }
}

/**
 * Memanggil refresh tiap intervalMs selama halaman terlihat dan online; sekali saat halaman kembali
 * terlihat (mis. HP dibuka lagi) atau koneksi kembali. Tidak menyegarkan saat offline: router.refresh()
 * yang gagal di jaringan membuat Next bernavigasi penuh ke halaman "tidak ada internet" browser.
 * Mengembalikan fungsi pembersih.
 */
export function startAutoRefresh({ doc, win }: RefreshEnv, refresh: () => void, intervalMs = 60_000): () => void {
  const maybeRefresh = () => {
    if (doc.visibilityState === 'visible' && win.navigator.onLine) refresh()
  }
  const timer = setInterval(maybeRefresh, intervalMs)
  doc.addEventListener('visibilitychange', maybeRefresh)
  win.addEventListener('online', maybeRefresh)
  return () => {
    clearInterval(timer)
    doc.removeEventListener('visibilitychange', maybeRefresh)
    win.removeEventListener('online', maybeRefresh)
  }
}

export function AutoRefresh() {
  const router = useRouter()
  useEffect(() => startAutoRefresh({ doc: document, win: window }, () => router.refresh()), [router])
  return null
}
