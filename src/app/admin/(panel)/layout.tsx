import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { requireAdmin } from '@/lib/auth'
import { logout } from '../login/actions'

export const metadata: Metadata = { title: 'Panel Undangan', robots: { index: false } }

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold">
            Panel Undangan
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-stone-600 hover:text-stone-900">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Suspense fallback={<p className="text-stone-500">Memuat…</p>}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  )
}

async function AdminGate({ children }: { children: ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}
