'use client'

/** Halaman bila server/database sedang bermasalah (misalnya proyek Supabase gratis sedang dijeda). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">Maaf, terjadi gangguan</h1>
      <p className="max-w-sm text-stone-600">Undangan sedang tidak bisa dimuat. Silakan coba lagi beberapa saat lagi.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700"
      >
        Coba lagi
      </button>
    </main>
  )
}
