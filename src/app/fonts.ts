import { Cormorant_Garamond, Fredoka, Great_Vibes, Inter, Lato, Montserrat, Pacifico, Playfair_Display, Quicksand } from 'next/font/google'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant' })
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' })
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-great-vibes' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-montserrat' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-playfair' })
const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-fredoka' })
const quicksand = Quicksand({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-quicksand' })
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', variable: '--font-pacifico' })

/** Semua variabel font; file font hanya diunduh browser bila benar-benar dipakai tema. */
export const fontVariables = [cormorant, lato, greatVibes, montserrat, inter, playfair, fredoka, quicksand, pacifico]
  .map((f) => f.variable)
  .join(' ')
