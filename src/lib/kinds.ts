import type { IconName } from '@/components/icons'
import type { InvitationKind, ThemeName } from './types'

export interface KindConfig {
  id: InvitationKind
  /** Nama jenis di panel admin dan halaman depan. */
  label: string
  description: string
  /** Baris kecil di atas nama pada sampul. */
  coverLabel: string
  /** Ikon khas jenis undangan (sampul, halaman depan, formulir). */
  motif: IconName
  /** Judul bagian cerita/perjalanan. */
  storyTitle: string
  /** Judul bagian keluarga. */
  familyTitle: string
  /** Efek perayaan saat undangan dibuka. */
  celebrate: boolean
  /** Judul bagian tokoh utama. */
  personTitle: string
  countdownTitle: string
  /** Baris sebelum nama di bagian penutup. */
  signOff: string
  /** Nama acara bawaan untuk undangan baru. */
  eventNames: string[]
  defaultTheme: ThemeName
  /** Sebutan pemilik acara (link pantau, pesan WA). */
  ownerLabel: string
  /** Contoh isian formulir. */
  placeholder: { name: string; nickname: string; parents: string; age: string }
}

export const KINDS: Record<InvitationKind, KindConfig> = {
  pernikahan: {
    id: 'pernikahan',
    label: 'Pernikahan',
    description: 'Akad/pemberkatan dan resepsi, lengkap dengan data kedua mempelai.',
    coverLabel: 'Undangan Pernikahan',
    motif: 'rings',
    storyTitle: 'Kisah Kami',
    familyTitle: 'Turut Mengundang',
    celebrate: false,
    personTitle: 'Mempelai',
    countdownTitle: 'Menuju Hari Bahagia',
    signOff: 'Kami yang berbahagia,',
    eventNames: ['Akad Nikah', 'Resepsi'],
    defaultTheme: 'elegan',
    ownerLabel: 'mempelai',
    placeholder: { name: '', nickname: '', parents: '', age: '' },
  },
  ultah_anak: {
    id: 'ultah_anak',
    label: 'Ulang Tahun Anak',
    description: 'Pesta ulang tahun si kecil: ceria, penuh warna, dengan usia yang dirayakan.',
    coverLabel: 'Undangan Ulang Tahun',
    motif: 'balloon',
    storyTitle: 'Cerita Si Kecil',
    familyTitle: 'Keluarga Besar',
    celebrate: true,
    personTitle: 'Yang Berulang Tahun',
    countdownTitle: 'Menuju Pesta Ulang Tahun',
    signOff: 'Sampai jumpa di pesta,',
    eventNames: ['Pesta Ulang Tahun'],
    defaultTheme: 'ceria',
    ownerLabel: 'orang tua',
    placeholder: { name: 'Kayla Putri Santoso', nickname: 'Kayla', parents: 'Putri dari Bapak Budi & Ibu Ani', age: '5' },
  },
  sweet_seventeen: {
    id: 'sweet_seventeen',
    label: 'Sweet Seventeen',
    description: 'Perayaan usia 17 tahun untuk remaja, manis dan berkesan.',
    coverLabel: 'Sweet Seventeen',
    motif: 'crown',
    storyTitle: 'Perjalanan 17 Tahun',
    familyTitle: 'Keluarga & Sahabat',
    celebrate: true,
    personTitle: 'Yang Berulang Tahun',
    countdownTitle: 'Menuju Malam Spesial',
    signOff: 'Dengan penuh sukacita,',
    eventNames: ['Sweet Seventeen Party'],
    defaultTheme: 'pastel',
    ownerLabel: 'penyelenggara',
    placeholder: { name: 'Nadia Aurelia', nickname: 'Nadia', parents: 'Putri dari Bapak Hendra & Ibu Maria', age: '17' },
  },
  ultah_dewasa: {
    id: 'ultah_dewasa',
    label: 'Ulang Tahun Dewasa',
    description: 'Ulang tahun ke-20, 30, 40 dan seterusnya: makan malam, pesta, atau kumpul santai.',
    coverLabel: 'Undangan Ulang Tahun',
    motif: 'glasses',
    storyTitle: 'Perjalanan Hidup',
    familyTitle: 'Keluarga & Sahabat',
    celebrate: true,
    personTitle: 'Yang Berulang Tahun',
    countdownTitle: 'Menuju Hari Spesial',
    signOff: 'Salam hangat,',
    eventNames: ['Perayaan Ulang Tahun'],
    defaultTheme: 'mewah',
    ownerLabel: 'penyelenggara',
    placeholder: { name: 'Andreas Wijaya', nickname: 'Andreas', parents: '', age: '30' },
  },
  ultah_syukur: {
    id: 'ultah_syukur',
    label: 'Syukuran Ulang Tahun',
    description: 'Syukuran usia emas orang tua atau kakek-nenek (50, 60, 70 tahun) bersama keluarga.',
    coverLabel: 'Undangan Syukuran',
    motif: 'branch',
    storyTitle: 'Perjalanan Hidup',
    familyTitle: 'Anak, Menantu & Cucu',
    celebrate: false,
    personTitle: 'Yang Kami Syukuri',
    countdownTitle: 'Menuju Hari Syukur',
    signOff: 'Kami sekeluarga,',
    eventNames: ['Ibadah / Doa Syukur', 'Ramah Tamah'],
    defaultTheme: 'botani',
    ownerLabel: 'keluarga',
    placeholder: { name: 'Bapak Slamet Riyadi', nickname: 'Opa Slamet', parents: 'Bersama anak, menantu, dan cucu', age: '70' },
  },
}

export const KIND_IDS = Object.keys(KINDS) as InvitationKind[]

export const isWedding = (kind: InvitationKind) => kind === 'pernikahan'

/** Ulang tahun yang dirayakan dua orang sekaligus (orang kedua di kolom bride_*). */
export const isJoint = (inv: { kind: InvitationKind; bride_nickname: string | null }) => !isWedding(inv.kind) && Boolean(inv.bride_nickname)

/** Nama yang tampil besar: "Budi & Ani" (pernikahan / ulang tahun bersama) atau satu nama panggilan. */
export function displayName(inv: { kind: InvitationKind; groom_nickname: string; bride_nickname: string | null }): string {
  return inv.bride_nickname ? `${inv.groom_nickname} & ${inv.bride_nickname}` : inv.groom_nickname
}

/** Label usia satu orang: "Ulang Tahun ke-5" atau "Syukuran 70 Tahun". */
export function singleAgeLabel(kind: InvitationKind, age: number | null): string | null {
  if (isWedding(kind) || !age) return null
  return kind === 'ultah_syukur' ? `Syukuran ${age} Tahun` : `Ulang Tahun ke-${age}`
}

/** "Ulang Tahun ke-5", "Ulang Tahun ke-5 & ke-3", "Syukuran 70 & 65 Tahun"; null bila tidak ada usia. */
export function ageLabel(kind: InvitationKind, age: number | null, age2: number | null = null): string | null {
  if (isWedding(kind)) return null
  if (age && age2) return kind === 'ultah_syukur' ? `Syukuran ${age} & ${age2} Tahun` : `Ulang Tahun ke-${age} & ke-${age2}`
  return singleAgeLabel(kind, age ?? age2)
}

/** Judul halaman dan judul kalender, mis. "Pernikahan Budi & Ani", "Ulang Tahun ke-5 Kayla", "Ulang Tahun Kayla & Bima". */
export function eventTitle(inv: { kind: InvitationKind; age: number | null; groom_nickname: string; bride_nickname: string | null }): string {
  const name = displayName(inv)
  if (isWedding(inv.kind)) return `Pernikahan ${name}`
  const word = inv.kind === 'ultah_syukur' ? 'Syukuran' : 'Ulang Tahun'
  if (isJoint(inv)) return `${word} ${name}`
  return `${ageLabel(inv.kind, inv.age) ?? word} ${name}`
}

/** Label pilihan "dirayakan bersama" per jenis. */
export const JOINT_LABEL: Record<Exclude<InvitationKind, 'pernikahan'>, { toggle: string; second: string }> = {
  ultah_anak: { toggle: 'Dirayakan bersama (2 anak, mis. kakak-adik)', second: 'Anak kedua' },
  sweet_seventeen: { toggle: 'Dirayakan bersama (mis. kembar)', second: 'Orang kedua' },
  ultah_dewasa: { toggle: 'Dirayakan bersama (2 orang)', second: 'Orang kedua' },
  ultah_syukur: { toggle: 'Disyukuri bersama (mis. Opa & Oma)', second: 'Orang kedua' },
}
