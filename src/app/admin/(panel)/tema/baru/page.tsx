import Link from 'next/link'
import { ThemeForm } from '@/components/admin/ThemeForm'

export default function NewThemePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tema" className="text-sm text-stone-500 hover:text-stone-900">
          ← Tema Saya
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Buat Tema</h1>
        <p className="text-sm text-stone-500">Gambar hiasan bisa diunggah setelah tema dibuat.</p>
      </div>
      <ThemeForm />
    </div>
  )
}
