import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/supabase/env'

/** Halaman publik boleh diindeks; panel admin dan link pantau tidak. Undangan tamu sudah memakai noindex. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: ['/', '/contoh/'], disallow: ['/admin', '/pantau'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
