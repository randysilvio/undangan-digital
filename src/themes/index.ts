import type { InvitationKind, ThemeName } from '@/lib/types'

export interface ThemeConfig {
  name: ThemeName
  label: string
  description: string
  /** Jenis undangan yang paling cocok (penanda "Cocok untuk" di formulir). */
  suits: InvitationKind[]
  /** Warna contoh untuk kartu pilihan tema: latar, permukaan, aksen. */
  swatch: [string, string, string]
  /** Variabel CSS font (didefinisikan di app/fonts.ts). Warna & font lengkap ada di globals.css [data-theme]. */
  headingFont: string
  bodyFont: string
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  elegan: {
    name: 'elegan',
    label: 'Elegan',
    description: 'Krem dan emas, huruf serif klasik',
    suits: ['pernikahan', 'ultah_syukur'],
    swatch: ['#f7f1e8', '#fffaf3', '#b08d57'],
    headingFont: 'var(--font-cormorant)',
    bodyFont: 'var(--font-lato)',
  },
  modern: {
    name: 'modern',
    label: 'Modern',
    description: 'Putih bersih dan abu gelap, huruf sans-serif',
    suits: ['pernikahan', 'ultah_dewasa'],
    swatch: ['#ffffff', '#f3f4f6', '#1f2937'],
    headingFont: 'var(--font-montserrat)',
    bodyFont: 'var(--font-inter)',
  },
  botani: {
    name: 'botani',
    label: 'Botani',
    description: 'Hijau sage dan krem, nuansa taman yang teduh',
    suits: ['pernikahan', 'ultah_syukur'],
    swatch: ['#eef2ea', '#f8faf5', '#5f7a5b'],
    headingFont: 'var(--font-cormorant)',
    bodyFont: 'var(--font-lato)',
  },
  mewah: {
    name: 'mewah',
    label: 'Mewah',
    description: 'Biru malam dan emas, kesan pesta malam yang megah',
    suits: ['pernikahan', 'ultah_dewasa', 'sweet_seventeen'],
    swatch: ['#121a2b', '#1b2540', '#d4af6a'],
    headingFont: 'var(--font-playfair)',
    bodyFont: 'var(--font-lato)',
  },
  ceria: {
    name: 'ceria',
    label: 'Ceria',
    description: 'Kuning, biru, dan merah muda yang riang untuk anak-anak',
    suits: ['ultah_anak'],
    swatch: ['#fff8e1', '#ffffff', '#ff6b6b'],
    headingFont: 'var(--font-fredoka)',
    bodyFont: 'var(--font-quicksand)',
  },
  pastel: {
    name: 'pastel',
    label: 'Pastel',
    description: 'Merah muda dan lavender lembut, manis untuk remaja',
    suits: ['sweet_seventeen', 'ultah_anak'],
    swatch: ['#fdf2f8', '#fffafd', '#c0679a'],
    headingFont: 'var(--font-quicksand)',
    bodyFont: 'var(--font-quicksand)',
  },
}

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[]
