export const guestInput =
  'w-full rounded-xl border border-inv-line bg-inv-bg px-4 py-3 text-inv-text placeholder:text-inv-muted/70 focus:border-inv-accent focus:outline-none focus:ring-2 focus:ring-inv-accent/20'

/** Kolom jebakan bot: disembunyikan dari manusia dan pembaca layar. */
export const honeypotProps = {
  name: 'website',
  type: 'text',
  tabIndex: -1,
  autoComplete: 'off',
  'aria-hidden': true,
  className: 'absolute -left-[9999px] h-px w-px opacity-0',
} as const
