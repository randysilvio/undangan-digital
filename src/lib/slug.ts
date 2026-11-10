export const RESERVED_SLUGS = ['admin', 'api', 'login', '_next', 'favicon.ico'] as const

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_LENGTH = 60

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, MAX_LENGTH)
    .replace(/^-+|-+$/g, '')
}

export function isValidSlug(s: string): boolean {
  return (
    s.length >= 3 &&
    s.length <= MAX_LENGTH &&
    SLUG_PATTERN.test(s) &&
    !(RESERVED_SLUGS as readonly string[]).includes(s)
  )
}

export function nextAvailableSlug(base: string, taken: string[]): string {
  const used = new Set(taken)
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
