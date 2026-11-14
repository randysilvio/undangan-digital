import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Masuk · Valynz.id Admin', robots: { index: false } }

export default function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-stone-900">Panel Undangan</h1>
        <p className="mb-6 text-sm text-stone-500">Masuk untuk mengelola undangan.</p>
        <Suspense fallback={<p className="text-sm text-stone-500">Memuat…</p>}>
          <LoginFormWithParams searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}

async function LoginFormWithParams({ searchParams }: { searchParams: PageProps<'/admin/login'>['searchParams'] }) {
  const sp = await searchParams
  const next = typeof sp.next === 'string' ? sp.next : '/admin'
  const error = typeof sp.error === 'string' ? sp.error : null
  return <LoginForm next={next} error={error} />
}
