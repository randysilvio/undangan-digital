'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  ['edit', 'Data'],
  ['media', 'Media & Amplop'],
  ['guests', 'Tamu'],
  ['responses', 'RSVP & Ucapan'],
  ['preview', 'Pratinjau'],
] as const

export function AdminNav({ id }: { id: string }) {
  const pathname = usePathname()
  return (
    <nav className="-mx-4 overflow-x-auto px-4" aria-label="Menu undangan">
      <ul className="flex min-w-max gap-1 border-b border-stone-200">
        {TABS.map(([seg, label]) => {
          const href = `/admin/${id}/${seg}`
          const active = pathname === href
          return (
            <li key={seg}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`block border-b-2 px-3 py-2 text-sm font-medium ${
                  active ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
