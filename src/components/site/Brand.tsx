import Link from 'next/link'
import { BRAND } from '@/lib/brand'

/** Logo Valynz.id: monogram V di kotak merah marun. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-display text-xl font-semibold ${className}`}>
      <svg aria-hidden viewBox="0 0 64 64" className="size-8 shrink-0">
        <rect width="64" height="64" rx="14" fill="#7a2e2a" />
        <path d="M17 17h7.5L32 39.5 39.5 17H47L35.6 47h-7.2z" fill="#f6efe4" />
        <circle cx="32" cy="12.5" r="3.2" fill="#d9b779" />
      </svg>
      {BRAND}
    </Link>
  )
}
