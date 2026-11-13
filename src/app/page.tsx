import Link from 'next/link'
import { kindSlug } from '@/lib/demo'
import { KIND_IDS, KINDS } from '@/lib/kinds'
import { THEME_NAMES, THEMES } from '@/themes'

const FEATURES: [string, string, string][] = [
  ['💌', 'Link pribadi per tamu', 'Setiap tamu disapa dengan namanya sendiri di sampul undangan.'],
  ['📲', 'Kirim lewat WhatsApp', 'Pesan undangan siap kirim, lengkap dengan link pribadi tiap tamu.'],
  ['✅', 'Konfirmasi kehadiran', 'Tamu mengisi RSVP; rekap hadir, tidak hadir, dan jumlah orang langsung terhitung.'],
  ['💬', 'Ucapan & doa', 'Tamu menulis ucapan yang tampil di undangan, bisa disembunyikan bila perlu.'],
  ['⏳', 'Hitung mundur & kalender', 'Hitung mundur ke hari acara dan tombol simpan ke Google Calendar.'],
  ['📍', 'Peta lokasi', 'Satu ketukan menuju Google Maps untuk setiap acara.'],
  ['🎁', 'Amplop digital', 'Nomor rekening atau dompet digital yang bisa disalin dengan sekali tekan.'],
  ['🖼️', 'Galeri & musik', 'Foto-foto terbaik dan lagu latar yang diputar saat undangan dibuka.'],
  ['📊', 'Link pantau', 'Tuan rumah memantau rekap kehadiran sendiri tanpa perlu login.'],
]

const STEPS: [string, string][] = [
  ['Pilih jenis & tema', 'Pernikahan atau ulang tahun, dengan enam pilihan tema warna.'],
  ['Isi data acara', 'Nama, waktu, tempat, foto, dan teks undangan sesuai agama atau suasana.'],
  ['Kirim ke tamu', 'Tempel daftar tamu, lalu kirim link pribadi lewat WhatsApp.'],
  ['Pantau kehadiran', 'Lihat siapa yang hadir dan baca ucapan yang masuk.'],
]

export default function Home() {
  return (
    <main className="min-h-dvh bg-stone-50 text-stone-900">
      <section className="bg-gradient-to-b from-amber-50 to-stone-50 px-4 pt-16 pb-12 text-center">
        <div className="mx-auto max-w-2xl">
          <p aria-hidden className="text-4xl">
            💍 🎂 🎈
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Undangan Digital</h1>
          <p className="mt-3 text-lg text-stone-600">
            Undangan online yang elegan dan mudah dibagikan untuk pernikahan, ulang tahun anak, sweet seventeen, ulang tahun dewasa, hingga
            syukuran usia emas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#jenis" className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700">
              Lihat Contoh Undangan
            </a>
            <a href="#fitur" className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-stone-100">
              Fitur Lengkap
            </a>
          </div>
        </div>
      </section>

      <section id="jenis" className="scroll-mt-4 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold">Jenis Undangan</h2>
          <p className="mt-2 text-center text-stone-600">Ketuk salah satu untuk membuka contohnya.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KIND_IDS.map((k) => {
              const kind = KINDS[k]
              const suited = THEME_NAMES.filter((t) => THEMES[t].suits.includes(k))
              return (
                <li key={k} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p aria-hidden className="text-3xl">
                    {kind.coverEmoji || '💍'}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{kind.label}</h3>
                  <p className="mt-1 flex-1 text-sm text-stone-600">{kind.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suited.map((t) => (
                      <Link
                        key={t}
                        href={`/contoh/${kindSlug(k)}/${t}`}
                        className="flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-sm hover:border-amber-600 hover:bg-amber-50"
                      >
                        <span aria-hidden className="size-3 rounded-full border border-stone-300" style={{ background: THEMES[t].swatch[2] }} />
                        Contoh {THEMES[t].label}
                      </Link>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold">Pilihan Tema</h2>
          <p className="mt-2 text-center text-stone-600">Setiap tema bisa dipakai untuk jenis undangan apa pun.</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEME_NAMES.map((t) => {
              const th = THEMES[t]
              return (
                <li key={t}>
                  <Link href={`/contoh/${kindSlug(th.suits[0])}/${t}`} className="block overflow-hidden rounded-2xl border border-stone-200 hover:shadow-md">
                    <div aria-hidden className="flex h-20" style={{ background: th.swatch[0] }}>
                      <span className="m-auto flex gap-1.5">
                        {th.swatch.map((c) => (
                          <span key={c} className="size-6 rounded-full border border-black/10" style={{ background: c }} />
                        ))}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-medium">{th.label}</p>
                      <p className="text-xs text-stone-500">{th.description}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-4 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold">Fitur Lengkap</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([icon, title, text]) => (
              <li key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
                <p aria-hidden className="text-2xl">
                  {icon}
                </p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-stone-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold">Cara Kerja</h2>
          <ol className="mt-8 space-y-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-600 font-semibold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-stone-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-sm text-stone-500">Undangan Digital · Pernikahan & Ulang Tahun</footer>
    </main>
  )
}
