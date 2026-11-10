# Link Pantau Mempelai Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mempelai membuka satu link rahasia per undangan dan melihat 4 angka rekap RSVP yang menyegarkan sendiri, tanpa login.

**Architecture:** Kode link disimpan di tabel khusus admin (`invitation_monitor_links`). Halaman publik `/pantau/[token]` memanggil fungsi Postgres `security definer` `monitor_summary(p_token)` lewat klien anon; fungsi itu hanya mengembalikan angka, sehingga nama tamu tidak pernah keluar dari database. Admin mengelola link dari tab RSVP & Ucapan lewat server action.

**Tech Stack:** Next.js 16 (App Router, `cacheComponents`), Supabase (Postgres + RLS, `@supabase/supabase-js`), Tailwind 4, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-10-pantau-mempelai-design.md`

## Global Constraints

- Kode link: 24 byte `crypto.randomBytes` → base64url → tepat 32 karakter; regex `^[A-Za-z0-9_-]{32}$` (sama di SQL dan TS).
- Aplikasi tidak memakai service key di runtime. Halaman pantau memakai `createPublicSupabase()`.
- Fungsi `monitor_summary`: `security definer`, `stable`, `set search_path = ''`, `revoke execute from public`, `grant execute to anon, authenticated`.
- Tabel `invitation_monitor_links`: `revoke all from anon` eksplisit; `grant select, insert, update, delete to authenticated`; RLS policy `admin_all` memakai `(select public.is_admin())`.
- Aturan hitung identik dengan `summarizeRsvps` (`src/lib/rsvp.ts`): kunci `kode:<guest_code>` atau `nama:<lower(trim(name))>`; ambil `created_at` terbaru; `total_orang` = jumlah `party_size` dari jawaban terbaru `hadir`.
- Jangan panggil `new Date()`/`Date.now()` saat render server; jam "Diperbarui" berasal dari `generated_at`.
- Penyegaran otomatis: 60 000 ms, hanya saat `document.visibilityState === 'visible'`, plus sekali saat halaman kembali terlihat.
- Metadata halaman pantau: `title: 'Rekap Kehadiran'`, `robots: { index: false, follow: false }`, `referrer: 'no-referrer'`.
- Server action admin mengikuti pola folder: `requireAdmin()` lalu `refresh()` dari `next/cache`.
- Teks UI dalam Bahasa Indonesia, persis seperti di spec: "Link Pantau Mempelai", "Buat link", "Salin", "Kirim WA", "Buat ulang", "Matikan", "Rekap Kehadiran Tamu", "Belum terbit", "Link tidak berlaku. Hubungi penyedia undangan Anda.", "Diperbarui HH.mm <WIB|WITA|WIT> · menyegarkan otomatis".

## Review Focus

- Nama tamu dengan tab/newline/spasi di tepi dan beda huruf besar (`'  ani\t'` vs `'Ani'`) harus dihitung sebagai satu responden, sama seperti TS. → tes paritas Task 1.
- Undangan tanpa RSVP sama sekali harus mengembalikan satu baris berisi angka 0, bukan nol baris (nol baris berarti "link tidak berlaku"). → Task 1.
- Default privileges Supabase diam-diam memberi `anon` hak pada tabel baru, sehingga anon bisa membaca kode. → Task 1 menguji select **dan** insert anon.
- Kode di URL dengan panjang 31/33 atau karakter `+`/`/`/`=` harus langsung "tidak berlaku" tanpa memanggil database. → Task 2 (regex) dan Task 4 (halaman).
- Admin membuat ulang link saat mempelai sedang membuka halaman: link lama harus berhenti berlaku pada muat berikutnya. → Task 5 (E2E).

---

### Task 1: Migrasi database + tes database

**Files:**
- Create: `supabase/migrations/20261111000000_monitor_links.sql`
- Create: `tests/db/monitor.test.ts`

**Interfaces:**
- Produces: tabel `public.invitation_monitor_links(invitation_id uuid pk → invitations on delete cascade, token text unique not null check regex, created_at timestamptz not null default now())`.
- Produces: `public.monitor_summary(p_token text) returns table(groom_nickname text, bride_nickname text, theme text, timezone text, status text, hadir int, tidak int, ragu int, total_orang int, generated_at timestamptz)`.

- [ ] **Step 1: Tulis tes yang gagal** di `tests/db/monitor.test.ts`, dengan pola setup dari `tests/db/rls.test.ts` (`describe.skipIf` tanpa env, klien `service`/`anon`/`user` non-admin, `afterAll` menghapus undangan dan user). Setiap insert setup **wajib** dicek errornya, dan setiap baris dalam satu bulk insert harus punya kunci yang sama.
  Data: satu undangan terbit dengan link `tokenA` (32 karakter valid), satu undangan draft dengan link `tokenDraft` dan tanpa RSVP. RSVP undangan terbit (insert lewat service dengan `created_at` eksplisit, `guest_code` diisi `null` bila tidak dipakai):
  - `guest_code 'kode01'`, hadir, 2, `T+0`; `guest_code 'kode01'`, tidak, 1, `T+1` (menggantikan)
  - `name '  ani\t'`, ragu, 1, `T+0`; `name 'Ani'`, hadir, 3, `T+2` (menggantikan)
  - `name 'Budi'`, hadir, 1, `T+0`

  Tes:
  ```ts
  it('anon dan user non-admin tidak bisa membaca link', ...)        // select → data [] atau error; tidak ada token
  it('anon tidak bisa membuat link', ...)                           // insert → error not null
  it('kode salah → nol baris', ...)                                 // rpc('monitor_summary',{p_token:'x'.repeat(32)}) → data []
  it('angka sama dengan summarizeRsvps', async () => {
    const rows = (await service.from('rsvps').select('*').eq('invitation_id', pubId)).data!
    const s = summarizeRsvps(rows)
    const { data } = await anon.rpc('monitor_summary', { p_token: tokenA })
    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({ hadir: s.hadir, tidak: s.tidak, ragu: s.ragu, total_orang: s.totalOrang, status: 'published' })
    expect(s).toEqual({ hadir: 2, tidak: 1, ragu: 0, totalOrang: 4 })   // jaga agar data uji benar-benar menguji kasusnya
  })
  it('hasil hanya berisi kolom yang diizinkan', ...)                // Object.keys(data[0]).sort() === daftar 10 kolom di Interfaces
  it('draft tanpa RSVP → satu baris berisi nol', ...)               // { status:'draft', hadir:0, tidak:0, ragu:0, total_orang:0 }
  it('setelah kode diganti, kode lama → nol baris', ...)            // service update token ke tokenB; rpc(tokenA) → []; rpc(tokenB) → 1 baris
  ```

- [ ] **Step 2: Jalankan, pastikan gagal**
  Run: `npm run test:db`
  Expected: `monitor.test.ts` FAIL (relasi `invitation_monitor_links` / fungsi `monitor_summary` tidak ada); `rls.test.ts` tetap 9 lulus.

- [ ] **Step 3: Tulis migrasi** `20261111000000_monitor_links.sql` sesuai Global Constraints. Inti fungsi:
  ```sql
  with inv as (
    select i.* from public.invitation_monitor_links l
    join public.invitations i on i.id = l.invitation_id
    where l.token = p_token
  ), latest as (
    select distinct on (coalesce('kode:' || r.guest_code, 'nama:' || lower(regexp_replace(r.name, '^\s+|\s+$', '', 'g'))))
           r.attendance, r.party_size
    from public.rsvps r join inv on r.invitation_id = inv.id
    order by coalesce('kode:' || r.guest_code, 'nama:' || lower(regexp_replace(r.name, '^\s+|\s+$', '', 'g'))),
             r.created_at desc, r.id
  )
  select inv.groom_nickname, inv.bride_nickname, inv.theme, inv.timezone, inv.status,
         (select count(*) from latest where attendance = 'hadir')::int,
         (select count(*) from latest where attendance = 'tidak')::int,
         (select count(*) from latest where attendance = 'ragu')::int,
         coalesce((select sum(party_size) from latest where attendance = 'hadir'), 0)::int,
         now()
  from inv;
  ```
  Cocokkan tipe kolom `theme`/`timezone`/`status` dengan tipe di migrasi awal (cast ke `text` bila enum).

- [ ] **Step 4: Terapkan ke DB lokal**
  Run: `npx --yes supabase@3.1.0 migration up`
  Expected: `Applying migration 20261111000000_monitor_links.sql...` tanpa error.

- [ ] **Step 5: Jalankan tes, pastikan lulus**
  Run: `npm run test:db`
  Expected: 2 file, semua lulus (9 + 7).

- [ ] **Step 6: Commit**
  ```bash
  git add supabase/migrations/20261111000000_monitor_links.sql tests/db/monitor.test.ts
  git commit -m "feat(db): tabel link pantau dan fungsi monitor_summary"
  ```

### Task 2: Helper murni (kode, link, pesan WA, jam)

**Files:**
- Create: `src/lib/monitor.ts`
- Modify: `src/lib/time.ts` (tambah `formatClock`)
- Test: `tests/unit/monitor.test.ts`, `tests/unit/time.test.ts`

**Interfaces:**
- Produces (`src/lib/monitor.ts`):
  - `MONITOR_TOKEN_RE: RegExp` = `/^[A-Za-z0-9_-]{32}$/`
  - `monitorToken(): string` (pakai `randomBytes(24).toString('base64url')` dari `node:crypto`; berkas ini hanya diimpor di server)
  - `monitorLink(baseUrl: string, token: string): string` → `${baseUrl tanpa / di akhir}/pantau/${token}`
  - `monitorWaMessage(p: { coupleName: string; link: string }): string`
- Produces (`src/lib/time.ts`): `formatClock(iso: string, tz: TimeZoneId): string` → `"HH.mm <label>"`, mis. `"14.42 WIT"`; geser jam dengan `TIMEZONES[tz].offsetHours` seperti `formatTimestamp`.

- [ ] **Step 1: Tulis tes yang gagal**
  ```ts
  // monitor.test.ts
  it('monitorToken 32 karakter base64url dan acak', () => {
    const a = monitorToken(), b = monitorToken()
    expect(a).toMatch(MONITOR_TOKEN_RE); expect(b).toMatch(MONITOR_TOKEN_RE); expect(a).not.toBe(b)
  })
  it('MONITOR_TOKEN_RE menolak panjang/karakter salah', () => {
    for (const bad of ['a'.repeat(31), 'a'.repeat(33), 'a'.repeat(31) + '+', 'a'.repeat(31) + '/', 'a'.repeat(31) + '=', ''])
      expect(bad).not.toMatch(MONITOR_TOKEN_RE)
  })
  it('monitorLink merapikan garis miring', () => {
    expect(monitorLink('https://x.app/', 'T'.repeat(32))).toBe(`https://x.app/pantau/${'T'.repeat(32)}`)
  })
  it('monitorWaMessage memuat nama pasangan dan link', ...)   // toContain('Budi & Ani') dan toContain(link)
  // time.test.ts
  it('formatClock memakai zona undangan', () => {
    expect(formatClock('2026-11-10T05:42:00Z', 'Asia/Jayapura')).toBe('14.42 WIT')
    expect(formatClock('2026-11-10T05:42:00Z', 'Asia/Jakarta')).toBe('12.42 WIB')
    expect(formatClock('2026-11-10T16:05:00Z', 'Asia/Makassar')).toBe('00.05 WITA')
  })
  ```
- [ ] **Step 2: Jalankan, pastikan gagal** — Run: `npm test -- monitor time` · Expected: FAIL (modul/ekspor tidak ada).
- [ ] **Step 3: Implementasi** sesuai Interfaces. Isi `monitorWaMessage` (teks tetap):
  ```
  Halo, berikut link untuk memantau rekap kehadiran tamu undangan *${coupleName}*:
  ${link}

  Link ini pribadi, mohon tidak dibagikan ke orang lain. Angka diperbarui otomatis.
  ```
- [ ] **Step 4: Jalankan, pastikan lulus** — Run: `npm test` · Expected: semua lulus (141 + baru).
- [ ] **Step 5: Commit** — `git add src/lib/monitor.ts src/lib/time.ts tests/unit/monitor.test.ts tests/unit/time.test.ts && git commit -m "feat: helper link pantau dan formatClock"`

### Task 3: Kelola link di panel admin

**Files:**
- Modify: `src/lib/data/admin.ts` (tambah 3 fungsi)
- Create: `src/app/admin/(panel)/monitor-actions.ts`
- Create: `src/components/admin/MonitorLinkCard.tsx`
- Modify: `src/app/admin/(panel)/[id]/responses/page.tsx` (muat link, render kartu di atas grid rekap)
- Test: `tests/unit/monitor-card.test.tsx`

**Interfaces:**
- Consumes: `monitorToken`, `monitorLink`, `monitorWaMessage` (Task 2); `waShareUrl` (`src/lib/links.ts`); `SITE_URL` (`src/lib/supabase/env.ts`); `CopyButton`, `Card`, `Notice`, `buttonClass`, `secondaryButtonClass`, `dangerButtonClass`.
- Produces (`admin.ts`, gaya `Result<T>` yang ada):
  - `getMonitorLink(sb, invitationId): Promise<string | null>` → token atau null
  - `upsertMonitorLink(sb, invitationId, token: string): Promise<Result<null>>` (upsert on `invitation_id`, `created_at` tidak dikirim)
  - `deleteMonitorLink(sb, invitationId): Promise<Result<null>>`
- Produces (`monitor-actions.ts`, `'use server'`):
  - `createMonitorLinkAction(invitationId: string): Promise<{ ok: boolean; message?: string }>`: membuat atau mengganti kode
  - `disableMonitorLinkAction(invitationId: string): Promise<{ ok: boolean; message?: string }>`
  Gagal → `message` dari `mapDbError` (`src/lib/data/errors.ts`).
- Produces: `MonitorLinkCard(props: { invitationId: string; link: string | null; coupleName: string })`, komponen klien.

- [ ] **Step 1: Tulis tes yang gagal** `tests/unit/monitor-card.test.tsx` dengan `renderToStaticMarkup`:
  ```ts
  it('tanpa link: tombol Buat link, tidak ada Salin', ...)   // toContain('Buat link'); not.toContain('Kirim WA')
  it('dengan link: tampil link, Salin, Kirim WA, Buat ulang, Matikan', ...)
  it('href Kirim WA berisi pesan dengan link', ...)          // href diawali 'https://wa.me/?text=' dan memuat encodeURIComponent(link)
  ```
  Bila mengimpor komponen yang memanggil server action membuat tes gagal dimuat, `vi.mock('@/app/admin/(panel)/monitor-actions', () => ({ createMonitorLinkAction: vi.fn(), disableMonitorLinkAction: vi.fn() }))`.
- [ ] **Step 2: Jalankan, pastikan gagal** — Run: `npm test -- monitor-card` · Expected: FAIL (modul tidak ada).
- [ ] **Step 3: Implementasi** fungsi data, action, dan kartu. Kartu: judul "Link Pantau Mempelai"; keterangan tanpa link: "Buat link agar mempelai bisa memantau rekap kehadiran tanpa login."; "Buat ulang" dan "Matikan" memakai `confirm('Link lama tidak akan berlaku lagi. Lanjutkan?')` / `confirm('Matikan link pantau? Mempelai tidak bisa membukanya lagi.')`; tombol nonaktif selama transisi; galat tampil di `Notice kind="error"`. Di halaman responses: tambahkan `getMonitorLink(supabase, id)` ke `Promise.all`, lalu render kartu dengan `link = token ? monitorLink(SITE_URL, token) : null` dan `coupleName = \`${inv.groom_nickname} & ${inv.bride_nickname}\``. Jangan ubah `duplicateInvitation`: fungsi itu menyalin tabel anak secara eksplisit, jadi link pantau memang tidak ikut tersalin (sesuai spec).
- [ ] **Step 4: Jalankan, pastikan lulus** — Run: `npm test && npx tsc --noEmit && npm run lint` · Expected: semua lulus, tsc exit 0, lint bersih.
- [ ] **Step 5: Commit** — `git add src/lib/data/admin.ts "src/app/admin/(panel)/monitor-actions.ts" src/components/admin/MonitorLinkCard.tsx "src/app/admin/(panel)/[id]/responses/page.tsx" tests/unit/monitor-card.test.tsx && git commit -m "feat(admin): kelola link pantau mempelai"`

### Task 4: Halaman mempelai `/pantau/[token]`

**Files:**
- Modify: `src/lib/data/public.ts` (tambah `getMonitorSummary`)
- Modify: `src/lib/types.ts` (tambah `MonitorSummary`)
- Create: `src/app/pantau/[token]/page.tsx`
- Create: `src/app/pantau/[token]/not-found.tsx`
- Create: `src/components/monitor/MonitorView.tsx` (presentasi, server-safe)
- Create: `src/components/monitor/AutoRefresh.tsx` (`'use client'`; ekspor juga `startAutoRefresh`)
- Test: `tests/unit/monitor-view.test.tsx`, `tests/unit/auto-refresh.test.ts`, `tests/unit/monitor-summary.test.ts`

**Interfaces:**
- Consumes: `MONITOR_TOKEN_RE` (Task 2), `formatClock` (Task 2), `createPublicSupabase`, `ThemeName`, `TimeZoneId`, `InvitationStatus`.
- Produces:
  - `type MonitorSummary = { groomNickname: string; brideNickname: string; theme: ThemeName; timezone: TimeZoneId; status: InvitationStatus; hadir: number; tidak: number; ragu: number; totalOrang: number; generatedAt: string }`
  - `type MonitorResult = { kind: 'ok'; summary: MonitorSummary } | { kind: 'invalid' } | { kind: 'error' }`
  - `getMonitorSummary(token: string): Promise<MonitorResult>`: `invalid` bila kode tidak cocok dengan `MONITOR_TOKEN_RE` (tanpa panggilan DB) atau RPC mengembalikan nol baris; `error` bila RPC mengembalikan galat atau melempar. Tidak pernah melempar, karena error boundary akan melepas `AutoRefresh`.
  - `MonitorView(props: { summary: MonitorSummary })`
  - `MonitorUnavailable()`: teks "Sedang ada gangguan, mencoba lagi otomatis…"
  - `startAutoRefresh(doc: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>, refresh: () => void, intervalMs = 60_000): () => void`, mengembalikan fungsi pembersih.
  - `AutoRefresh()`: memanggil `startAutoRefresh(document, router.refresh)` di `useEffect`.

- [ ] **Step 1: Tulis tes yang gagal**
  ```ts
  // auto-refresh.test.ts (vi.useFakeTimers; doc palsu dengan visibilityState yang bisa diubah dan daftar listener)
  it('menyegarkan tiap 60 detik saat terlihat', ...)        // advance 60_000 → refresh 1x; 120_000 → 2x
  it('tidak menyegarkan saat tersembunyi', ...)              // visibilityState 'hidden'; advance 180_000 → 0x
  it('menyegarkan sekali saat kembali terlihat', ...)        // set 'visible' lalu panggil listener 'visibilitychange' → 1x
  it('pembersih menghentikan timer dan listener', ...)       // cleanup(); advance 120_000 → 0x; removeEventListener dipanggil
  // monitor-view.test.tsx (renderToStaticMarkup)
  it('menampilkan nama pasangan, 4 label dan angka', ...)    // 'Budi &amp; Ani', 'Hadir','Tidak Hadir','Masih Ragu','Total Orang', angka
  it('data-theme mengikuti tema', ...)                       // toContain('data-theme="modern"')
  it('label Belum terbit hanya untuk draft', ...)
  it('baris Diperbarui memakai zona undangan', ...)          // generatedAt '2026-11-10T05:42:00Z', 'Asia/Jayapura' → 'Diperbarui 14.42 WIT · menyegarkan otomatis'
  // monitor-summary.test.ts (vi.mock('@/lib/supabase/public') → createPublicSupabase mengembalikan { rpc: vi.fn() })
  it('kode salah format → invalid tanpa memanggil rpc', ...) // 'abc' → { kind:'invalid' }; rpc tidak dipanggil
  it('nol baris → invalid', ...)
  it('rpc error atau melempar → error', ...)                 // { data:null, error:{...} } dan rpc yang reject → { kind:'error' }
  it('baris → ok dengan nama field camelCase', ...)          // total_orang → totalOrang, generated_at → generatedAt
  ```
- [ ] **Step 2: Jalankan, pastikan gagal** — Run: `npm test -- monitor-view auto-refresh` · Expected: FAIL (modul tidak ada).
- [ ] **Step 3: Implementasi.** `MonitorView` memakai token tema yang ada (`data-theme`, `bg-inv-bg`, `text-inv-text`, `font-heading`, `bg-inv-surface`, `border-inv-line`, `text-inv-muted`, `text-inv-accent`), satu kolom terpusat `max-w-md`, grid `grid-cols-2`, nyaman di 360px. `page.tsx`: `export const metadata` sesuai Global Constraints; komponen default membungkus komponen async dalam `<Suspense>` (fallback teks "Memuat…"); komponen async `await params` → `getMonitorSummary(token)` → `invalid`: `notFound()`; `error`: `<><MonitorUnavailable /><AutoRefresh /></>`; `ok`: `<><MonitorView summary={r.summary} /><AutoRefresh /></>`. `not-found.tsx`: halaman netral (warna stone) berisi "Link tidak berlaku. Hubungi penyedia undangan Anda.", tanpa tautan keluar.
- [ ] **Step 4: Jalankan, pastikan lulus** — Run: `npm test && npx tsc --noEmit && npm run lint` · Expected: semua lulus.
- [ ] **Step 5: Cek manual cepat** — `npm run dev`; buka `http://localhost:3000/pantau/abc` → "Link tidak berlaku"; log server tanpa `Error: Route`.
- [ ] **Step 6: Commit** — `git add src/lib/data/public.ts src/lib/types.ts src/app/pantau src/components/monitor tests/unit/monitor-view.test.tsx tests/unit/auto-refresh.test.ts tests/unit/monitor-summary.test.ts && git commit -m "feat: halaman pantau mempelai"`

### Task 5: E2E, panduan, verifikasi akhir

**Files:**
- Modify: `e2e/smoke.spec.ts`
- Modify: `docs/deploy.md` (bagian penggunaan, setelah langkah rekap RSVP)
- Create: `docs/img/07-pantau.png` (dihasilkan tes)

**Interfaces:**
- Consumes: UI dari Task 3 dan Task 4.

- [ ] **Step 1: Perluas smoke test.** Di blok "Admin melihat rekap", setelah asersi Total Orang:
  ```ts
  await admin.getByRole('button', { name: 'Buat link' }).click()
  const monitorUrl = await admin.getByText(/\/pantau\/[A-Za-z0-9_-]{32}$/).textContent()
  const couple = await browser.newPage()                                  // viewport HP dari config
  await couple.goto(new URL(monitorUrl!).pathname)
  await expect(couple.getByText('Rekap Kehadiran Tamu')).toBeVisible()
  await expect(couple.getByText('Hadir', { exact: true }).locator('..')).toContainText('1')
  await expect(couple.getByText('Total Orang').locator('..')).toContainText('2')
  await couple.screenshot(shot('07-pantau'))
  admin.once('dialog', (d) => d.accept())
  await admin.getByRole('button', { name: 'Buat ulang' }).click()
  await expect(admin.getByText(monitorUrl!)).toBeHidden()
  await couple.reload()
  await expect(couple.getByText('Link tidak berlaku')).toBeVisible()
  ```
  Sesuaikan locator bila markup kartu berbeda, tapi asersinya tetap.
- [ ] **Step 2: Jalankan** — Run: `npm run e2e -- --reporter=line` · Expected: `1 passed`; output tanpa `Error: Route` dan tanpa `hydrat`.
- [ ] **Step 3: Tambah panduan** di `docs/deploy.md`: judul "Link pantau untuk mempelai"; langkah: tab **RSVP & Ucapan** → **Buat link** → **Kirim WA** (pilih kontak mempelai) atau **Salin**; kapan memakai **Buat ulang** (link tersebar ke orang lain) dan **Matikan**; gambar `![Halaman pantau mempelai](img/07-pantau.png)`.
- [ ] **Step 4: Verifikasi akhir** — Run: `npm test && npm run test:db && npx tsc --noEmit && npm run lint && npm run build` · Expected: semua lulus; build menampilkan rute `/pantau/[token]`.
- [ ] **Step 5: Commit** — `git add e2e/smoke.spec.ts docs/deploy.md docs/img/07-pantau.png && git commit -m "test: E2E link pantau dan panduan"`
