# Undangan Digital (Tahap 1) Implementation Plan

**Goal:** Web undangan pernikahan digital. Admin membuat undangan lewat formulir; tamu membuka link pribadi, lalu mengisi RSVP dan ucapan.

**Architecture:** Next.js (App Router, server components, server actions) di Vercel. Supabase dipakai untuk Postgres, Auth, dan Storage, dengan Row Level Security sebagai batas keamanan. Logika murni (slug, link, waktu, CSV, validasi) ada di `src/lib` dan diuji dengan Vitest. Tema = konfigurasi + token CSS di atas komponen bagian yang sama.

**Tech Stack:** Next.js (versi terbaru dari `create-next-app`), React, TypeScript strict, Tailwind CSS v4, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `browser-image-compression`, Vitest, Playwright, Supabase CLI via `npx` (hanya untuk `db push --db-url`; tidak perlu Docker).

**Spec:** [docs/rancangan/2026-11-10-undangan-digital.md](../rancangan/2026-11-10-undangan-digital.md)

## Global Constraints

- Semua teks UI dalam Bahasa Indonesia.
- Biaya Rp0: hanya paket gratis Vercel + Supabase.
- Halaman tamu harus nyaman di lebar layar 360px (mobile-first).
- Teks dari tamu dan URL hanya dirender sebagai teks. `dangerouslySetInnerHTML` dilarang di mana pun.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di `scripts/` dan tes, tidak pernah diimpor dari `src/`.
- Dependensi runtime terbatas pada daftar Tech Stack. Tambahan baru harus disetujui dulu.
- Nama kolom DB memakai bahasa Inggris (pemetaan dari spec ada di Task 5).
- Zona waktu yang didukung hanya WIB (`Asia/Jakarta`), WITA (`Asia/Makassar`), dan WIT (`Asia/Jayapura`).
- Variabel lingkungan (`.env.local`, contohnya ada di `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`.

**Penambahan terhadap spec** (keputusan rencana ini):
1. Kolom `invitations.timezone`, karena acara di WITA/WIT harus dihitung dengan benar.
2. Tabel `admins` + fungsi `is_admin()`, supaya akun yang dibuat lewat signup tidak otomatis menjadi admin.
3. `rsvps.guest_code` (teks) sebagai pengganti `guest_id`, karena pengguna anonim tidak boleh membaca tabel `guests`.
4. Batas galeri 30 foto per undangan.
5. Foto dikompres dulu (≤1920px), lalu ditolak kalau hasilnya masih >5 MB.
6. File di Storage tidak dihapus saat barisnya dihapus, karena hasil duplikasi berbagi file yang sama.
7. Screenshot di panduan deploy hanya untuk aplikasi ini sendiri. Langkah di dashboard Supabase/Vercel ditulis dengan nama menu yang persis.

## Review Focus

1. **Nama tamu aneh di `?to=`** (sangat panjang, `<script>`, `&`, `+`, spasi ganda): tampil sebagai teks apa adanya, dirapikan, maksimal 60 karakter. Diuji di Task 2 dan Task 7.
2. **Acara di WITA/WIT**: hitung mundur dan Google Calendar memakai zona undangan, bukan zona server atau browser. Diuji di Task 3.
3. **CSV RSVP dibuka di Excel berbahasa Indonesia**: nama berisi `;`, `"`, baris baru, atau diawali `=`. Pemisah `;`, ada BOM, dan aman dari formula injection. Diuji di Task 3.
4. **Tamu mengirim RSVP dua kali** (dobel ketuk atau ganti jawaban): rekap hanya menghitung jawaban terakhir per tamu. Diuji di Task 3.
5. **Nomor WA beragam format** (`0812-…`, `+62 812 …`, `812…`, isian ngawur): dinormalisasi ke `62…`. Nomor tidak valid tetap bisa dibagikan tanpa nomor. Diuji di Task 2.

---

## Struktur File

```
src/
  lib/
    types.ts          tipe domain (Invitation, InvitationEvent, ...)
    slug.ts           slugify, isValidSlug, nextAvailableSlug
    links.ts          parseGuestName, guestLink, guestCode, waMessage, waShareUrl
    phone.ts          normalizePhone
    time.ts           TIMEZONES, eventInstant, timeLeft, formatTanggal, formatJam
    calendar.ts       googleCalendarUrl
    csv.ts            toCsv, rsvpCsv
    rsvp.ts           summarizeRsvps
    validation.ts     skema zod + parseGuestList
    upload.ts         checkUpload
    publish.ts        canPublish
    safe-redirect.ts  safeRedirect
    supabase/{server,browser,public}.ts, auth.ts (requireAdmin)
    data/public.ts    query untuk halaman tamu
    data/admin.ts     query/mutasi untuk admin
  components/
    invitation/       InvitationView + bagian-bagian + komponen interaktif
    admin/            formulir admin
  themes/index.ts     THEMES registry
  app/
    [slug]/page.tsx, [slug]/actions.ts, not-found.tsx
    admin/login/, admin/page.tsx, admin/new/, admin/[id]/{edit,media,guests,responses,preview}/
  proxy.ts            (Next ≥16; pakai middleware.ts kalau versinya 15)
supabase/migrations/0001_init.sql
scripts/db-push.mjs, scripts/seed.mjs
tests/unit/*.test.ts(x), tests/db/rls.test.ts, tests/fixtures/invitation.ts
e2e/smoke.spec.ts
docs/deploy.md
```

---

### Task 1: Kerangka proyek + slug

**Files:**
- Create: kerangka Next.js, `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `src/lib/slug.ts`
- Test: `tests/unit/slug.test.ts`

**Interfaces:**
- Produces: `slugify(input: string): string`, `isValidSlug(s: string): boolean`, `RESERVED_SLUGS: readonly string[]` (= `['admin','api','login','_next','favicon.ico']`), `nextAvailableSlug(base: string, taken: string[]): string`; skrip npm `test` (vitest run tests/unit), `test:db`, `e2e`, `dev`, `build`, `lint`.

- [ ] **Step 1: Buat kerangka.** `create-next-app` menolak folder yang berisi `README.md`, jadi jalankan `npx create-next-app@latest ../undangan-scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`. Salin isinya ke repo kecuali `.git` dan `README.md`, gabungkan `.gitignore`, lalu hapus `../undangan-scaffold`. Pasang `vitest`, `@playwright/test` (dev) dan `zod`. `vitest.config.ts`: `esbuild.jsx = 'automatic'`, alias `@` → `src`, environment `node`.
- [ ] **Step 2: Tulis tes yang gagal** di `tests/unit/slug.test.ts`:

```ts
expect(slugify('Budi & Ani')).toBe('budi-ani')
expect(slugify('Réza dan  Siti!!')).toBe('reza-dan-siti')
expect(slugify('---')).toBe('')
expect(slugify('a'.repeat(80))).toHaveLength(60)
expect(isValidSlug('budi-ani')).toBe(true)
for (const bad of ['Budi', 'ab', 'admin', 'budi--ani', '-budi', 'a'.repeat(61)]) expect(isValidSlug(bad)).toBe(false)
expect(nextAvailableSlug('budi-ani-salinan', [])).toBe('budi-ani-salinan')
expect(nextAvailableSlug('budi-ani-salinan', ['budi-ani-salinan', 'budi-ani-salinan-2'])).toBe('budi-ani-salinan-3')
```

- [ ] **Step 3: `npm test`.** Hasil yang diharapkan: GAGAL (modul tidak ada).
- [ ] **Step 4: Implementasi `src/lib/slug.ts`.** Aturan: NFD lalu buang diakritik, huruf kecil, non-`[a-z0-9]` menjadi `-`, gabungkan `-`, potong ke 60 karakter, lalu trim `-`. Valid = `^[a-z0-9]+(?:-[a-z0-9]+)*$`, panjang 3–60, dan bukan reserved.
- [ ] **Step 5: `npm test` dan `npm run build`.** Hasil yang diharapkan: LULUS dan build sukses.
- [ ] **Step 6: Commit** dengan pesan `chore: kerangka Next.js + slug`.

### Task 2: Link tamu & WhatsApp

**Files:** Create `src/lib/links.ts`, `src/lib/phone.ts`. Test: `tests/unit/links.test.ts`, `tests/unit/phone.test.ts`

**Interfaces:**
- Produces: `parseGuestName(raw: string | string[] | undefined): string | null`; `guestLink(baseUrl: string, slug: string, guest: { name: string; code?: string | null }): string`; `guestCode(): string`; `waMessage(p: { guestName: string; coupleName: string; link: string }): string`; `waShareUrl(phone: string | null, message: string): string`; `normalizePhone(raw: string | null | undefined): string | null`.

- [ ] **Step 1: Tulis tes yang gagal:**

```ts
expect(parseGuestName('  Bu   Sri ')).toBe('Bu Sri')
expect(parseGuestName(['A', 'B'])).toBe('A')
expect(parseGuestName(undefined)).toBeNull()
expect(parseGuestName('   ')).toBeNull()
expect(parseGuestName('x'.repeat(100))).toHaveLength(60)
expect(parseGuestName('<script>alert(1)</script>')).toBe('<script>alert(1)</script>')
expect(guestLink('https://x.app/', 'budi-ani', { name: 'Pak Joko', code: 'ab12cd' })).toBe('https://x.app/budi-ani?to=Pak+Joko&g=ab12cd')
expect(guestLink('https://x.app', 'budi-ani', { name: 'Bu Sri & Kel' })).toBe('https://x.app/budi-ani?to=Bu+Sri+%26+Kel')
expect(new Set(Array.from({ length: 200 }, guestCode)).size).toBe(200); expect(guestCode()).toMatch(/^[a-z0-9]{6}$/)
for (const v of ['0812-3456-7890', '+62 812 3456 7890', '6281234567890', '81234567890']) expect(normalizePhone(v)).toBe('6281234567890')
for (const v of ['abc', '', '0812', null]) expect(normalizePhone(v)).toBeNull()
expect(waShareUrl('0812-3456-7890', 'Halo Pak')).toBe('https://wa.me/6281234567890?text=Halo%20Pak')
expect(waShareUrl(null, 'Halo')).toBe('https://wa.me/?text=Halo')
const m = waMessage({ guestName: 'Pak Joko', coupleName: 'Budi & Ani', link: 'https://x.app/budi-ani?to=Pak+Joko' })
expect(m).toContain('*Pak Joko*'); expect(m).toContain('*Budi & Ani*'); expect(m).toContain('https://x.app/budi-ani?to=Pak+Joko')
```

- [ ] **Step 2: `npm test`.** Hasil yang diharapkan: GAGAL.
- [ ] **Step 3: Implementasi.** `guestCode` memakai `crypto.getRandomValues` dengan alfabet `a-z0-9`. Nomor telepon valid bila hasil normalisasinya 10–15 digit dan diawali `62`. `waMessage` memakai teks persis ini:

```
Kepada Yth.
Bapak/Ibu/Saudara/i *{guestName}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

*{coupleName}*

Berikut link undangan kami:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih.
```

- [ ] **Step 4: `npm test`.** Hasil yang diharapkan: LULUS.
- [ ] **Step 5: Commit** dengan pesan `feat: link tamu dan pesan WhatsApp`.

### Task 3: Tipe domain, waktu, kalender, CSV, rekap RSVP

**Files:** Create `src/lib/types.ts`, `time.ts`, `calendar.ts`, `csv.ts`, `rsvp.ts`. Test: `tests/unit/{time,calendar,csv,rsvp}.test.ts`

**Interfaces:**
- Produces `types.ts`:
  - `ThemeName = 'elegan' | 'modern'`, `TimeZoneId = 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura'`, `Attendance = 'hadir' | 'tidak' | 'ragu'`.
  - `Invitation { id; slug; status: 'draft' | 'published'; theme: ThemeName; timezone: TimeZoneId; groom_name; groom_nickname; groom_parents: string | null; groom_photo_url: string | null; bride_name; bride_nickname; bride_parents: string | null; bride_photo_url: string | null; cover_photo_url: string | null; opening_text: string | null; music_url: string | null; created_at }`.
  - `InvitationEvent { id; invitation_id; name; date /*YYYY-MM-DD*/; start_time /*HH:MM*/; end_time: string | null; venue_name; address; maps_url: string | null; sort_order: number }`.
  - `GalleryPhoto { id; invitation_id; url; sort_order }`, `GiftAccount { id; invitation_id; provider; account_number; account_holder; sort_order }`, `Guest { id; invitation_id; name; phone: string | null; code; created_at }`.
  - `Rsvp { id; invitation_id; guest_code: string | null; name; attendance: Attendance; party_size: number; created_at }`, `Wish { id; invitation_id; name; message; hidden: boolean; created_at }`.
  - `InvitationFull = Invitation & { events: InvitationEvent[]; gallery: GalleryPhoto[]; gifts: GiftAccount[] }`.
- Produces fungsi:
  - `TIMEZONES: Record<TimeZoneId, { label: 'WIB' | 'WITA' | 'WIT'; offsetHours: number }>`.
  - `eventInstant(date: string, time: string, tz: TimeZoneId): Date`.
  - `timeLeft(target: Date, now: Date): { days; hours; minutes; seconds; done: boolean }`.
  - `formatTanggal(date: string): string`, `formatJam(time: string, tz: TimeZoneId): string`.
  - `googleCalendarUrl(e: { title: string; date: string; startTime: string; endTime: string | null; timezone: TimeZoneId; location: string }): string`.
  - `toCsv(headers: string[], rows: (string | number | null)[][]): string`, `rsvpCsv(rows: Rsvp[], tz: TimeZoneId): string`.
  - `summarizeRsvps(rows: Rsvp[]): { hadir: number; tidak: number; ragu: number; totalOrang: number }`.

- [ ] **Step 1: Tulis tes yang gagal:**

```ts
expect(eventInstant('2026-12-12', '08:00', 'Asia/Jayapura').toISOString()).toBe('2026-12-11T23:00:00.000Z')
expect(eventInstant('2026-12-12', '08:00', 'Asia/Jakarta').toISOString()).toBe('2026-12-12T01:00:00.000Z')
const now = new Date('2026-01-01T00:00:00Z')
expect(timeLeft(new Date('2026-01-02T02:03:04Z'), now)).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4, done: false })
expect(timeLeft(new Date('2025-12-31T00:00:00Z'), now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true })
expect(formatTanggal('2026-12-12')).toBe('Sabtu, 12 Desember 2026')
expect(formatJam('08:00', 'Asia/Makassar')).toBe('08.00 WITA')
const u = new URL(googleCalendarUrl({ title: 'Pernikahan Budi & Ani', date: '2026-12-12', startTime: '08:00', endTime: null, timezone: 'Asia/Jayapura', location: 'Gedung A, Jayapura' }))
expect(u.origin + u.pathname).toBe('https://calendar.google.com/calendar/render')
expect(u.searchParams.get('action')).toBe('TEMPLATE')
expect(u.searchParams.get('dates')).toBe('20261211T230000Z/20261212T010000Z') // endTime null → +2 jam
expect(u.searchParams.get('text')).toBe('Pernikahan Budi & Ani')
expect(u.searchParams.get('location')).toBe('Gedung A, Jayapura')
expect(toCsv(['Nama', 'Pesan'], [['Budi', 'Halo; "teman"'], ['=1+1', 'a\nb'], ['Ani', null]]))
  .toBe('﻿Nama;Pesan\r\nBudi;"Halo; ""teman"""\r\n\'=1+1;"a\nb"\r\nAni;\r\n')
expect(rsvpCsv([{ id: '1', invitation_id: 'i', guest_code: 'ab12cd', name: 'Joko', attendance: 'hadir', party_size: 2, created_at: '2026-12-01T01:30:00Z' }], 'Asia/Jayapura'))
  .toBe('﻿Nama;Kehadiran;Jumlah Orang;Kode Tamu;Waktu\r\nJoko;Hadir;2;ab12cd;01/12/2026 10.30\r\n')
// rekap: jawaban terakhir per guest_code, atau per nama (trim + huruf kecil) bila tanpa kode
const r = (o: Partial<Rsvp>): Rsvp => ({ id: 'x', invitation_id: 'i', guest_code: null, name: 'A', attendance: 'hadir', party_size: 1, created_at: '2026-01-01T00:00:00Z', ...o })
expect(summarizeRsvps([
  r({ guest_code: 'a', name: 'Joko', party_size: 2, created_at: '2026-01-01T00:00:00Z' }),
  r({ guest_code: 'a', name: 'Joko', attendance: 'tidak', party_size: 0, created_at: '2026-01-02T00:00:00Z' }),
  r({ name: 'Sri', party_size: 3, created_at: '2026-01-01T00:00:00Z' }),
  r({ name: ' sri ', party_size: 1, created_at: '2026-01-03T00:00:00Z' }),
  r({ name: 'Ana', attendance: 'ragu' }),
])).toEqual({ hadir: 1, tidak: 1, ragu: 1, totalOrang: 1 })
```

- [ ] **Step 2: `npm test`.** Hasil yang diharapkan: GAGAL.
- [ ] **Step 3: Implementasi.**
  - Offset tetap: WIB +7, WITA +8, WIT +9 (Indonesia tanpa DST).
  - `formatTanggal` memakai `Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })` pada `Date.UTC(...)`.
  - CSV memakai pemisah `;`, BOM, dan CRLF. Field berisi `;`, `"`, `\n`, atau `\r` dikutip dengan `"` digandakan. Field yang diawali `= + - @` diberi prefiks `'`.
  - `rsvpCsv` memetakan label kehadiran ke `Hadir`/`Tidak Hadir`/`Masih Ragu` dengan urutan baris seperti input.
- [ ] **Step 4: `npm test`.** Hasil yang diharapkan: LULUS.
- [ ] **Step 5: Commit** dengan pesan `feat: tipe domain, waktu, kalender, CSV, rekap RSVP`.

### Task 4: Validasi formulir

**Files:** Create `src/lib/validation.ts`, `src/lib/publish.ts`, `src/lib/upload.ts`, `src/lib/safe-redirect.ts`. Test: `tests/unit/validation.test.ts`, `tests/unit/misc.test.ts`

**Interfaces:**
- Consumes: `isValidSlug`, `RESERVED_SLUGS` (Task 1), `normalizePhone` (Task 2), tipe Task 3.
- Produces:
  - Skema zod `rsvpSchema`, `wishSchema`, `invitationSchema`, `eventSchema`, `giftSchema`, dengan input `FormData`-friendly (string) dan `z.coerce` untuk angka.
  - `parseGuestList(text: string): { guests: { name: string; phone: string | null }[]; duplicates: number }`.
  - `fieldErrors(error: z.ZodError): Record<string, string>` (pesan pertama per field).
  - `canPublish(inv: InvitationFull): string | null`.
  - `checkUpload(file: { type: string; size: number }, kind: 'photo' | 'music'): string | null`.
  - `safeRedirect(next: string | null | undefined): string`.
  - `FormState = { status: 'idle' | 'ok' | 'error'; message?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> }`.

- [ ] **Step 1: Tulis tes yang gagal.** Pesan error harus persis:

```ts
expect(rsvpSchema.parse({ name: 'Joko', attendance: 'hadir', party_size: '2' }).party_size).toBe(2)
expect(rsvpSchema.parse({ name: 'Joko', attendance: 'tidak', party_size: '5' }).party_size).toBe(0)
expect(fieldErrors(rsvpSchema.safeParse({ name: 'J', attendance: 'hadir', party_size: '11' }).error!).party_size).toBe('Maksimal 10 orang')
expect(fieldErrors(rsvpSchema.safeParse({ name: ' ', attendance: 'hadir', party_size: '1' }).error!).name).toBe('Nama wajib diisi')
expect(fieldErrors(rsvpSchema.safeParse({ name: 'x'.repeat(101), attendance: 'hadir', party_size: '1' }).error!).name).toBe('Nama maksimal 100 karakter')
expect(fieldErrors(wishSchema.safeParse({ name: 'A', message: 'x'.repeat(501) }).error!).message).toBe('Ucapan maksimal 500 karakter')
expect(fieldErrors(invitationSchema.safeParse({ ...validInv, slug: 'admin' }).error!).slug).toBe('Alamat ini tidak bisa dipakai')
expect(fieldErrors(invitationSchema.safeParse({ ...validInv, slug: 'Budi Ani' }).error!).slug).toBe('Hanya huruf kecil, angka, dan tanda - (3–60 karakter)')
expect(fieldErrors(eventSchema.safeParse({ ...validEvent, start_time: '08:00', end_time: '07:00' }).error!).end_time).toBe('Jam selesai harus setelah jam mulai')
expect(fieldErrors(eventSchema.safeParse({ ...validEvent, maps_url: 'javascript:alert(1)' }).error!).maps_url).toBe('Link harus diawali https://')
expect(parseGuestList('Pak Joko\n\n  Bu Sri, 0812-3456-7890\npak joko\n'))
  .toEqual({ guests: [{ name: 'Pak Joko', phone: null }, { name: 'Bu Sri', phone: '6281234567890' }], duplicates: 1 })
expect(canPublish(makeInvitation({ events: [] }))).toBe('Tambahkan minimal satu acara sebelum menerbitkan')
expect(canPublish(makeInvitation())).toBeNull()
expect(checkUpload({ type: 'image/jpeg', size: 6e6 }, 'photo')).toBe('Ukuran foto maksimal 5 MB')
expect(checkUpload({ type: 'audio/wav', size: 1e6 }, 'music')).toBe('Musik harus berformat MP3')
expect(checkUpload({ type: 'audio/mpeg', size: 11e6 }, 'music')).toBe('Ukuran musik maksimal 10 MB')
expect(checkUpload({ type: 'image/png', size: 1e6 }, 'photo')).toBeNull()
expect(safeRedirect('/admin/x')).toBe('/admin/x')
for (const bad of ['//evil.com', 'https://evil.com', '/lain', null]) expect(safeRedirect(bad)).toBe('/admin')
```

  - `validInv` dan `validEvent` didefinisikan di file tes.
  - `makeInvitation(overrides?: Partial<InvitationFull>): InvitationFull` dibuat di `tests/fixtures/invitation.ts`: Budi & Ani, slug `budi-ani`, published, tema `elegan`, zona `Asia/Jayapura`, 2 acara (Akad 2026-12-12 08:00, Resepsi 2026-12-12 11:00), 2 foto galeri, 1 rekening.
  - Aturan lain: `invitationSchema` mewajibkan nama lengkap dan panggilan kedua mempelai, theme dan timezone berupa enum, `opening_text` ≤1000, `music_url` opsional. `giftSchema`: `provider` wajib, `account_number` berisi digit/spasi 5–30, `account_holder` wajib. Foto yang diterima: `image/jpeg|png|webp`.
- [ ] **Step 2: `npm test`.** Hasil yang diharapkan: GAGAL.
- [ ] **Step 3: Implementasi.** Hanya ada satu FormState type, di `validation.ts`.
- [ ] **Step 4: `npm test`.** Hasil yang diharapkan: LULUS.
- [ ] **Step 5: Commit** dengan pesan `feat: validasi formulir dan aturan terbit/unggah`.

> **⛔ Prasyarat manusia sebelum Task 5.** Pemilik membuat proyek Supabase gratis (region Singapore) dan mengisi `.env.local` dengan URL, anon key, service role key, dan connection string DB. Di Authentication, matikan "Allow new users to sign up", lalu buat 2 user: admin asli dan admin E2E. Agen memandu langkah ini dengan nama menu yang persis.

### Task 5: Skema database, RLS, storage, seed

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `scripts/db-push.mjs`, `scripts/seed.mjs`, `scripts/make-admin.mjs`
- Test: `tests/db/rls.test.ts` (vitest config terpisah `vitest.db.config.ts`; dilewati kalau `SUPABASE_SERVICE_ROLE_KEY` tidak ada)

**Interfaces:**
- Consumes: tipe Task 3. Kolom DB = nama properti tipe tersebut.
- Pemetaan dari spec: `musik_url`→`music_url`, `no_wa`→`phone`, `nama`→`name`, `kehadiran`→`attendance`, `jumlah orang`→`party_size`, `kode unik`→`code`.
- Produces: tabel `invitations`, `events`, `gallery_photos`, `gift_accounts`, `guests`, `rsvps`, `wishes`, `admins(user_id uuid pk references auth.users)`; fungsi `public.is_admin(): boolean`; bucket `media` (public read); skrip `npm run db:push`, `npm run db:seed` (undangan demo `demo-budi-ani`, published, zona `Asia/Jayapura`, acara 30 hari dari hari ini; idempoten; opsi `-- --theme modern` mengganti tema demo), dan `npm run make-admin -- <email>`.

- [ ] **Step 1: Tulis migrasi.**
  - PK `uuid default gen_random_uuid()`. Semua FK anak `on delete cascade`.
  - `invitations.slug unique`, `status` dan `theme` dengan check, `timezone` check 3 nilai dengan default `'Asia/Jakarta'`.
  - `guests unique(invitation_id, code)`.
  - Check panjang `rsvps.name` ≤100, `wishes.message` ≤500, dan `party_size between 0 and 10`.
  - Index `(invitation_id, created_at desc)` di `rsvps` dan `wishes`.
- [ ] **Step 2: Tulis kebijakan RLS** (semua tabel `enable row level security`):
  - `is_admin()` (security definer, `exists(select 1 from admins where user_id = auth.uid())`) memberi akses penuh di semua tabel.
  - anon/authenticated boleh `select` `invitations` yang `status='published'`, juga `events`/`gallery_photos`/`gift_accounts` milik undangan yang terbit.
  - Ucapan: `select` `wishes` yang `hidden=false` milik undangan terbit, dan `insert` `wishes` dengan `hidden=false` ke undangan terbit.
  - RSVP: `insert` `rsvps` ke undangan terbit. Tidak ada `select`.
  - `guests` dan `admins`: tidak ada akses publik.
  - Storage `media`: baca publik; insert/update/delete hanya untuk `is_admin()`.
- [ ] **Step 3: Tulis tes RLS yang gagal** (seed via service role: 1 undangan terbit + 1 draft + 1 wish tersembunyi; probe via anon client dan via user non-admin yang dibuat `auth.admin.createUser`, lalu dihapus di `afterAll`):
  - `anon tidak bisa membaca draft`
  - `anon bisa membaca undangan terbit beserta acara`
  - `anon bisa insert rsvp ke undangan terbit tapi tidak ke draft`
  - `anon tidak bisa select rsvps maupun guests`
  - `anon tidak bisa update invitations`
  - `anon hanya melihat wish yang tidak hidden`
  - `anon tidak bisa insert wish dengan hidden=true`
  - `user login non-admin tidak bisa membaca draft`
- [ ] **Step 4: `npm run test:db`.** Hasil yang diharapkan: GAGAL (tabel belum ada).
- [ ] **Step 5: `npm run db:push`** (`npx supabase db push --db-url $SUPABASE_DB_URL`; skrip membaca `.env.local` via `node --env-file`). Lalu `npm run test:db`. Hasil yang diharapkan: LULUS.
- [ ] **Step 6: `npm run db:seed`, lalu `npm run make-admin -- <email admin>` untuk kedua akun.** Hasil yang diharapkan: tercetak `Seed OK: /demo-budi-ani`.
- [ ] **Step 7: Commit** dengan pesan `feat: skema database, RLS, storage, seed`.

### Task 6: Klien Supabase, proteksi admin, login

**Files:** Create `src/lib/supabase/{server,browser,public}.ts`, `src/lib/auth.ts`, `src/proxy.ts`, `src/app/admin/login/{page.tsx,actions.ts}`, `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: `safeRedirect`, `FormState` (Task 4).
- Produces:
  - `createServerSupabase(): Promise<SupabaseClient>` (cookie sesi), `createBrowserSupabase(): SupabaseClient`, `createPublicSupabase(): SupabaseClient` (anon tanpa cookie).
  - `requireAdmin(): Promise<{ supabase: SupabaseClient; userId: string }>`: redirect ke `/admin/login?next=…` bila belum login atau bukan admin.
  - Server action `login(prev: FormState, fd: FormData)` dan `logout()`.

- [ ] **Step 1: Implementasi.**
  - `proxy.ts` menyegarkan sesi untuk `/admin/:path*` dan mengalihkan pengguna tanpa sesi (kecuali di `/admin/login`).
  - Layout admin memanggil `requireAdmin()` kecuali di halaman login, menampilkan header "Panel Undangan" dan tombol "Keluar".
  - Error login memakai teks `Email atau password salah`.
  - Login sukses diarahkan ke `safeRedirect(next)`.
- [ ] **Step 2: Verifikasi.** `npm run build` harus sukses. Lalu `npm run dev`:
  - Membuka `/admin` mengalihkan ke `/admin/login`.
  - Password salah menampilkan pesan error.
  - Akun admin bisa masuk ke `/admin`.
  - Keluar mengembalikan ke halaman login.
- [ ] **Step 3: Commit** dengan pesan `feat: login admin dan proteksi rute`.

### Task 7: Halaman tamu + sistem tema + tema Elegan

**Files:**
- Create:
  - `src/lib/data/public.ts`
  - `src/themes/index.ts`
  - `src/components/invitation/{InvitationView,OpeningSection,CoupleSection,EventsSection,GallerySection,GiftSection,ClosingSection}.tsx`
  - `src/app/[slug]/page.tsx`
  - `src/app/not-found.tsx`
- Modify: `src/app/globals.css` (token tema), `next.config.ts` (`images.remotePatterns` untuk host Supabase)
- Test: `tests/unit/invitation-view.test.tsx`

**Interfaces:**
- Consumes: Task 2 (`parseGuestName`), Task 3 (`formatTanggal`, `formatJam`, `googleCalendarUrl`, tipe), Task 6 (`createPublicSupabase`).
- Produces:
  - `getPublishedInvitation(slug: string): Promise<InvitationFull | null>` (anak diurutkan berdasarkan `sort_order`).
  - `getVisibleWishes(invitationId: string, limit = 50): Promise<Wish[]>`.
  - `ThemeConfig { name: ThemeName; label: string; headingFont: string /* var CSS */; bodyFont: string }`, `THEMES: Record<ThemeName, ThemeConfig>`.
  - `InvitationView(props: { invitation: InvitationFull; guestName: string | null; guestCode: string | null; wishes: Wish[]; preview?: boolean })`: root `<main data-theme={theme}>`, setiap bagian `<section data-section="sampul|pembuka|mempelai|hitung-mundur|acara|galeri|amplop|rsvp|ucapan|penutup">`. Slot interaktif dari Task 8/9 dirender sebagai placeholder dulu.

- [ ] **Step 1: Tulis tes yang gagal** (`renderToStaticMarkup`):

```ts
const html = (o = {}, guest: string | null = 'Pak Joko') => renderToStaticMarkup(<InvitationView invitation={makeInvitation(o)} guestName={guest} guestCode={null} wishes={[]} />)
expect(html()).toContain('Pak Joko')
expect(html({}, '<script>alert(1)</script>')).toContain('&lt;script&gt;')
expect(html({ gallery: [] })).not.toContain('data-section="galeri"')
expect(html({ gifts: [] })).not.toContain('data-section="amplop"')
expect(html({ opening_text: null })).not.toContain('data-section="pembuka"')
expect(html()).toContain('Sabtu, 12 Desember 2026'); expect(html()).toContain('08.00 WIT')
expect(html()).toContain('data-theme="elegan"')
expect(html({}, null)).toContain('Kepada Yth.') // tanpa nama: "Kepada Yth. Bapak/Ibu/Saudara/i"
```

- [ ] **Step 2: `npm test`.** Hasil yang diharapkan: GAGAL.
- [ ] **Step 3: Implementasi.**
  - `page.tsx` (async `params`/`searchParams`): bila `getPublishedInvitation` mengembalikan null, panggil `notFound()`.
  - `generateMetadata`: judul `Undangan Pernikahan {groom_nickname} & {bride_nickname}`, deskripsi tanggal acara pertama, gambar OG `cover_photo_url`.
  - Tema Elegan: krem `#f7f1e8`, emas `#b08d57`, teks `#3d3329`, heading Cormorant Garamond, body Lato (via `next/font/google`).
  - Tiap acara punya tombol "Lihat Peta" (hanya bila `maps_url` ada) dan "Simpan ke Kalender".
  - Teks 404: "Undangan tidak ditemukan".
- [ ] **Step 4: `npm test`, lalu buka `npm run dev` → `/demo-budi-ani?to=Pak+Joko` di lebar 360px.** Hasil yang diharapkan: tes LULUS, semua bagian tampil, dan `/tidak-ada` menampilkan 404.
- [ ] **Step 5: Commit** dengan pesan `feat: halaman tamu dan tema Elegan`.

### Task 8: Komponen interaktif halaman tamu

**Files:** Create `src/components/invitation/{CoverGate,MusicToggle,Countdown,GalleryLightbox,CopyButton}.tsx` (client). Modify `InvitationView.tsx`.

**Interfaces:**
- Consumes: `timeLeft`, `eventInstant` (Task 3).
- Produces:
  - `CoverGate({ guestName, coupleName, coverUrl, musicUrl, children })`: mengunci scroll sampai "Buka Undangan" diklik, lalu memutar musik.
  - `Countdown({ target: string /* ISO */ })`.
  - `GalleryLightbox({ photos: GalleryPhoto[] })`.
  - `CopyButton({ text: string; label?: string })`.

- [ ] **Step 1: Implementasi.**
  - `Countdown` merender `--` sebelum mount (tanpa hydration mismatch), lalu berdetak setiap 1 detik. Saat `done`, tampilkan "Acara telah berlangsung".
  - `MusicToggle` melayang di kanan bawah dengan `aria-label` "Putar musik"/"Jeda musik". Kegagalan memuat audio diabaikan diam-diam.
  - `GalleryLightbox`: klik untuk membuka; Esc, tombol ×, dan panah ←/→ berfungsi.
  - `CopyButton` memakai `navigator.clipboard`, dengan fallback `textarea` + `execCommand('copy')`. Label berubah menjadi "Tersalin" selama 2 detik.
- [ ] **Step 2: Verifikasi.** `npm test && npm run build` harus sukses. Di `npm run dev`, cek di lebar 360px:
  - Sampul mengunci scroll.
  - "Buka Undangan" memutar musik.
  - Hitung mundur berjalan.
  - Lightbox dan tombol salin rekening berfungsi.
  - Konsol bebas error hydration.
- [ ] **Step 3: Commit** dengan pesan `feat: sampul, musik, hitung mundur, galeri, salin`.

### Task 9: RSVP & ucapan

**Files:** Create `src/lib/guest-actions.ts`, `src/app/[slug]/actions.ts`, `src/components/invitation/{RsvpForm,WishesSection}.tsx`. Test: `tests/unit/guest-actions.test.ts`

**Interfaces:**
- Consumes: `rsvpSchema`, `wishSchema`, `fieldErrors`, `FormState` (Task 4), `createPublicSupabase` (Task 6).
- Produces:
  - `handleRsvp(fd: FormData, insert: (row: Omit<Rsvp, 'id' | 'created_at'>) => Promise<{ error: unknown }>): Promise<FormState>`.
  - `handleWish(fd: FormData, insert: (row: Pick<Wish, 'invitation_id' | 'name' | 'message'>) => Promise<{ error: unknown }>): Promise<FormState>`.
  - Server action `submitRsvp(prev, fd)` dan `submitWish(prev, fd)` (membungkus fungsi di atas + `revalidatePath('/' + slug)`).
  - Field formulir: `invitation_id`, `slug`, `g`, `name`, `attendance`, `party_size`, `message`, dan honeypot `website`.

- [ ] **Step 1: Tulis tes yang gagal:**
  - `honeypot terisi → status ok, insert tidak dipanggil`
  - `input tidak valid → status error, fieldErrors.name, values dikembalikan, insert tidak dipanggil`
  - `insert gagal → { status: 'error', message: 'Gagal mengirim, coba lagi' } dan values utuh`
  - `sukses → insert dipanggil dengan { invitation_id, guest_code: 'ab12cd', name: 'Joko', attendance: 'hadir', party_size: 2 }`
  - `g tidak cocok /^[a-z0-9]{6}$/ → guest_code null`
  - Kasus yang sama untuk `handleWish`.
- [ ] **Step 2: `npm test`.** Hasil yang diharapkan: GAGAL.
- [ ] **Step 3: Implementasi.**
  - Formulir memakai `useActionState`. Tombol dinonaktifkan saat pending, dan input `defaultValue` diambil dari `state.values`.
  - RSVP sukses menampilkan "Terima kasih, konfirmasi Anda sudah kami terima" lalu menyembunyikan formulir. Ada tautan "Ubah jawaban" untuk menampilkannya lagi.
  - Nama diisi otomatis dari `guestName`.
  - Jumlah orang disembunyikan bila memilih "Tidak hadir".
  - Daftar ucapan menampilkan 50 terbaru (nama, pesan, waktu relatif, misalnya "3 jam lalu").
- [ ] **Step 4: `npm test`, lalu kirim RSVP dan ucapan dari `/demo-budi-ani`.** Hasil yang diharapkan: tes LULUS, baris tersimpan (cek lewat Table Editor di dashboard Supabase), dan ucapan langsung tampil.
- [ ] **Step 5: Commit** dengan pesan `feat: RSVP dan ucapan tamu`.

### Task 10: Tema Modern

**Files:** Modify `src/themes/index.ts`, `src/app/globals.css`. Test: tambahkan ke `tests/unit/invitation-view.test.tsx`.

- [ ] **Step 1: Tulis tes yang gagal:**
  - `expect(Object.keys(THEMES)).toEqual(['elegan', 'modern'])`
  - `html({ theme: 'modern' })` berisi `data-theme="modern"`.
- [ ] **Step 2: Implementasi** token Modern: latar `#ffffff`, aksen `#1f2937`, aksen sekunder `#e5e7eb`, heading Montserrat, body Inter. Sampul memakai foto penuh dengan overlay gelap.
- [ ] **Step 3: `npm test`, lalu ganti tema demo ke `modern` dengan `npm run db:seed -- --theme modern` dan cek di 360px.** Hasil yang diharapkan: LULUS, dan semua bagian terbaca jelas.
- [ ] **Step 4: Commit** dengan pesan `feat: tema Modern`.

### Task 11: Admin: daftar, buat/ubah, terbitkan, pratinjau, duplikat

**Files:**
- Create:
  - `src/lib/data/admin.ts`
  - `src/app/admin/page.tsx`, `src/app/admin/new/page.tsx`
  - `src/app/admin/[id]/{edit/page.tsx,preview/page.tsx,actions.ts}`
  - `src/components/admin/{InvitationForm,EventsEditor,AdminNav}.tsx`
- Test: `tests/unit/admin-errors.test.ts`

**Interfaces:**
- Consumes: `requireAdmin` (Task 6), skema dan `canPublish` (Task 4), `slugify`/`nextAvailableSlug` (Task 1), `InvitationView` (Task 7).
- Produces:
  - Dari `data/admin.ts` (semua menerima `supabase` dari `requireAdmin`):
    - `listInvitations(sb, search?: string): Promise<(Invitation & { rsvp_count: number })[]>`
    - `getInvitation(sb, id): Promise<InvitationFull | null>`
    - `saveInvitation(sb, input, id?): Promise<{ id: string }>`
    - `replaceEvents(sb, id, events)`
    - `setStatus(sb, id, status)`
    - `duplicateInvitation(sb, id): Promise<{ id: string }>`
    - `mapDbError(e: { code?: string }): Record<string, string> | string`
  - `AdminNav({ id })`: tab Data · Media & Amplop · Tamu · RSVP & Ucapan · Pratinjau. Tab ini dipakai di Task 12–14.

- [ ] **Step 1: Tulis tes yang gagal:**
  - `expect(mapDbError({ code: '23505' })).toEqual({ slug: 'Alamat ini sudah dipakai undangan lain' })`
  - `expect(mapDbError({ code: 'x' })).toBe('Gagal menyimpan, coba lagi')`
- [ ] **Step 2: `npm test`.** Hasil yang diharapkan: GAGAL. **Step 3:** implementasi `mapDbError`, lalu `npm test` LULUS.
- [ ] **Step 4: Implementasi halaman.**
  - **Daftar undangan:** kotak cari (nama/slug) dan kartu per undangan (nama panggilan, slug, badge Draft/Terbit, jumlah RSVP), dengan tombol Lihat, Edit, dan Duplikat.
  - **Formulir:** seksi Mempelai, Acara (tambah/hapus/urutkan dengan tombol naik/turun; dikirim sebagai JSON di input tersembunyi `events`), Tema & Zona Waktu, dan Kata Pembuka.
    - Slug otomatis dari `slugify(groom_nickname + ' ' + bride_nickname)` sampai diedit manual. Pratinjau alamat ditampilkan di bawahnya.
    - Error per field berasal dari `FormState.fieldErrors`.
    - Simpan menampilkan "Tersimpan".
  - **Terbitkan:** tombol "Terbitkan" dan "Jadikan Draft". Bila `canPublish` mengembalikan pesan, tampilkan pesan itu.
  - **Pratinjau:** merender `InvitationView` dengan `preview` (banner "Mode pratinjau"), juga untuk draft.
  - **Duplikat:** menyalin undangan, acara, galeri, dan amplop dengan slug `nextAvailableSlug(slug + '-salinan', ...)` dan status draft.
- [ ] **Step 5: Verifikasi manual.**
  - Buat undangan baru dari nol, coba simpan dengan slug `demo-budi-ani` (harus muncul error), lalu terbitkan tanpa acara (harus ditolak).
  - Tambah acara, terbitkan, lalu buka `/{slug}`.
  - Duplikat menghasilkan draft `-salinan`.
- [ ] **Step 6: Commit** dengan pesan `feat: admin kelola undangan`.

### Task 12: Admin: foto, musik, galeri, amplop

**Files:** Create `src/app/admin/[id]/media/page.tsx`, `src/components/admin/{ImageUpload,MusicUpload,GalleryManager,GiftsEditor}.tsx`, `src/lib/storage.ts`. Modify `src/lib/data/admin.ts`, `src/app/admin/[id]/actions.ts`.

**Interfaces:**
- Consumes: `checkUpload`, `giftSchema` (Task 4), `createBrowserSupabase` (Task 6).
- Produces:
  - `uploadMedia(file: File, invitationId: string, kind: 'photo' | 'music'): Promise<{ url: string } | { error: string }>`: kompres foto (`maxWidthOrHeight: 1920`, `maxSizeMB: 1`), lalu `checkUpload`, lalu unggah ke `media/{invitationId}/{uuid}.{ext}` dan mengembalikan URL publik.
  - `addGalleryPhotos(sb, id, urls)`, `deleteGalleryPhoto(sb, photoId)` (hanya baris), `replaceGifts(sb, id, gifts)`, `setMediaFields(sb, id, { groom_photo_url?, bride_photo_url?, cover_photo_url?, music_url? })`.

- [ ] **Step 1: Implementasi.**
  - Foto sampul, foto mempelai, dan musik masing-masing punya pratinjau dan tombol "Ganti"/"Hapus".
  - Galeri mendukung unggah banyak foto sekaligus dengan progres per foto. Bila melebihi 30 foto: `Maksimal 30 foto galeri`.
  - Gagal decode (mis. HEIC): `Format foto tidak didukung, gunakan JPG atau PNG`.
  - Editor amplop berupa daftar bank/e-wallet, nomor, dan atas nama (JSON tersembunyi `gifts`).
- [ ] **Step 2: Verifikasi manual.**
  - Unggah foto HP 4–8 MB berhasil (terkompres).
  - File WAV ditolak dengan pesan yang benar.
  - Halaman tamu menampilkan galeri, musik, dan rekening baru.
- [ ] **Step 3: Commit** dengan pesan `feat: admin media dan amplop`.

### Task 13: Admin: daftar tamu & kirim WA

**Files:** Create `src/app/admin/[id]/guests/page.tsx`, `src/components/admin/{GuestPaste,GuestTable}.tsx`. Modify `data/admin.ts`, `actions.ts`.

**Interfaces:**
- Consumes: `parseGuestList` (Task 4), `guestCode`, `guestLink`, `waMessage`, `waShareUrl` (Task 2), `CopyButton` (Task 8).
- Produces: `listGuests(sb, id): Promise<Guest[]>`, `addGuests(sb, id, guests: { name; phone }[]): Promise<{ added: number }>` (kode bentrok `23505` dicoba ulang sekali), `deleteGuest(sb, guestId)`.

- [ ] **Step 1: Implementasi.**
  - Textarea "Tempel daftar nama (satu per baris, nomor WA opsional setelah koma)". Batas: `Maksimal 500 tamu sekali tempel`. Hasil: "{n} tamu ditambahkan, {d} duplikat dilewati".
  - Tabel tamu dengan nama, nomor, "Salin link", "Kirim WA" (membuka `waShareUrl(phone, waMessage(...))` di tab baru), dan "Hapus" dengan konfirmasi.
  - Di atas tabel ada "Link umum" (tanpa nama) dengan tombol salin.
  - Base URL diambil dari `NEXT_PUBLIC_SITE_URL`.
- [ ] **Step 2: Verifikasi manual.**
  - Tempel 5 nama (1 duplikat, 1 dengan nomor).
  - "Kirim WA" membuka `wa.me` berisi pesan dan link `?to=…&g=…`.
  - Link tersebut menampilkan nama tamu yang benar.
- [ ] **Step 3: Commit** dengan pesan `feat: admin daftar tamu dan kirim WA`.

### Task 14: Admin: rekap RSVP, ucapan, CSV

**Files:** Create `src/app/admin/[id]/responses/{page.tsx,rsvp.csv/route.ts}`. Modify `data/admin.ts`, `actions.ts`.

**Interfaces:**
- Consumes: `summarizeRsvps`, `rsvpCsv` (Task 3), `requireAdmin` (Task 6).
- Produces: `listRsvps(sb, id): Promise<Rsvp[]>` (terbaru dulu), `listAllWishes(sb, id): Promise<Wish[]>`, `setWishHidden(sb, wishId, hidden: boolean)`.

- [ ] **Step 1: Implementasi.**
  - Kartu ringkasan: Hadir, Tidak Hadir, Masih Ragu, Total Orang.
  - Tabel RSVP dengan waktu dalam zona undangan.
  - Tombol "Unduh CSV" mengarah ke `GET /admin/{id}/responses/rsvp.csv`. Route ini memanggil `requireAdmin` dan mengembalikan `text/csv; charset=utf-8` dengan `Content-Disposition: attachment; filename="rsvp-{slug}.csv"`.
  - Tabel ucapan dengan tombol "Sembunyikan"/"Tampilkan".
- [ ] **Step 2: Verifikasi.**
  - Buka URL CSV di jendela privat (tanpa login): harus dialihkan ke halaman login.
  - Unduh CSV saat login dan buka di Excel/Sheets: kolom terpisah rapi.
  - Ucapan yang disembunyikan hilang dari halaman tamu.
- [ ] **Step 3: Commit** dengan pesan `feat: admin rekap RSVP, ucapan, CSV`.

### Task 15: Tes E2E smoke + panduan deploy

**Files:** Create `e2e/smoke.spec.ts`, `docs/deploy.md`. Modify `README.md`.

- [ ] **Step 1: Tulis `e2e/smoke.spec.ts`** (Playwright, viewport 360×740, `webServer: npm run dev`):
  - Login dengan `E2E_ADMIN_*`, buat undangan slug `e2e-{timestamp}` dengan 1 acara, lalu terbitkan.
  - Tambah tamu "Pak Tes", ambil link-nya, buka sebagai tamu, dan pastikan teks "Pak Tes" tampil.
  - Klik "Buka Undangan", kirim RSVP hadir 2 orang dan satu ucapan. Ucapan harus tampil.
  - Kembali ke admin, buka "RSVP & Ucapan": "Pak Tes" tampil dan Total Orang = 2.
  - Ambil screenshot langkah-langkah admin ke `docs/img/`.
  - `afterAll` menghapus undangan uji via service role.
- [ ] **Step 2: `npm run e2e`.** Hasil yang diharapkan: 1 passed.
- [ ] **Step 3: Tulis `docs/deploy.md`** untuk pembaca non-teknis:
  - (1) Supabase: buat proyek, salin kunci, matikan signup, buat user admin, `npm run db:push` dan `make-admin`.
  - (2) GitHub: buat repo `undangan-digital` di akun randysilvio lalu push.
  - (3) Vercel: Import Project dan isi environment variable (tanpa `SUPABASE_SERVICE_ROLE_KEY`), lalu deploy dan ubah `NEXT_PUBLIC_SITE_URL`.
  - (4) Cara membuat undangan pertama, dengan screenshot dari `docs/img/`.
  - (5) Memasang domain sendiri nanti.
- [ ] **Step 4: Verifikasi akhir.** `npm test && npm run lint && npm run build && npm run e2e` harus semuanya sukses.
- [ ] **Step 5: Commit** dengan pesan `test: smoke E2E dan panduan deploy`.
