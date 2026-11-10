# Undangan Digital

Web undangan pernikahan digital untuk bisnis jasa undangan. Admin (pemilik bisnis) membuat undangan
tiap pasangan lewat formulir, dan setiap tamu menerima link pribadi berisi namanya.

**Fitur:**
- **Halaman tamu:** sampul bernama tamu, musik, hitung mundur, acara + peta + simpan ke kalender,
  galeri, amplop digital, RSVP, ucapan.
- **Tema:** Elegan dan Modern.
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

Rancangan: [docs/superpowers/specs/2026-11-10-undangan-digital-design.md](docs/superpowers/specs/2026-11-10-undangan-digital-design.md)
