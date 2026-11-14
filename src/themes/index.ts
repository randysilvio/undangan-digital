import type { InvitationKind, ThemeColorKey, ThemeName } from '@/lib/types'

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
  /** Warna lengkap (sama dengan globals.css), untuk mengisi awal tema kustom. */
  palette: Record<ThemeColorKey, string>
  /** Huruf bawaan per peran (id dari FONT_OPTIONS). */
  fonts: { heading: string; body: string; names: string }
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
    palette: { bg: '#f7f1e8', surface: '#fffaf3', text: '#3d3329', muted: '#7a6a58', accent: '#b08d57', on_accent: '#ffffff', line: '#e6d9c3' },
    fonts: { heading: 'cormorant', body: 'lato', names: 'great-vibes' },
  },
  modern: {
    name: 'modern',
    label: 'Modern',
    description: 'Putih bersih dan abu gelap, huruf sans-serif',
    suits: ['pernikahan', 'ultah_dewasa'],
    swatch: ['#ffffff', '#f3f4f6', '#1f2937'],
    headingFont: 'var(--font-montserrat)',
    bodyFont: 'var(--font-inter)',
    palette: { bg: '#ffffff', surface: '#f3f4f6', text: '#1f2937', muted: '#6b7280', accent: '#1f2937', on_accent: '#ffffff', line: '#e5e7eb' },
    fonts: { heading: 'montserrat', body: 'inter', names: 'montserrat' },
  },
  botani: {
    name: 'botani',
    label: 'Botani',
    description: 'Hijau sage dan krem, nuansa taman yang teduh',
    suits: ['pernikahan', 'ultah_syukur'],
    swatch: ['#eef2ea', '#f8faf5', '#5f7a5b'],
    headingFont: 'var(--font-cormorant)',
    bodyFont: 'var(--font-lato)',
    palette: { bg: '#eef2ea', surface: '#f8faf5', text: '#2f3b2d', muted: '#66735f', accent: '#5f7a5b', on_accent: '#ffffff', line: '#d5dfcf' },
    fonts: { heading: 'cormorant', body: 'lato', names: 'great-vibes' },
  },
  mewah: {
    name: 'mewah',
    label: 'Mewah',
    description: 'Biru malam dan emas, kesan pesta malam yang megah',
    suits: ['pernikahan', 'ultah_dewasa', 'sweet_seventeen'],
    swatch: ['#121a2b', '#1b2540', '#d4af6a'],
    headingFont: 'var(--font-playfair)',
    bodyFont: 'var(--font-lato)',
    palette: { bg: '#121a2b', surface: '#1b2540', text: '#f3ead8', muted: '#b9b09d', accent: '#d4af6a', on_accent: '#121a2b', line: '#33405f' },
    fonts: { heading: 'playfair', body: 'lato', names: 'great-vibes' },
  },
  ceria: {
    name: 'ceria',
    label: 'Ceria',
    description: 'Kuning, biru, dan merah muda yang riang untuk anak-anak',
    suits: ['ultah_anak'],
    swatch: ['#fff8e1', '#ffffff', '#ff6b6b'],
    headingFont: 'var(--font-fredoka)',
    bodyFont: 'var(--font-quicksand)',
    palette: { bg: '#fff8e1', surface: '#ffffff', text: '#2d3561', muted: '#6b7099', accent: '#ff6b6b', on_accent: '#ffffff', line: '#ffe08a' },
    fonts: { heading: 'fredoka', body: 'quicksand', names: 'fredoka' },
  },
  pastel: {
    name: 'pastel',
    label: 'Pastel',
    description: 'Merah muda dan lavender lembut, manis untuk remaja',
    suits: ['sweet_seventeen', 'ultah_anak'],
    swatch: ['#fdf2f8', '#fffafd', '#c0679a'],
    headingFont: 'var(--font-quicksand)',
    bodyFont: 'var(--font-quicksand)',
    palette: { bg: '#fdf2f8', surface: '#fffafd', text: '#4a3550', muted: '#8a7491', accent: '#c0679a', on_accent: '#ffffff', line: '#f1d5e6' },
    fonts: { heading: 'quicksand', body: 'quicksand', names: 'pacifico' },
  },
}

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[]
