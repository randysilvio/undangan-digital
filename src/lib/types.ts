export type ThemeName = 'elegan' | 'modern' | 'botani' | 'mewah' | 'ceria' | 'pastel'
export type InvitationKind = 'pernikahan' | 'ultah_anak' | 'sweet_seventeen' | 'ultah_dewasa' | 'ultah_syukur'
export type TimeZoneId = 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura'
export type Attendance = 'hadir' | 'tidak' | 'ragu'
export type InvitationStatus = 'draft' | 'published'

export interface StoryItem {
  /** Tahun atau penanda waktu, mis. "1955" atau "Juni 2020". */
  year: string
  title: string
  text: string
}

export interface Invitation {
  id: string
  slug: string
  status: InvitationStatus
  /** Jenis undangan. Untuk ulang tahun, kolom groom_* berisi yang berulang tahun dan bride_* kosong. */
  kind: InvitationKind
  /** Usia yang dirayakan (ulang tahun); null untuk pernikahan. */
  age: number | null
  theme: ThemeName
  timezone: TimeZoneId
  groom_name: string
  groom_nickname: string
  groom_parents: string | null
  groom_photo_url: string | null
  bride_name: string | null
  bride_nickname: string | null
  bride_parents: string | null
  bride_photo_url: string | null
  cover_photo_url: string | null
  opening_text: string | null
  /** Null = teks template Umum (undangan lama). */
  intro_text: string | null
  closing_text: string | null
  wa_message: string | null
  music_url: string | null
  /** Cerita / perjalanan hidup (urut). */
  story: StoryItem[]
  /** Daftar keluarga, satu nama per baris. */
  family: string | null
  dress_code: string | null
  /** Tema kustom (null = tema bawaan di kolom theme). */
  custom_theme_id: string | null
  created_at: string
}

export interface InvitationEvent {
  id: string
  invitation_id: string
  name: string
  /** YYYY-MM-DD */
  date: string
  /** HH:MM */
  start_time: string
  end_time: string | null
  venue_name: string
  address: string
  maps_url: string | null
  sort_order: number
}

export interface GalleryPhoto {
  id: string
  invitation_id: string
  url: string
  sort_order: number
}

export interface GiftAccount {
  id: string
  invitation_id: string
  provider: string
  account_number: string
  account_holder: string
  sort_order: number
}

export interface Guest {
  id: string
  invitation_id: string
  name: string
  phone: string | null
  code: string
  created_at: string
}

export interface Rsvp {
  id: string
  invitation_id: string
  guest_code: string | null
  name: string
  attendance: Attendance
  party_size: number
  created_at: string
}

export interface Wish {
  id: string
  invitation_id: string
  name: string
  message: string
  hidden: boolean
  created_at: string
}

export type InvitationFull = Invitation & {
  events: InvitationEvent[]
  gallery: GalleryPhoto[]
  gifts: GiftAccount[]
  /** Hasil join; ada bila custom_theme_id terisi. */
  custom_theme?: CustomTheme | null
}

export type ThemeColorKey = 'bg' | 'surface' | 'text' | 'muted' | 'accent' | 'on_accent' | 'line'
export type ThemeFontRole = 'heading' | 'body' | 'names'
export type ThemeSlot = 'cover_bg' | 'cover_frame' | 'corner' | 'texture' | 'garland' | 'ornament' | 'particle' | 'closing_bg'
export type ParticleMode = 'tema' | 'jatuh' | 'naik' | 'kelip' | 'mati'

/** Tema buatan admin: tema dasar + warna, huruf, dan gambar hiasan pilihan sendiri. */
export interface CustomTheme {
  id: string
  slug: string
  name: string
  description: string | null
  base_theme: ThemeName
  colors: Partial<Record<ThemeColorKey, string>>
  fonts: Partial<Record<ThemeFontRole, string>>
  assets: Partial<Record<ThemeSlot, string>>
  particles: ParticleMode
  show_in_gallery: boolean
  created_at: string
  updated_at: string
}

export interface SitePackage {
  name: string
  price: string
  features: string[]
  highlight: boolean
}

/** Pengaturan halaman publik (kontak & paket). */
export interface SiteSettings {
  whatsapp: string | null
  instagram: string | null
  email: string | null
  packages: SitePackage[]
  show_credit: boolean
}

/** Rekap angka untuk halaman pantau mempelai (hasil fungsi database monitor_summary). */
export interface MonitorSummary {
  groomNickname: string
  /** Null untuk undangan ulang tahun. */
  brideNickname: string | null
  theme: ThemeName
  timezone: TimeZoneId
  status: InvitationStatus
  hadir: number
  tidak: number
  ragu: number
  totalOrang: number
  generatedAt: string
}

export type MonitorResult = { kind: 'ok'; summary: MonitorSummary } | { kind: 'invalid' } | { kind: 'error' }
