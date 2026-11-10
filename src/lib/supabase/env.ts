export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
/**
 * Alamat web untuk link tamu & link pantau. Urutan: NEXT_PUBLIC_SITE_URL bila diisi, lalu domain
 * produksi dari Vercel (otomatis tersedia saat build di Vercel), terakhir localhost untuk lokal.
 */
export function resolveSiteUrl(env: { site?: string; vercelProduction?: string }): string {
  const site = env.site?.trim()
  if (site) return site.replace(/\/+$/, '')
  const vercel = env.vercelProduction?.trim()
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

export const SITE_URL = resolveSiteUrl({
  site: process.env.NEXT_PUBLIC_SITE_URL,
  vercelProduction: process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
})
