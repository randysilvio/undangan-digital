'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type VisibilityDoc = Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>

/**
 * Memanggil refresh tiap intervalMs selama halaman terlihat, dan sekali saat halaman kembali
 * terlihat (mis. HP dibuka lagi). Mengembalikan fungsi pembersih.
 */
export function startAutoRefresh(doc: VisibilityDoc, refresh: () => void, intervalMs = 60_000): () => void {
  const timer = setInterval(() => {
    if (doc.visibilityState === 'visible') refresh()
  }, intervalMs)
  const onVisible = () => {
    if (doc.visibilityState === 'visible') refresh()
  }
  doc.addEventListener('visibilitychange', onVisible)
  return () => {
    clearInterval(timer)
    doc.removeEventListener('visibilitychange', onVisible)
  }
}

export function AutoRefresh() {
  const router = useRouter()
  useEffect(() => startAutoRefresh(document, () => router.refresh()), [router])
  return null
}
