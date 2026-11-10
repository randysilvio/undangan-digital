# Rancangan: Web Undangan Digital Pernikahan (Tahap 1)

Tanggal: 2026-11-10

## 1. Tujuan

Pemilik bisnis jasa undangan digital (satu orang, tanpa latar belakang coding) dapat membuat
undangan pernikahan online untuk tiap klien lewat formulir, lalu membagikan link pribadi ke setiap
tamu. Tamu melihat undangan, mengisi RSVP, dan mengirim ucapan.

**Yang dinyatakan pengguna:**
- Untuk bisnis, bukan satu pernikahan.
- Undangan dibuat oleh pemilik sendiri; klien tidak punya login.
- Data diisi lewat formulir, bukan dengan mengedit file atau kode.
- Hosting: gratis dulu dengan Vercel + Supabase (hosting kantor tidak dipakai).

**Asumsi (silakan koreksi):**
- Hanya ada satu akun admin, yaitu pemilik.
- Bahasa tampilan: Bahasa Indonesia.
- Mulai dengan 2 tema; tema baru ditambahkan oleh developer.
- Link sementara memakai domain gratis Vercel (`xxx.vercel.app/nama-pasangan`), lalu dipindah ke
  domain sendiri kalau sudah dibeli.

**Kriteria berhasil:**
- Admin bisa membuat undangan lengkap dari nol hingga terbit dalam waktu kurang dari 15 menit,
  hanya lewat formulir.
- Tamu membuka link `.../budi-ani?to=Pak+Joko` di HP, lalu melihat namanya, detail acara, peta,
  dan galeri, serta bisa mengisi RSVP dan ucapan.
- Admin melihat rekap RSVP dan bisa mengunduhnya sebagai CSV.
- Biaya operasional Rp0 (paket gratis Vercel + Supabase).

## 2. Di luar lingkup (Tahap 1)

Login klien, pembayaran online, paket harga, editor tema visual, domain khusus per klien,
pengiriman WhatsApp otomatis (cukup tombol "salin pesan" / buka `wa.me`), multi-bahasa.

## 3. Arsitektur

```
Tamu (HP) ──> Next.js di Vercel ──> Supabase
                │                     ├─ Postgres (data undangan, tamu, RSVP, ucapan)
Admin ────────> /admin (login)        ├─ Auth (login admin, email + password)
                                      └─ Storage (foto, musik)
```

- **Next.js (App Router, TypeScript)** + **Tailwind CSS**.
- **Supabase**: database, login admin, dan penyimpanan file.
- Halaman undangan dirender di server agar cepat terbuka dan pratinjau link di WhatsApp
  menampilkan judul serta foto (Open Graph).
- **Row Level Security (RLS)**:
  - Publik hanya boleh membaca undangan berstatus `published`, menambah RSVP dan ucapan, serta
    membaca ucapan undangan yang sudah terbit.
  - Admin (pengguna yang login) mendapat akses penuh.

## 4. Model data

| Tabel | Kolom utama |
|---|---|
| `invitations` | id, slug (unik, untuk URL), status (`draft`/`published`), theme, nama & nama panggilan mempelai pria/wanita, nama orang tua, foto mempelai, foto sampul, ayat/kutipan pembuka, musik_url, created_at |
| `events` | id, invitation_id, nama (Akad / Pemberkatan / Resepsi), tanggal, jam mulai–selesai, nama tempat, alamat, link Google Maps |
| `gallery_photos` | id, invitation_id, url, urutan |
| `gift_accounts` | id, invitation_id, bank/e-wallet, nomor rekening, atas nama |
| `guests` | id, invitation_id, nama, no_wa (opsional), kode unik |
| `rsvps` | id, invitation_id, guest_id (opsional), nama, kehadiran (hadir/tidak/ragu), jumlah orang, created_at |
| `wishes` | id, invitation_id, nama, pesan, created_at, hidden (admin bisa menyembunyikan) |

## 5. Halaman tamu: `/[slug]?to=Nama`

Urutan bagian (semua opsional kecuali sampul dan acara; bagian tanpa data disembunyikan):
1. **Sampul**: "Kepada Yth. {nama tamu}", tombol **Buka Undangan** (memulai musik).
2. **Pembuka**: ayat atau kutipan.
3. **Mempelai**: foto, nama, dan orang tua.
4. **Hitung mundur** menuju acara pertama, plus tombol **Simpan ke Google Calendar**.
5. **Acara**: kartu per acara dengan tombol **Lihat Peta**.
6. **Galeri** foto (klik untuk memperbesar).
7. **Amplop digital**: daftar rekening dengan tombol **Salin**.
8. **RSVP**: formulir (nama sudah terisi dari link).
9. **Ucapan & doa**: formulir dan daftar ucapan terbaru.
10. **Penutup** dan tombol musik (putar/jeda) yang melayang.

Nama tamu dari `?to=` hanya ditampilkan sebagai teks (di-escape), tidak pernah dirender sebagai HTML.
Undangan dengan status `draft` atau slug yang tidak ada akan menampilkan halaman 404.

**Tema**: setiap tema adalah satu set komponen dengan data yang sama. Tahap 1 berisi
`elegan` (krem-emas, serif) dan `modern` (minimalis, sans-serif).

## 6. Panel admin: `/admin`

- **Login** dengan email + password (akun dibuat sekali di dashboard Supabase).
- **Daftar undangan**: cari, status, jumlah RSVP, serta tombol Lihat, Edit, dan Duplikat.
- **Formulir undangan** (dibagi per tab): Mempelai · Acara (tambah/hapus) · Galeri (unggah banyak
  foto) · Amplop · Musik & Tema · Terbitkan. Ada tombol **Pratinjau** dan validasi bahasa
  Indonesia (contoh: "Slug sudah dipakai").
- **Tamu**: tambah satu per satu atau tempel daftar nama (satu per baris). Tiap tamu punya tombol
  **Salin link** dan **Kirim WA**, yang membuka `wa.me` dengan template pesan berisi link pribadi.
- **RSVP & Ucapan**: tabel, ringkasan (total hadir/tidak/jumlah orang), **Unduh CSV**, dan tombol
  sembunyikan ucapan yang tidak pantas.

## 7. Penanganan error

- Formulir menampilkan pesan error per kolom; unggahan dibatasi (foto ≤ 5 MB dan dikompres di
  browser, musik ≤ 10 MB).
- Kiriman RSVP atau ucapan yang gagal menampilkan pesan "Gagal mengirim, coba lagi" tanpa menghapus
  isian. Ada batas panjang teks dan honeypot sederhana untuk menahan spam.
- Halaman tamu tetap tampil walaupun foto atau musik gagal dimuat.

## 8. Pengujian

- **Vitest**: fungsi murni (pembuatan slug, link tamu, template pesan WA, link Google Calendar,
  hitung mundur, ekspor CSV, validasi formulir).
- **Playwright** (smoke): admin login → membuat undangan → terbit → tamu membuka link → kirim
  RSVP dan ucapan → RSVP tampil di admin.
- Kebijakan RLS diuji dengan skrip SQL: pengguna anonim tidak bisa membaca draft atau mengubah data.

## 9. Deploy

1. Membuat proyek Supabase (gratis), lalu menjalankan migrasi SQL dari repo.
2. Push repo ke GitHub, lalu impor ke Vercel dan isi environment variable Supabase.
3. Membuat akun admin di Supabase Auth.
4. Panduan langkah demi langkah dengan screenshot ditulis di `docs/deploy.md` untuk pengguna
   non-teknis.
