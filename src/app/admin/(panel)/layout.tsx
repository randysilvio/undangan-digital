import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { requireAdmin } from '@/lib/auth'
import { logout } from '../login/actions'

export const metadata: Metadata = { title: 'Panel Admin', robots: { index: false } }

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/admin" className="shrink-0 font-semibold">
              Valynz.id <span className="font-normal text-stone-400">Admin</span>
            </Link>
            <nav className="flex gap-4 overflow-x-auto text-sm text-stone-600">
              <Link href="/admin" className="shrink-0 hover:text-stone-900">
                Undangan
              </Link>
              <Link href="/admin/tema" className="shrink-0 hover:text-stone-900">
                Tema Saya
              </Link>
              <Link href="/admin/pengaturan" className="shrink-0 hover:text-stone-900">
                Pengaturan
              </Link>
            </nav>
          </div>
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
