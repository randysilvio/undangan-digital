import type { SVGProps } from 'react'

/** Ikon garis buatan sendiri (24×24, stroke = currentColor). */
const PATHS = {
  rings: (
    <>
      <circle cx="9" cy="14" r="5.5" />
      <circle cx="15" cy="14" r="5.5" />
      <path d="M13 5.5 15 3l2 2.5-2 2z" />
    </>
  ),
  cake: (
    <>
      <path d="M4 21h16M5 21v-6.5a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5V21" />
      <path d="M5 16.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0" />
      <path d="M8 13V9.5M12 13V9.5M16 13V9.5" />
      <path d="M8 7.2c.6-.6.6-1.4 0-2.2-.6.8-.6 1.6 0 2.2zM12 7.2c.6-.6.6-1.4 0-2.2-.6.8-.6 1.6 0 2.2zM16 7.2c.6-.6.6-1.4 0-2.2-.6.8-.6 1.6 0 2.2z" />
    </>
  ),
  balloon: (
    <>
      <path d="M12 15c3.3 0 5.5-3 5.5-6.2S15 3 12 3 6.5 5.6 6.5 8.8 8.7 15 12 15z" />
      <path d="m11 15 1 1.5 1-1.5M12 16.5c-1.5 1.5 1.5 2.5 0 4" />
      <path d="M9.5 6.5c.4-.7 1-1.1 1.7-1.3" />
    </>
  ),
  crown: (
    <>
      <path d="M4 18 3 8l5 4 4-7 4 7 5-4-1 10z" />
      <path d="M4.5 21h15" />
    </>
  ),
  glasses: (
    <>
      <path d="M5 3h5l-.4 5a2.1 2.1 0 0 1-4.2 0zM14 3h5l.4 5a2.1 2.1 0 0 1-4.2 0z" />
      <path d="M7.5 10v8M16.5 10v8M5 21h5M14 21h5M7.5 18v3M16.5 18v3" />
    </>
  ),
  branch: (
    <>
      <path d="M5 21C9 15 12 9 19 3" />
      <path d="M9 14.5c-2.4.3-4-.6-4.8-2.6 2.3-.6 4 .2 4.8 2.6zM12 10.5c-.3-2.4.7-4 2.7-4.7.5 2.3-.4 4-2.7 4.7zM13.5 8.6c2.4.1 3.9 1.2 4.4 3.3-2.4.3-3.9-.8-4.4-3.3z" />
    </>
  ),
  envelope: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="m3.5 6.5 8.5 7 8.5-7" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  chat: <path d="M4 18.5 5.3 15A7.5 7.5 0 1 1 8.6 18zM8.5 11h7M8.5 14h4.5" />,
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.3 4.6-4.8" />
    </>
  ),
  pen: <path d="M4 20l1.2-4.4L15.6 5.2a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.4 18.8zM13.5 7.3l3.2 3.2" />,
  hourglass: <path d="M6.5 3h11M6.5 21h11M7.5 3c0 4.5 4.5 5.5 4.5 9s-4.5 4.5-4.5 9M16.5 3c0 4.5-4.5 5.5-4.5 9s4.5 4.5 4.5 9" />,
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
      <path d="M5 12.5V20h14v-7.5M12 8.5V20" />
      <path d="M12 8.5C10.8 5 7.5 4.6 7.5 6.6c0 1.6 2.6 1.9 4.5 1.9zM12 8.5c1.2-3.5 4.5-3.9 4.5-1.9 0 1.6-2.6 1.9-4.5 1.9z" />
    </>
  ),
  photo: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <path d="m3.5 16 4.6-4.4 3.4 3.2 2.8-2.6 6.2 5.3" />
      <circle cx="15.5" cy="9" r="1.4" />
    </>
  ),
  chart: <path d="M4 20h16M7 20v-6M12 20V8M17 20v-9" />,
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  shirt: <path d="M8.5 3.5 4 6l1.5 4.5L7.5 10v10.5h9V10l2 .5L20 6l-4.5-2.5c-.4 1.6-1.8 2.6-3.5 2.6S8.9 5.1 8.5 3.5z" />,
  family: (
    <>
      <circle cx="7.5" cy="7" r="2.3" />
      <circle cx="16.5" cy="7" r="2.3" />
      <circle cx="12" cy="13" r="1.8" />
      <path d="M3.5 20v-4.5a4 4 0 0 1 8 0M12.5 15.5a4 4 0 0 1 8 0V20M9.5 20v-2a2.5 2.5 0 0 1 5 0v2" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
      <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {PATHS[name]}
    </svg>
  )
}
