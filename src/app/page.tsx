import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Icon, type IconName } from '@/components/icons'
import { RevealObserver } from '@/components/invitation/Motion'
import { kindSlug } from '@/lib/demo'
import { KIND_IDS, KINDS } from '@/lib/kinds'
import type { InvitationKind, ThemeName } from '@/lib/types'
import { THEME_NAMES, THEMES } from '@/themes'

const FEATURES: [IconName, string, string][] = [
  ['envelope', 'Link pribadi per tamu', 'Setiap tamu disapa dengan namanya sendiri di sampul undangan.'],
  ['chat', 'Kirim lewat WhatsApp', 'Pesan undangan siap kirim, lengkap dengan link pribadi tiap tamu.'],
  ['check', 'Konfirmasi kehadiran', 'Rekap hadir, tidak hadir, dan jumlah orang langsung terhitung.'],
  ['pen', 'Ucapan & doa', 'Ucapan tamu tampil di undangan dan bisa disembunyikan bila perlu.'],
  ['calendar', 'Cerita & perjalanan hidup', 'Garis waktu kisah pasangan, tumbuh kembang anak, atau perjalanan usia emas.'],
  ['family', 'Keluarga & dress code', 'Daftar keluarga yang turut mengundang dan aturan busana acara.'],
  ['hourglass', 'Hitung mundur & kalender', 'Hitung mundur ke hari acara dan tombol simpan ke Google Calendar.'],
  ['pin', 'Peta lokasi', 'Satu ketukan menuju Google Maps untuk setiap acara.'],
  ['gift', 'Amplop digital', 'Nomor rekening atau dompet digital yang bisa disalin sekali tekan.'],
  ['photo', 'Galeri & musik', 'Foto terbaik dan lagu latar yang diputar saat undangan dibuka.'],
  ['chart', 'Link pantau', 'Tuan rumah memantau rekap kehadiran sendiri tanpa perlu login.'],
  ['music', 'Animasi per tema', 'Kelopak, daun, balon, atau serbuk emas yang bergerak sesuai tema.'],
]

const STEPS: [string, string][] = [
  ['Pilih jenis & tema', 'Pernikahan atau ulang tahun, dengan enam tema warna.'],
  ['Isi data acara', 'Nama, waktu, tempat, foto, cerita, dan teks sesuai agama.'],
  ['Kirim ke tamu', 'Tempel daftar tamu, lalu kirim link pribadi lewat WhatsApp.'],
  ['Pantau kehadiran', 'Lihat siapa yang hadir dan baca ucapan yang masuk.'],
]

const HERO: { kind: InvitationKind; theme: ThemeName; name: string; rot: string; delay: string }[] = [
  { kind: 'ultah_anak', theme: 'ceria', name: 'Kayla', rot: '-8deg', delay: '0s' },
  { kind: 'pernikahan', theme: 'elegan', name: 'Budi & Ani', rot: '0deg', delay: '-2s' },
  { kind: 'ultah_syukur', theme: 'botani', name: 'Opa Slamet', rot: '8deg', delay: '-4s' },
]

const ink = 'text-[#2a211c]'
const muted = 'text-[#6f625a]'
const accent = 'text-[#7a2e2a]'

/** Kartu undangan mini yang memakai tema sungguhan. */
function MiniCover({ kind, theme, name, className = '', style }: { kind: InvitationKind; theme: ThemeName; name: string; className?: string; style?: CSSProperties }) {
  const k = KINDS[kind]
  return (
    <Link
      href={`/contoh/${kindSlug(kind)}/${theme}`}
      data-theme={theme}
      style={style}
      className={`relative flex aspect-[9/15] flex-col items-center justify-center overflow-hidden rounded-[1.6rem] bg-[var(--inv-cover-bg,var(--inv-text))] p-4 text-center text-white shadow-xl ring-1 ring-black/5 transition hover:-translate-y-1 ${className}`}
    >
      <span aria-hidden className="absolute inset-0" style={{ background: 'var(--inv-cover-overlay)' }} />
      <span aria-hidden className="absolute inset-2 rounded-[1.3rem] border border-white/30" />
      <span className="relative flex size-10 items-center justify-center rounded-full border border-white/50">
        <Icon name={k.motif} className="size-5" />
      </span>
      <span className="relative mt-3 text-[9px] tracking-[0.25em] uppercase opacity-90">{k.coverLabel}</span>
      <span className="relative mt-2 font-names text-3xl leading-tight">{name}</span>
      <span className="relative mt-2 font-heading text-sm opacity-90">14 Agustus 2027</span>
      <span className="relative mt-4 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-stone-800">Buka Undangan</span>
    </Link>
  )
}

export default function Home() {
  return (
    <main data-reveal-root className={`min-h-dvh overflow-x-clip bg-[#f6f1ea] ${ink}`}>
      <RevealObserver />

      <header className="px-4 pt-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#7a2e2a] text-[#f6efe4]">
              <Icon name="envelope" className="size-4" />
            </span>
            Undangan Digital
          </Link>
          <nav className={`flex gap-5 text-sm ${muted}`}>
            <a href="#jenis" className="hover:text-[#7a2e2a]">
              Contoh
            </a>
            <a href="#fitur" className="hover:text-[#7a2e2a]">
              Fitur
            </a>
          </nav>
        </div>
      </header>

      <section className="px-4 pt-12 pb-16 sm:pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="text-center lg:text-left">
            <p className={`inv-rise text-xs font-semibold tracking-[0.3em] uppercase ${accent}`} style={{ '--i': 0 } as CSSProperties}>
              Pernikahan · Ulang tahun · Syukuran
            </p>
            <h1
              className="inv-rise mt-4 font-display text-5xl leading-[1.05] font-medium sm:text-6xl"
              style={{ '--i': 1 } as CSSProperties}
            >
              Undangan yang menyapa
              <span className={`block italic ${accent}`}>setiap tamu dengan namanya.</span>
            </h1>
            <p className={`inv-rise mx-auto mt-5 max-w-xl text-lg lg:mx-0 ${muted}`} style={{ '--i': 2 } as CSSProperties}>
              Satu link untuk tiap tamu, lengkap dengan RSVP, ucapan, cerita perjalanan, peta, dan amplop digital. Dari pernikahan sampai syukuran
              70 tahun Opa.
            </p>
            <div className="inv-rise mt-8 flex flex-wrap justify-center gap-3 lg:justify-start" style={{ '--i': 3 } as CSSProperties}>
              <a href="#jenis" className="rounded-full bg-[#7a2e2a] px-6 py-3 text-sm font-medium text-[#f6efe4] shadow-sm transition hover:bg-[#62231f]">
                Lihat contoh undangan
              </a>
              <a href="#fitur" className="rounded-full border border-[#2a211c]/20 px-6 py-3 text-sm font-medium transition hover:border-[#7a2e2a] hover:text-[#7a2e2a]">
                Apa saja isinya?
              </a>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-md items-end justify-center">
            {HERO.map((h, i) => (
              <div
                key={h.kind}
                className={`inv-float w-1/3 shrink-0 ${i === 1 ? 'z-10 -mx-3 w-[38%]' : 'mt-10 opacity-95'}`}
                style={{ '--rot': h.rot, '--delay': h.delay } as CSSProperties}
              >
                <MiniCover kind={h.kind} theme={h.theme} name={h.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="jenis" className="scroll-mt-4 border-t border-[#2a211c]/10 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div data-reveal="up" className="max-w-2xl">
            <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${accent}`}>Jenis undangan</p>
            <h2 className="mt-2 font-display text-4xl font-medium">Lima acara, satu cara kirim.</h2>
            <p className={`mt-2 ${muted}`}>Ketuk nama tema untuk membuka contoh lengkapnya.</p>
          </div>
          <ol className="mt-10 divide-y divide-[#2a211c]/10 border-y border-[#2a211c]/10">
            {KIND_IDS.map((k, i) => {
              const kind = KINDS[k]
              const suited = THEME_NAMES.filter((t) => THEMES[t].suits.includes(k))
              return (
                <li key={k} data-reveal="up" className="grid gap-4 py-6 sm:grid-cols-[4rem_1fr_auto] sm:items-center">
                  <span className={`font-display text-3xl ${accent}`}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Icon name={kind.motif} className={`size-5 ${accent}`} />
                      {kind.label}
                    </h3>
                    <p className={`mt-1 text-sm ${muted}`}>{kind.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suited.map((t) => (
                      <Link
                        key={t}
                        href={`/contoh/${kindSlug(k)}/${t}`}
                        className="flex items-center gap-1.5 rounded-full border border-[#2a211c]/15 bg-white/60 px-3 py-1.5 text-sm transition hover:border-[#7a2e2a] hover:bg-white"
                      >
                        <span aria-hidden className="size-3 rounded-full border border-black/10" style={{ background: THEMES[t].swatch[2] }} />
                        {THEMES[t].label}
                      </Link>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="bg-[#2a211c] px-4 py-16 text-[#f6efe4]">
        <div className="mx-auto max-w-6xl">
          <div data-reveal="up" className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#d9b779] uppercase">Tema</p>
            <h2 className="mt-2 font-display text-4xl font-medium">Enam suasana, bebas dipadukan.</h2>
            <p className="mt-2 text-[#cfc3b8]">Setiap tema punya huruf, ornamen, dan animasinya sendiri, dan bisa dipakai untuk jenis undangan apa pun.</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {THEME_NAMES.map((t, i) => {
              const th = THEMES[t]
              return (
                <li key={t} data-reveal="zoom" style={{ '--d': `${i * 70}ms` } as CSSProperties}>
                  <Link
                    href={`/contoh/${kindSlug(th.suits[0])}/${t}`}
                    data-theme={t}
                    className="group block overflow-hidden rounded-2xl bg-inv-bg text-inv-text ring-1 ring-white/10 transition hover:-translate-y-1"
                  >
                    <div className="flex aspect-[4/5] flex-col items-center justify-center px-3 text-center">
                      <span className="font-heading text-[10px] tracking-[0.25em] text-inv-muted uppercase">{KINDS[th.suits[0]].coverLabel}</span>
                      <span className="mt-2 font-names text-2xl leading-tight text-inv-accent">{th.label}</span>
                      <span aria-hidden className="inv-ornament mt-2 w-20 text-inv-accent" />
                      <span className="mt-3 rounded-full bg-inv-accent px-3 py-1 text-[10px] font-medium text-inv-on-accent">Buka</span>
                    </div>
                    <p className="border-t border-inv-line bg-inv-surface px-3 py-2 font-body text-xs text-inv-muted">{th.description}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-4 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[18rem_1fr]">
          <div data-reveal="up" className="lg:sticky lg:top-8 lg:self-start">
            <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${accent}`}>Isi undangan</p>
            <h2 className="mt-2 font-display text-4xl font-medium">Semua yang tamu perlukan, di satu link.</h2>
          </div>
          <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {FEATURES.map(([icon, title, text], i) => (
              <li key={title} data-reveal="up" style={{ '--d': `${(i % 2) * 90}ms` } as CSSProperties} className="flex gap-4">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-[#7a2e2a]/25 bg-white ${accent}`}>
                  <Icon name={icon} className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className={`mt-0.5 text-sm ${muted}`}>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[#2a211c]/10 bg-[#efe6da] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 data-reveal="up" className="font-display text-4xl font-medium">
            Cara kerja
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} data-reveal="up" style={{ '--d': `${i * 100}ms` } as CSSProperties} className="relative border-t-2 border-[#7a2e2a] pt-4">
                <span className={`font-display text-5xl leading-none ${accent}`}>{i + 1}</span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className={`mt-1 text-sm ${muted}`}>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className={`px-4 py-10 text-center text-sm ${muted}`}>
        <p className="font-display text-lg text-[#2a211c]">Undangan Digital</p>
        <p className="mt-1">Pernikahan, ulang tahun, dan syukuran.</p>
      </footer>
    </main>
  )
}
