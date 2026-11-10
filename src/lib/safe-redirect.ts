/** Hanya izinkan redirect ke halaman admin sendiri (mencegah open redirect). */
export function safeRedirect(next: string | null | undefined): string {
  if (typeof next !== 'string' || next.includes('\\')) return '/admin'
  if (next === '/admin' || next.startsWith('/admin/') || next.startsWith('/admin?')) return next
  return '/admin'
}
