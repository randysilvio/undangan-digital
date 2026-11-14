import type { Metadata, Viewport } from 'next'
import { fontVariables } from './fonts'
import { BRAND, BRAND_DESCRIPTION, BRAND_TAGLINE } from '@/lib/brand'
import { SITE_URL } from '@/lib/supabase/env'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND} · Undangan Digital Pernikahan & Ulang Tahun`, template: `%s · ${BRAND}` },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND,
  keywords: ['undangan digital', 'undangan online', 'undangan pernikahan', 'undangan ulang tahun', 'undangan syukuran', 'undangan website', BRAND],
  openGraph: { type: 'website', siteName: BRAND, locale: 'id_ID', title: `${BRAND} · ${BRAND_TAGLINE}`, description: BRAND_DESCRIPTION },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${fontVariables} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
