import { Cormorant_Garamond, Great_Vibes, Inter, Lato, Montserrat } from 'next/font/google'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant' })
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' })
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-great-vibes' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-montserrat' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

/** Semua variabel font; file font hanya diunduh browser bila benar-benar dipakai tema. */
export const fontVariables = [cormorant, lato, greatVibes, montserrat, inter].map((f) => f.variable).join(' ')
