import type { Metadata, Viewport } from 'next'
import { fontVariables } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Undangan Digital',
  description: 'Undangan pernikahan digital',
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
