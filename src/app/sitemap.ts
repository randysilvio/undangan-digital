import type { MetadataRoute } from 'next'
import { kindSlug } from '@/lib/demo'
import { KIND_IDS } from '@/lib/kinds'
import { SITE_URL } from '@/lib/supabase/env'
import { THEME_NAMES, THEMES } from '@/themes'

export default function sitemap(): MetadataRoute.Sitemap {
  const examples = KIND_IDS.flatMap((k) =>
    THEME_NAMES.filter((t) => THEMES[t].suits.includes(k)).map((t) => ({
      url: `${SITE_URL}/contoh/${kindSlug(k)}/${t}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  )
  return [{ url: SITE_URL, changeFrequency: 'weekly', priority: 1 }, ...examples]
}
