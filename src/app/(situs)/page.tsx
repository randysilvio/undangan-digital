import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Icon, type IconName } from '@/components/icons'
import { RevealObserver } from '@/components/invitation/Motion'
import { Logo } from '@/components/site/Brand'
import { BRAND } from '@/lib/brand'
import { cssUrl, customThemeAttrs, customThemeStyle } from '@/lib/custom-theme'
import { getGalleryThemes, getSiteSettings, waLink } from '@/lib/data/site'
import { kindSlug } from '@/lib/demo'
import { KIND_IDS, KINDS } from '@/lib/kinds'
import type { CustomTheme, InvitationKind, ThemeName } from '@/lib/types'
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
  ['crown', 'Desain khusus', 'Warna, ornamen, bingkai, dan hiasan sesuai selera Anda.'],
]

const STEPS: [string, string][] = [
  ['Pilih contoh & tema', 'Buka contoh undangan di halaman ini dan pilih yang paling cocok.'],
  ['Kirim data acara', 'Nama, waktu, tempat, foto, cerita, dan daftar tamu lewat WhatsApp.'],
  ['Kami buatkan', 'Undangan disusun dan dikirim ke Anda untuk dicek sebelum terbit.'],
  ['Bagikan & pantau', 'Kirim link pribadi ke tiap tamu, lalu pantau RSVP dan ucapan.'],
]

const FAQ: [string, string][] = [
  ['Apakah tamu perlu memasang aplikasi?', 'Tidak. Undangan dibuka langsung di browser HP lewat link yang dikirim, tanpa aplikasi dan tanpa daftar akun.'],
  ['Apakah nama tamu bisa tampil di undangan?', 'Bisa. Setiap tamu mendapat link pribadi, sehingga sampul undangan menyapa tamu dengan namanya sendiri.'],
  ['Bagaimana tamu mengonfirmasi kehadiran?', 'Tamu mengisi formulir RSVP di undangan. Rekap hadir, tidak hadir, dan jumlah orang bisa Anda pantau lewat link pantau.'],
  ['Bisakah memakai desain sendiri?', 'Bisa. Selain tema siap pakai, kami bisa membuat tema khusus dengan warna, ornamen, bingkai, dan partikel sesuai keinginan Anda.'],
  ['Selain pernikahan, acara apa saja yang bisa?', 'Ulang tahun anak, sweet seventeen, ulang tahun dewasa, dan syukuran usia emas, masing-masing dengan teks dan tampilan yang sesuai.'],
  ['Apakah teks undangan bisa disesuaikan dengan agama?', 'Bisa. Tersedia template teks Islam, Kristen, Katolik, dan umum, dan semua teks tetap bisa diubah sesuai keinginan.'],
]

const HERO: { kind: InvitationKind; theme: ThemeName; name: string; rot: string; delay: string }[] = [
  { kind: 'ultah_anak', theme: 'ceria', name: 'Kayla', rot: '-8deg', delay: '0s' },
  { kind: 'pernikahan', theme: 'elegan', name: 'Budi & Ani', rot: '0deg', delay: '-2s' },
  { kind: 'ultah_syukur', theme: 'botani', name: 'Opa Slamet', rot: '8deg', delay: '-4s' },
]

const muted = 'text-[#6f625a]'
const accent = 'text-[#7a2e2a]'
const primaryBtn = 'inline-flex items-center gap-2 rounded-full bg-[#7a2e2a] px-6 py-3 text-sm font-medium text-[#f6efe4] shadow-sm transition hover:bg-[#62231f]'
const ghostBtn =
  'inline-flex items-center gap-2 rounded-full border border-[#2a211c]/20 px-6 py-3 text-sm font-medium transition hover:border-[#7a2e2a] hover:text-[#7a2e2a]'
const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/** Kartu undangan mini yang memakai tema sungguhan. */
function MiniCover({ kind, theme, name }: { kind: InvitationKind; theme: ThemeName; name: string }) {
  const k = KINDS[kind]
  return (
    <Link
      href={`/contoh/${kindSlug(kind)}/${theme}`}
      data-theme={theme}
      className="relative flex aspect-[9/15] flex-col items-center justify-center overflow-hidden rounded-[1.6rem] bg-[var(--inv-cover-bg,var(--inv-text))] p-4 text-center text-white shadow-xl ring-1 ring-black/5 transition hover:-translate-y-1"
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

/** Kartu tema di galeri; tema kustom memakai warna, huruf, ornamen, dan latar sampulnya sendiri. */
function ThemeTile({ href, theme, label, description, kindLabel, custom }: { href: string; theme: ThemeName; label: string; description: string; kindLabel: string; custom?: CustomTheme }) {
  const cover = custom ? cssUrl(custom.assets.cover_bg) : null
  return (
    <Link
      href={href}
      data-theme={theme}
      {...customThemeAttrs(custom)}
      style={customThemeStyle(custom)}
      className="group block overflow-hidden rounded-2xl bg-inv-bg text-inv-text ring-1 ring-white/10 transition hover:-translate-y-1"
    >
      <div className="relative flex aspect-[4/5] flex-col items-center justify-center overflow-hidden px-3 text-center">
        {cover && <span aria-hidden className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: cover }} />}
        <span className="relative font-heading text-[10px] tracking-[0.25em] text-inv-muted uppercase">{kindLabel}</span>
        <span className="relative mt-2 font-names text-2xl leading-tight text-inv-accent">{label}</span>
        <span aria-hidden className="inv-ornament relative mt-2 w-20 text-inv-accent" />
        <span className="relative mt-3 rounded-full bg-inv-accent px-3 py-1 text-[10px] font-medium text-inv-on-accent">Lihat contoh</span>
        {custom && <span className="absolute top-2 right-2 rounded-full bg-[#d9b779] px-2 py-0.5 text-[9px] font-semibold text-[#2a211c]">Baru</span>}
      </div>
      <p className="border-t border-inv-line bg-inv-surface px-3 py-2 font-body text-xs text-inv-muted">{description}</p>
    </Link>
  )
}

export default async function Home() {
  const [settings, gallery] = await Promise.all([getSiteSettings(), getGalleryThemes()])
  const wa = settings.whatsapp ? waLink(settings.whatsapp, `Halo ${BRAND}, saya ingin konsultasi undangan digital.`) : null
  const packages = settings.packages

  return (
    <main data-reveal-root className="min-h-dvh overflow-x-clip bg-[#f6f1ea] text-[#2a211c]">
      <RevealObserver />

      <header className="sticky top-0 z-40 border-b border-[#2a211c]/5 bg-[#f6f1ea]/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Logo />
          <nav className={`flex items-center gap-4 text-sm sm:gap-6 ${muted}`}>
            <a href="#jenis" className="hidden hover:text-[#7a2e2a] sm:inline">
              Contoh
            </a>
            <a href="#tema" className="hidden hover:text-[#7a2e2a] sm:inline">
              Tema
            </a>
            {packages.length > 0 && (
              <a href="#harga" className="hidden hover:text-[#7a2e2a] sm:inline">
                Harga
              </a>
            )}
            <a href="#tanya" className="hidden hover:text-[#7a2e2a] sm:inline">
              Tanya Jawab
            </a>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener" className="rounded-full bg-[#7a2e2a] px-4 py-2 font-medium text-[#f6efe4] hover:bg-[#62231f]">
                Pesan
              </a>
            ) : (
              <a href="#jenis" className="rounded-full bg-[#7a2e2a] px-4 py-2 font-medium text-[#f6efe4] hover:bg-[#62231f] sm:hidden">
                Contoh
              </a>
            )}
          </nav>
        </div>
      </header>

      <section className="px-4 pt-12 pb-16 sm:pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="text-center lg:text-left">
            <p className={`inv-rise text-xs font-semibold tracking-[0.3em] uppercase ${accent}`} style={{ '--i': 0 } as CSSProperties}>
              Jasa undangan digital
            </p>
            <h1 className="inv-rise mt-4 font-display text-5xl leading-[1.05] font-medium sm:text-6xl" style={{ '--i': 1 } as CSSProperties}>
              Undangan yang menyapa
              <span className={`block italic ${accent}`}>setiap tamu dengan namanya.</span>
            </h1>
            <p className={`inv-rise mx-auto mt-5 max-w-xl text-lg lg:mx-0 ${muted}`} style={{ '--i': 2 } as CSSProperties}>
              {BRAND} membuatkan undangan digital untuk pernikahan, ulang tahun, dan syukuran. Satu link untuk tiap tamu, lengkap dengan RSVP, ucapan,
              cerita perjalanan, peta, dan amplop digital.
            </p>
            <div className="inv-rise mt-8 flex flex-wrap justify-center gap-3 lg:justify-start" style={{ '--i': 3 } as CSSProperties}>
              {wa && (
                <a href={wa} target="_blank" rel="noopener" className={primaryBtn}>
                  <Icon name="chat" className="size-4" /> Konsultasi via WhatsApp
                </a>
              )}
              <a href="#jenis" className={wa ? ghostBtn : primaryBtn}>
                Lihat contoh undangan
              </a>
            </div>
            <ul className={`inv-rise mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm lg:justify-start ${muted}`} style={{ '--i': 4 } as CSSProperties}>
              {['Tanpa aplikasi', 'Link pribadi per tamu', `${THEME_NAMES.length + gallery.length} pilihan tema`, 'Animasi per tema'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Icon name="check" className={`size-4 ${accent}`} /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto flex w-full max-w-md items-end justify-center">
            {HERO.map((h, i) => (
              <div
                key={h.kind}
                className={`inv-float shrink-0 ${i === 1 ? 'z-10 -mx-3 w-[38%]' : 'mt-10 w-1/3 opacity-95'}`}
                style={{ '--rot': h.rot, '--delay': h.delay } as CSSProperties}
              >
                <MiniCover kind={h.kind} theme={h.theme} name={h.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="jenis" className="scroll-mt-16 border-t border-[#2a211c]/10 px-4 py-16">
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

      <section id="tema" className="scroll-mt-16 bg-[#2a211c] px-4 py-16 text-[#f6efe4]">
        <div className="mx-auto max-w-6xl">
          <div data-reveal="up" className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#d9b779] uppercase">Tema</p>
            <h2 className="mt-2 font-display text-4xl font-medium">Pilih suasananya, atau minta desain sendiri.</h2>
            <p className="mt-2 text-[#cfc3b8]">Setiap tema punya huruf, ornamen, dan animasinya sendiri, dan bisa dipakai untuk jenis undangan apa pun.</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {gallery.map((t, i) => (
              <li key={t.id} data-reveal="zoom" style={d(i * 70)}>
                <ThemeTile
                  href={`/contoh/${kindSlug(THEMES[t.base_theme].suits[0])}/${t.slug}`}
                  theme={t.base_theme}
                  label={t.name}
                  description={t.description || `Tema khusus berdasar ${THEMES[t.base_theme].label}`}
                  kindLabel="Tema khusus"
                  custom={t}
                />
              </li>
            ))}
            {THEME_NAMES.map((t, i) => {
              const th = THEMES[t]
              return (
                <li key={t} data-reveal="zoom" style={d((gallery.length + i) * 70)}>
                  <ThemeTile href={`/contoh/${kindSlug(th.suits[0])}/${t}`} theme={t} label={th.label} description={th.description} kindLabel={KINDS[th.suits[0]].coverLabel} />
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-16 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[18rem_1fr]">
          <div data-reveal="up" className="lg:sticky lg:top-24 lg:self-start">
            <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${accent}`}>Isi undangan</p>
            <h2 className="mt-2 font-display text-4xl font-medium">Semua yang tamu perlukan, di satu link.</h2>
          </div>
          <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {FEATURES.map(([icon, title, text], i) => (
              <li key={title} data-reveal="up" style={d((i % 2) * 90)} className="flex gap-4">
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
            Cara pesan
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} data-reveal="up" style={d(i * 100)} className="relative border-t-2 border-[#7a2e2a] pt-4">
                <span className={`font-display text-5xl leading-none ${accent}`}>{i + 1}</span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className={`mt-1 text-sm ${muted}`}>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {packages.length > 0 && (
        <section id="harga" className="scroll-mt-16 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div data-reveal="up" className="max-w-2xl">
              <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${accent}`}>Harga</p>
              <h2 className="mt-2 font-display text-4xl font-medium">Pilih paket yang pas.</h2>
            </div>
            <ul className={`mt-10 grid gap-5 sm:grid-cols-2 ${packages.length >= 3 ? 'lg:grid-cols-3' : ''} ${packages.length === 4 ? 'xl:grid-cols-4' : ''}`}>
              {packages.map((p, i) => (
                <li
                  key={p.name}
                  data-reveal="up"
                  style={d(i * 90)}
                  className={`relative flex flex-col rounded-2xl p-6 ${p.highlight ? 'bg-[#2a211c] text-[#f6efe4] shadow-xl' : 'border border-[#2a211c]/10 bg-white'}`}
                >
                  {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-[#d9b779] px-3 py-1 text-xs font-semibold text-[#2a211c]">Paling diminati</span>}
                  <h3 className="font-display text-2xl">{p.name}</h3>
                  <p className={`mt-2 text-3xl font-semibold ${p.highlight ? 'text-[#d9b779]' : accent}`}>{p.price}</p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <Icon name="check" className={`mt-0.5 size-4 shrink-0 ${p.highlight ? 'text-[#d9b779]' : accent}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {settings.whatsapp && (
                    <a
                      href={waLink(settings.whatsapp, `Halo ${BRAND}, saya tertarik paket ${p.name}.`)}
                      target="_blank"
                      rel="noopener"
                      className={`mt-6 rounded-full px-4 py-2.5 text-center text-sm font-medium transition ${
                        p.highlight ? 'bg-[#f6efe4] text-[#2a211c] hover:bg-white' : 'bg-[#7a2e2a] text-[#f6efe4] hover:bg-[#62231f]'
                      }`}
                    >
                      Pesan paket ini
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="tanya" className="scroll-mt-16 border-t border-[#2a211c]/10 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[18rem_1fr]">
          <div data-reveal="up">
            <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${accent}`}>Tanya jawab</p>
            <h2 className="mt-2 font-display text-4xl font-medium">Yang sering ditanyakan.</h2>
          </div>
          <div className="divide-y divide-[#2a211c]/10 border-y border-[#2a211c]/10">
            {FAQ.map(([q, a]) => (
              <details key={q} data-reveal="up" className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q}
                  <span aria-hidden className={`text-2xl leading-none transition group-open:rotate-45 ${accent}`}>
                    +
                  </span>
                </summary>
                <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div data-reveal="zoom" className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#7a2e2a] px-6 py-12 text-center text-[#f6efe4] sm:px-12">
          <h2 className="font-display text-4xl font-medium">Siap membuat undangan Anda?</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#f0d9d2]">Ceritakan acara Anda, dan kami bantu memilih tema yang paling pas.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {wa && (
              <a href={wa} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#f6efe4] px-6 py-3 text-sm font-semibold text-[#7a2e2a] hover:bg-white">
                <Icon name="chat" className="size-4" /> Chat WhatsApp
              </a>
            )}
            <a href="#jenis" className="rounded-full border border-[#f6efe4]/40 px-6 py-3 text-sm font-medium hover:bg-[#f6efe4]/10">
              Lihat contoh dulu
            </a>
          </div>
        </div>
      </section>

      <footer className={`border-t border-[#2a211c]/10 px-4 py-10 text-sm ${muted}`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo className="text-[#2a211c]" />
            <p className="mt-2 max-w-xs">Undangan digital pernikahan, ulang tahun, dan syukuran.</p>
          </div>
          <ul className="space-y-1.5">
            {settings.whatsapp && (
              <li>
                <a href={wa ?? '#'} target="_blank" rel="noopener" className="hover:text-[#7a2e2a]">
                  WhatsApp +{settings.whatsapp}
                </a>
              </li>
            )}
            {settings.instagram && (
              <li>
                <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener" className="hover:text-[#7a2e2a]">
                  Instagram @{settings.instagram}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-[#7a2e2a]">
                  {settings.email}
                </a>
              </li>
            )}
            <li>
              <a href="#jenis" className="hover:text-[#7a2e2a]">
                Contoh undangan
              </a>
            </li>
          </ul>
        </div>
      </footer>

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener"
          aria-label="Chat WhatsApp"
          className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#7a2e2a] text-[#f6efe4] shadow-lg ring-4 ring-[#7a2e2a]/15 transition hover:scale-105"
        >
          <Icon name="chat" className="size-6" />
        </a>
      )}
    </main>
  )
}
