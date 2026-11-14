'use client'

import { useActionState } from 'react'
import { deleteThemeAction, duplicateThemeAction } from '@/app/admin/(panel)/theme-actions'
import { initialFormState } from '@/lib/validation'
import { Card, dangerButtonClass, Notice, secondaryButtonClass } from './ui'

export function ThemeDanger({ id, usage }: { id: string; usage: number }) {
  const [state, del, pending] = useActionState(deleteThemeAction, initialFormState)
  return (
    <Card title="Lainnya">
      <div className="flex flex-wrap gap-3">
        <form action={duplicateThemeAction}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={secondaryButtonClass}>
            Duplikat Tema
          </button>
        </form>
        <form
          action={del}
          onSubmit={(e) => {
            if (!confirm('Hapus tema ini? Gambar yang sudah diunggah tidak ikut terhapus dari penyimpanan.')) e.preventDefault()
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" disabled={pending || usage > 0} className={dangerButtonClass} title={usage > 0 ? 'Tema masih dipakai undangan' : undefined}>
            Hapus Tema
          </button>
        </form>
      </div>
      {usage > 0 && <p className="mt-2 text-sm text-stone-500">Tema yang masih dipakai {usage} undangan tidak bisa dihapus.</p>}
      {state.status === 'error' && (
        <div className="mt-3">
          <Notice kind="error">{state.message}</Notice>
        </div>
      )}
    </Card>
  )
}
