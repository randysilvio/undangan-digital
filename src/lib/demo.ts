import { KIND_IDS, KINDS } from './kinds'
import { defaultTemplate, templateTexts } from './text-templates'
import type { InvitationEvent, InvitationFull, InvitationKind, StoryItem, ThemeName, Wish } from './types'

/** Jenis undangan di URL contoh memakai tanda hubung: /contoh/ultah-anak/ceria. */
export const kindSlug = (k: InvitationKind) => k.replace(/_/g, '-')
export const kindFromSlug = (s: string): InvitationKind | null => KIND_IDS.find((k) => kindSlug(k) === s) ?? null

type Person = Pick<InvitationFull, 'groom_name' | 'groom_nickname' | 'groom_parents' | 'bride_name' | 'bride_nickname' | 'bride_parents' | 'age'>

const PEOPLE: Record<InvitationKind, Person> = {
  pernikahan: {
    groom_name: 'Budi Santoso, S.T.',
    groom_nickname: 'Budi',
    groom_parents: 'Putra dari Bapak Slamet & Ibu Sumiati',
    bride_name: 'Ani Lestari, S.Pd.',
    bride_nickname: 'Ani',
    bride_parents: 'Putri dari Bapak Joko & Ibu Rini',
    age: null,
  },
  ultah_anak: { ...solo('Kayla Putri Santoso', 'Kayla', 'Putri dari Bapak Budi & Ibu Ani'), age: 5 },
  sweet_seventeen: { ...solo('Nadia Aurelia', 'Nadia', 'Putri dari Bapak Hendra & Ibu Maria'), age: 17 },
  ultah_dewasa: { ...solo('Andreas Wijaya', 'Andreas', null), age: 30 },
  ultah_syukur: { ...solo('Bapak Slamet Riyadi', 'Opa Slamet', 'Bersama anak, menantu, dan cucu'), age: 70 },
}

function solo(name: string, nickname: string, parents: string | null) {
  return { groom_name: name, groom_nickname: nickname, groom_parents: parents, bride_name: null, bride_nickname: null, bride_parents: null }
}

const VENUES: Record<InvitationKind, { venue: string; address: string; times: [string, string | null][] }> = {
  pernikahan: { venue: 'Gedung Serbaguna Melati', address: 'Jl. Merdeka No. 1, Jakarta', times: [['08:00', '10:00'], ['11:00', '14:00']] },
  ultah_anak: { venue: 'Taman Bermain Pelangi', address: 'Jl. Kenanga No. 7, Bandung', times: [['15:00', '17:30']] },
  sweet_seventeen: { venue: 'Ballroom Hotel Bintang', address: 'Jl. Sudirman No. 21, Surabaya', times: [['19:00', '22:00']] },
  ultah_dewasa: { venue: 'Restoran Teras Senja', address: 'Jl. Pantai Indah No. 3, Makassar', times: [['18:30', null]] },
  ultah_syukur: { venue: 'Kediaman Keluarga Riyadi', address: 'Jl. Cendana No. 12, Yogyakarta', times: [['10:00', '11:30'], ['11:30', '14:00']] },
}

const EXTRAS: Record<InvitationKind, { story: StoryItem[]; family: string | null; dress_code: string | null }> = {
  pernikahan: {
    story: [
      { year: '2019', title: 'Pertama bertemu', text: 'Berawal dari satu kelompok KKN di sebuah desa di Garut.' },
      { year: '2022', title: 'Lamaran', text: 'Disaksikan kedua keluarga besar, Budi melamar Ani.' },
      { year: '2027', title: 'Hari bahagia', text: 'Kami memutuskan melangkah bersama dalam ikatan pernikahan.' },
    ],
    family: 'Keluarga Besar Bapak Slamet\nKeluarga Besar Bapak Joko',
    dress_code: null,
  },
  ultah_anak: {
    story: [
      { year: '2022', title: 'Hari pertama Kayla', text: 'Lahir dengan berat 3,2 kg di Bandung.' },
      { year: '2023', title: 'Langkah pertama', text: 'Mulai berjalan di usia 11 bulan.' },
      { year: '2026', title: 'Masuk TK', text: 'Kini sudah pandai bernyanyi dan menggambar.' },
    ],
    family: null,
    dress_code: 'Kostum superhero atau putri',
  },
  sweet_seventeen: {
    story: [
      { year: '2010', title: 'Lahir di Surabaya', text: '' },
      { year: '2022', title: 'Juara lomba piano', text: 'Tingkat provinsi Jawa Timur.' },
    ],
    family: null,
    dress_code: 'Nuansa merah muda dan putih',
  },
  ultah_dewasa: { story: [], family: null, dress_code: 'Semi formal, nuansa hitam & emas' },
  ultah_syukur: {
    story: [
      { year: '1957', title: 'Lahir di Klaten', text: 'Anak ketiga dari tujuh bersaudara.' },
      { year: '1983', title: 'Menikah dengan Oma Sri', text: 'Membangun keluarga dengan penuh kasih.' },
      { year: '2015', title: 'Purnabakti', text: '32 tahun mengabdi sebagai guru.' },
      { year: '2027', title: '70 tahun penuh syukur', text: 'Dikelilingi 3 anak, 3 menantu, dan 7 cucu.' },
    ],
    family: 'Ir. Budi Riyadi & Ani\ndr. Sari Riyadi & Hendra\nDewi Riyadi, S.E. & Agus\nCucu: Kayla, Bima, Naura, Raka, Dinda, Tio, Ayu',
    dress_code: 'Batik',
  },
}

const DATE = '2027-08-14'

function demoEvents(kind: InvitationKind, id: string): InvitationEvent[] {
  const v = VENUES[kind]
  return KINDS[kind].eventNames.map((name, i) => ({
    id: `${id}-ev-${i}`,
    invitation_id: id,
    name,
    date: DATE,
    start_time: v.times[i]?.[0] ?? '10:00',
    end_time: v.times[i]?.[1] ?? null,
    venue_name: v.venue,
    address: v.address,
    maps_url: null,
    sort_order: i,
  }))
}

/** Undangan contoh (data fiktif, tanpa database) untuk halaman depan. */
export function demoInvitation(kind: InvitationKind, theme: ThemeName): InvitationFull {
  const id = `contoh-${kindSlug(kind)}`
  const t = templateTexts(defaultTemplate(kind))
  return {
    id,
    slug: id,
    status: 'published',
    kind,
    theme,
    timezone: 'Asia/Jakarta',
    ...PEOPLE[kind],
    groom_photo_url: null,
    bride_photo_url: null,
    cover_photo_url: null,
    opening_text: t.opening || null,
    intro_text: t.intro,
    closing_text: t.closing,
    wa_message: t.wa,
    music_url: null,
    ...EXTRAS[kind],
    created_at: '2027-01-01T00:00:00Z',
    events: demoEvents(kind, id),
    gallery: [],
    gifts: [{ id: `${id}-gift`, invitation_id: id, provider: 'BCA', account_number: '1234567890', account_holder: PEOPLE[kind].groom_name, sort_order: 0 }],
  }
}

export function demoWishes(kind: InvitationKind): Wish[] {
  const id = `contoh-${kindSlug(kind)}`
  const messages = isBirthday(kind)
    ? ['Selamat ulang tahun! Semoga sehat selalu dan makin bahagia.', 'Panjang umur dan sukses terus ya!']
    : ['Selamat menempuh hidup baru, semoga menjadi keluarga yang bahagia.', 'Barakallah, semoga langgeng sampai kakek-nenek!']
  return messages.map((message, i) => ({
    id: `${id}-w${i}`,
    invitation_id: id,
    name: i === 0 ? 'Keluarga Wijaya' : 'Rina',
    message,
    hidden: false,
    created_at: i === 0 ? '2026-11-01T09:00:00Z' : '2026-11-03T12:30:00Z',
  }))
}

const isBirthday = (k: InvitationKind) => k !== 'pernikahan'
