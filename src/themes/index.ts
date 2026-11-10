import type { ThemeName } from '@/lib/types'

export interface ThemeConfig {
  name: ThemeName
  label: string
  description: string
  /** Variabel CSS font (didefinisikan di app/fonts.ts). Warna & font lengkap ada di globals.css [data-theme]. */
  headingFont: string
  bodyFont: string
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  elegan: {
    name: 'elegan',
    label: 'Elegan',
    description: 'Krem dan emas, huruf serif klasik',
    headingFont: 'var(--font-cormorant)',
    bodyFont: 'var(--font-lato)',
  },
}
