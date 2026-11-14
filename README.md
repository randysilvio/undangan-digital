# Valynz.id

Web undangan digital untuk jasa pembuatan undangan Valynz.id: pernikahan, ulang tahun anak, sweet seventeen,
ulang tahun dewasa, dan syukuran usia emas. Admin (pemilik bisnis) membuat undangan lewat formulir,
dan setiap tamu menerima link pribadi berisi namanya.

**Fitur:**
- **Halaman tamu:** sampul bernama tamu, musik, hitung mundur, acara + peta + simpan ke kalender,
  galeri, cerita/perjalanan hidup, keluarga, dress code, amplop digital, RSVP, ucapan. Animasi muncul
  saat digulir, partikel per tema (kelopak, daun, balon, serbuk emas), dan konfeti untuk ulang tahun.
- **Tema:** Elegan, Modern, Botani, Mewah, Ceria, dan Pastel, masing-masing dengan ornamen sendiri,
  plus **Tema Saya**: warna, huruf, dan gambar hiasan unggahan admin.
- **Halaman publik:** galeri tema, contoh undangan, paket harga, kontak WhatsApp, tanya jawab, SEO.
- **Panel admin:** buat/ubah/duplikat/terbitkan undangan, unggah foto & musik, daftar tamu +
  tombol kirim WhatsApp, rekap RSVP + unduh CSV, moderasi ucapan.

**Teknologi:** Next.js 16, Supabase (database, login, penyimpanan file), Tailwind CSS. Hosting di
Vercel. Semuanya dengan paket gratis.

## Mulai

Panduan langkah demi langkah ada di **[docs/deploy.md](docs/deploy.md)**.

```bash
npm install
npm run dev        # http://localhost:3000/admin
npm test           # tes unit
npm run test:db    # tes keamanan database (perlu .env.local)
npm run e2e        # tes menyeluruh di browser (perlu .env.local)
```
