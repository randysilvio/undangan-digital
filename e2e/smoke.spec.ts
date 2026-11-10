import { createClient } from '@supabase/supabase-js'
import { expect, test } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL ?? ''
const password = process.env.E2E_ADMIN_PASSWORD ?? ''
const slug = `e2e-${Date.now().toString(36)}`
const shot = (name: string) => ({ path: `docs/img/${name}.png`, fullPage: false })

test.skip(!email || !password, 'Isi E2E_ADMIN_EMAIL dan E2E_ADMIN_PASSWORD di .env.local')

test.afterAll(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return
  await createClient(url, key, { auth: { persistSession: false } }).from('invitations').delete().eq('slug', slug)
})

test('admin membuat undangan, tamu RSVP & ucapan, admin melihat rekap', async ({ browser }) => {
  // ── Admin (layar laptop untuk screenshot panduan) ──
  const admin = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await admin.goto('/admin')
  await expect(admin).toHaveURL(/\/admin\/login/)
  await admin.screenshot(shot('01-login'))
  await admin.getByLabel('Email').fill(email)
  await admin.getByLabel('Password').fill(password)
  await admin.getByRole('button', { name: 'Masuk' }).click()
  await expect(admin.getByRole('heading', { name: 'Undangan' })).toBeVisible()

  await admin.getByRole('link', { name: '+ Buat Undangan' }).click()
  await admin.getByLabel('Nama lengkap mempelai pria').fill('Tes Pria')
  await admin.getByLabel('Nama panggilan pria').fill('Tes')
  await admin.getByLabel('Nama lengkap mempelai wanita').fill('Uji Wanita')
  await admin.getByLabel('Nama panggilan wanita').fill('Uji')
  await admin.getByLabel('Alamat (slug)').fill(slug)
  await admin.screenshot(shot('02-buat-undangan'))

  // Sisakan satu acara.
  await admin.getByRole('group', { name: 'Acara 2' }).getByRole('button', { name: 'Hapus' }).click()
  const acara = admin.getByRole('group', { name: 'Acara 1' })
  await acara.getByLabel('Tanggal').fill('2027-01-15')
  await acara.getByLabel('Jam mulai').fill('09:00')
  await acara.getByLabel('Nama tempat').fill('Gedung Uji')
  await acara.getByLabel('Alamat').fill('Jl. Pengujian 1')
  await acara.getByLabel('Tanggal').scrollIntoViewIfNeeded()
  await admin.screenshot(shot('03-acara'))
  await admin.getByRole('button', { name: 'Buat Undangan' }).click()

  await expect(admin).toHaveURL(/\/admin\/[0-9a-f-]+\/edit\?baru=1/)
  await admin.getByRole('button', { name: 'Terbitkan' }).click()
  await expect(admin.getByText('Undangan sudah terbit')).toBeVisible()
  await admin.screenshot(shot('04-terbitkan'))

  await admin.getByRole('link', { name: 'Tamu' }).click()
  await admin.getByLabel('Tempel daftar nama').fill('Pak Tes')
  await admin.getByRole('button', { name: 'Tambah Tamu' }).click()
  await expect(admin.getByText('1 tamu ditambahkan')).toBeVisible()
  await admin.screenshot(shot('05-tamu'))

  const wa = await admin.getByRole('link', { name: 'Kirim WA' }).first().getAttribute('href')
  const message = new URL(wa!).searchParams.get('text')!
  const guestUrl = message.match(/https?:\/\/\S+/)![0]
  expect(guestUrl).toContain(`/${slug}?to=Pak+Tes&g=`)

  // ── Tamu (layar HP 360px) ──
  const guest = await browser.newPage()
  await guest.goto(new URL(guestUrl).pathname + new URL(guestUrl).search)
  await expect(guest.getByText('Pak Tes').first()).toBeVisible()
  await guest.getByRole('button', { name: 'Buka Undangan' }).click()

  const rsvp = guest.locator('[data-section="rsvp"]')
  await expect(rsvp.getByLabel('Nama')).toHaveValue('Pak Tes')
  await rsvp.getByText('Hadir', { exact: true }).click()
  await rsvp.getByLabel('Jumlah orang').selectOption('2')
  await rsvp.getByRole('button', { name: 'Kirim Konfirmasi' }).click()
  await expect(rsvp.getByText('Konfirmasi Anda sudah kami terima.')).toBeVisible()

  const ucapan = guest.locator('[data-section="ucapan"]')
  await ucapan.getByLabel('Ucapan & doa').fill('Selamat menempuh hidup baru!')
  await ucapan.getByRole('button', { name: 'Kirim Ucapan' }).click()
  await expect(ucapan.getByRole('listitem').filter({ hasText: 'Selamat menempuh hidup baru!' })).toBeVisible()

  // ── Admin melihat rekap ──
  await admin.getByRole('link', { name: 'RSVP & Ucapan' }).click()
  await expect(admin.getByRole('cell', { name: 'Pak Tes' })).toBeVisible()
  await expect(admin.getByText('Total Orang').locator('..')).toContainText('2')
  await admin.screenshot(shot('06-rekap'))
})
