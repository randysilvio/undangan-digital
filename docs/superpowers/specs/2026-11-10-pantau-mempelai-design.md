# Rancangan: Link Pantau Mempelai

Tanggal: 2026-11-10 · Lanjutan dari [rancangan tahap 1](2026-11-10-undangan-digital-design.md)

## 1. Tujuan

Mempelai bisa memantau perkembangan RSVP undangannya sendiri, tanpa akun dan tanpa login, sehingga
tidak perlu bertanya ke admin.

**Yang dinyatakan pengguna:**
- Mempelai hanya **melihat**; tidak bisa mengubah apa pun.
- Yang tampil hanya **rekap angka**: Hadir, Tidak Hadir, Masih Ragu, Total Orang.
- Angka menyegarkan otomatis kira-kira tiap 1 menit.
- Akses lewat **link rahasia**: satu link per undangan, dipakai bersama kedua mempelai.
- Fitur ini selesai dulu, baru seluruh aplikasi di-deploy.

**Asumsi:**
- Admin yang membuat link dan mengirimkannya ke mempelai (lewat WA atau salin).
- Angka di halaman mempelai harus selalu sama dengan rekap di panel admin.

**Kriteria berhasil:**
- Admin bisa membuat link dan mengirimkannya ke mempelai dalam kurang dari 30 detik.
- Mempelai membuka link di HP (lebar 360px) dan langsung melihat 4 angka tanpa langkah lain.
- RSVP baru dari tamu terlihat di halaman mempelai paling lambat ±60 detik selama halaman terbuka.
- Link yang dibuat ulang atau dimatikan langsung tidak berlaku.
- Tidak ada nama, nomor HP, atau isi ucapan tamu yang bisa diambil lewat link pantau, termasuk lewat
  pemanggilan API langsung.

**Di luar cakupan:** mempelai mengelola tamu atau ucapan, PIN, login mempelai, pembaruan realtime
(seketika), notifikasi.

## 2. Data & keamanan

### Tabel `invitation_monitor_links`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `invitation_id` | uuid, primary key | references `invitations(id)` on delete cascade |
| `token` | text, unique, not null | check `token ~ '^[A-Za-z0-9_-]{32}$'` |
| `created_at` | timestamptz, not null, default `now()` | |

- RLS aktif; satu policy `admin_all` (sama dengan tabel lain): akses penuh hanya untuk `is_admin()`.
- **Tidak ada** grant untuk `anon`. `authenticated` mendapat grant seperti tabel lain (dibatasi RLS).
- Satu undangan maksimal satu link (primary key). Tidak ada baris = link mati.
- Kode disimpan apa adanya (tidak di-hash) agar admin bisa menyalinnya lagi kapan saja. Bila database
  bocor, yang terbuka hanya akses ke 4 angka.

**Kenapa tabel terpisah, bukan kolom di `invitations`:** `invitations` bisa dibaca publik untuk
undangan terbit (policy `public_read` dan grant select tingkat tabel), sehingga kolom kode akan ikut
terbaca siapa saja. Menutup satu kolom berarti mengganti grant tingkat tabel dengan grant per kolom,
yang mematahkan query `select('*')` di halaman tamu.

### Fungsi `public.monitor_summary(p_token text)`

`security definer`, `stable`, `set search_path = ''`. `revoke execute ... from public`, lalu
`grant execute ... to anon, authenticated`.

Mengembalikan **nol baris** bila kode tidak ditemukan. Bila ditemukan, satu baris:

| Kolom | Isi |
|---|---|
| `groom_nickname`, `bride_nickname` | dari undangan |
| `theme` | tema undangan (`elegan` / `modern`) |
| `timezone` | zona waktu undangan |
| `status` | `draft` / `published` |
| `hadir`, `tidak`, `ragu`, `total_orang` | integer |

Aturan hitung harus identik dengan `summarizeRsvps` di `src/lib/rsvp.ts`:
- Kunci responden: `'kode:' || guest_code` bila `guest_code` tidak null, selain itu
  `'nama:' || lower(trim(name))`. `trim` di JS membuang semua whitespace, jadi di SQL pakai
  `regexp_replace(name, '^\s+|\s+$', '', 'g')`.
- Per kunci, ambil baris dengan `created_at` terbaru (`distinct on`, urut `created_at desc, id`).
- `total_orang` = jumlah `party_size` dari jawaban terbaru yang `hadir`.

Undangan draft tetap mengembalikan hasil (biasanya semua 0).

**Kode link:** 24 byte acak dari `crypto.randomBytes`, dikodekan base64url menjadi 32 karakter
(±192 bit). Dibuat di server action, tidak pernah di browser. Kode sepanjang ini tidak bisa ditebak,
jadi tidak perlu pembatas percobaan.

Migrasi baru: `supabase/migrations/20261111000000_monitor_links.sql`.

## 3. Panel admin

Kotak **"Link Pantau Mempelai"** di tab **RSVP & Ucapan** (`/admin/[id]/responses`), di atas kartu
rekap. Komponen klien `MonitorLinkCard`.

- **Belum ada link:** satu kalimat penjelasan + tombol **Buat link**.
- **Sudah ada link:** link lengkap (`SITE_URL/pantau/<kode>`) + tombol:
  - **Salin** (pakai `CopyButton` yang sudah ada)
  - **Kirim WA**: `waShareUrl(null, pesan)`, sehingga WhatsApp membuka pemilih kontak. Pesan berisi
    sapaan, nama pasangan, link, dan keterangan bahwa link ini pribadi.
  - **Buat ulang**: `confirm()` lebih dulu ("Link lama tidak akan berlaku lagi"), lalu kode baru.
  - **Matikan**: `confirm()` lebih dulu, lalu baris dihapus.

Server action baru di `src/app/admin/(panel)/monitor-actions.ts`: `createMonitorLink(id)` (sekaligus
untuk buat ulang, lewat upsert), `disableMonitorLink(id)`. Keduanya memanggil `requireAdmin()` lalu
`refresh()`, sama seperti action lain di folder itu. `duplicateInvitation` **tidak** menyalin link
pantau: undangan hasil duplikat mulai tanpa link. Fungsi data di `src/lib/data/admin.ts`: `getMonitorLink`,
`upsertMonitorLink`, `deleteMonitorLink`. Pembuat kode dan pembuat pesan WA ada di `src/lib/monitor.ts`
(murni, bisa diuji unit).

## 4. Halaman mempelai `/pantau/[token]`

- Rute `src/app/pantau/[token]/page.tsx`, di luar `/admin`, jadi proxy login tidak berlaku.
- Format kode dicek dulu (`/^[A-Za-z0-9_-]{32}$/`). Bila format salah, langsung tampil halaman "tidak
  berlaku" tanpa memanggil database.
- Data dari `createPublicSupabase().rpc('monitor_summary', { p_token })` di server component di dalam
  `<Suspense>`. Tanpa service key.
- Nol baris → `notFound()` dengan `not-found.tsx` khusus: *"Link tidak berlaku. Hubungi penyedia
  undangan Anda."*
- Tampilan: `data-theme` mengikuti tema undangan. Judul "Budi & Ani", subjudul "Rekap Kehadiran
  Tamu", grid 2×2 kartu angka, label "Belum terbit" bila draft, baris "Diperbarui HH.mm WIT ·
  menyegarkan otomatis" (pakai zona waktu undangan).
- Komponen klien `AutoRefresh`: `router.refresh()` tiap 60 detik **hanya saat
  `document.visibilityState === 'visible'`**, dan sekali saat halaman kembali terlihat.
- Metadata: `robots: { index: false, follow: false }`, `referrer: 'no-referrer'`, judul
  "Rekap Kehadiran". Tidak ada tautan keluar dari halaman ini.

## 5. Penanganan galat

| Keadaan | Hasil |
|---|---|
| Kode salah format / tidak ada / sudah dimatikan | Halaman "Link tidak berlaku" |
| Database gagal saat muat pertama | `error.tsx` yang sudah ada |
| Database gagal saat penyegaran otomatis | Angka lama tetap tampil; dicoba lagi di siklus berikutnya |
| Aksi admin gagal (buat/matikan) | Pesan galat di kotak, pola `Notice` yang sudah ada |
| Undangan dihapus | Baris link ikut terhapus (cascade), link tidak berlaku |

## 6. Pengujian

**Unit (`vitest`)**
- `monitorToken()`: panjang 32, hanya karakter base64url, dua panggilan menghasilkan nilai berbeda.
- `monitorWaMessage()`: memuat nama pasangan dan link.

**Database (`test:db`, terhadap Supabase lokal)**
- Anon tidak bisa `select` dari `invitation_monitor_links`; user login non-admin juga tidak.
- `monitor_summary` dengan kode salah → nol baris.
- `monitor_summary` dengan kode benar mengembalikan angka **sama dengan `summarizeRsvps`** pada data
  yang sama, termasuk: jawaban yang diganti (kode tamu sama), nama beda huruf besar/kecil dan spasi
  di tepi, tamu `tidak`/`ragu`, `party_size` > 1.
- Setelah kode diganti, kode lama → nol baris.
- Hasil fungsi tidak memuat kolom nama atau kode tamu.

**E2E (`smoke.spec.ts`, diperluas)**
- Admin membuat link pantau, lalu tamu mengisi RSVP, lalu halaman `/pantau/<kode>` menampilkan
  Hadir 1 dan Total Orang sesuai jumlah yang diisi.
- Admin klik **Buat ulang** → link lama menampilkan "Link tidak berlaku".
- Screenshot `docs/img/07-pantau.png` (lebar HP) untuk panduan.

## 7. Dokumentasi

`docs/deploy.md`, bagian penggunaan: cara membuat dan mengirim link pantau, serta kapan memakai
**Buat ulang**.
