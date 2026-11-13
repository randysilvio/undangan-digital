import { createClient } from '@supabase/supabase-js'
import { expect, test } from '@playwright/test'

const email = process.env.E2E_ADMIN_EMAIL ?? ''
const password = process.env.E2E_ADMIN_PASSWORD ?? ''
const slug = `e2e-ultah-${Date.now().toString(36)}`

test.skip(!email || !password, 'Isi E2E_ADMIN_EMAIL dan E2E_ADMIN_PASSWORD di .env.local')

test.afterAll(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return
  await createClient(url, key, { auth: { persistSession: false } }).from('invitations').delete().eq('slug', slug)
})

test('halaman depan dan contoh undangan bisa dibuka', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Jenis Undangan' })).toBeVisible()
  await page.getByRole('link', { name: 'Contoh Ceria' }).first().click()
  await expect(page).toHaveURL(/\/contoh\/ultah-anak\/ceria$/)
  await expect(page.getByText('Ulang Tahun ke-5').first()).toBeVisible()
  await page.getByRole('link', { name: 'Mewah' }).click()
  await expect(page).toHaveURL(/\/contoh\/ultah-anak\/mewah$/)
  await expect(page.locator('main[data-theme="mewah"]')).toBeVisible()
})

test('admin membuat undangan ulang tahun anak, tamu membuka dan RSVP', async ({ browser }) => {
  const admin = await browser.newPage()
  await admin.goto('/admin/login')
  await admin.getByLabel('Email').fill(email)
  await admin.getByLabel('Password').fill(password)
  await admin.getByRole('button', { name: 'Masuk' }).click()
  await expect(admin.getByRole('heading', { name: 'Undangan' })).toBeVisible()

  await admin.getByRole('link', { name: '+ Buat Undangan' }).click()
  await admin.getByLabel(/Ulang Tahun Anak/).check()
  // Isian menyesuaikan jenis: tidak ada mempelai wanita, tema & teks bawaan ikut berganti.
  await expect(admin.getByLabel('Nama lengkap mempelai wanita')).toHaveCount(0)
  await expect(admin.getByRole('radio', { name: /Ceria/ })).toBeChecked()
  await expect(admin.getByLabel('Kalimat pengantar')).toHaveValue(/buah hati kami/)

  await admin.getByLabel('Nama lengkap').fill('Kayla Putri Uji')
  await admin.getByLabel('Nama panggilan').fill('Kayla')
  await admin.getByRole('spinbutton', { name: /Ulang tahun ke-/ }).fill('5')
  await expect(admin.getByLabel('Alamat (slug)')).toHaveValue('ultah-kayla-5')
  await admin.getByLabel('Alamat (slug)').fill(slug)

  const acara = admin.getByRole('group', { name: 'Acara 1' })
  await expect(acara.getByLabel('Nama acara')).toHaveValue('Pesta Ulang Tahun')
  await acara.getByLabel('Tanggal').fill('2027-03-20')
  await acara.getByLabel('Jam mulai').fill('15:00')
  await acara.getByLabel('Nama tempat').fill('Taman Uji')
  await acara.getByLabel('Alamat').fill('Jl. Pengujian 5')
  await admin.getByRole('button', { name: 'Buat Undangan' }).click()

  await expect(admin).toHaveURL(/\/admin\/[0-9a-f-]+\/edit\?baru=1/)
  await expect(admin.getByText('Ulang Tahun Anak').first()).toBeVisible()
  await admin.getByRole('button', { name: 'Terbitkan' }).click()
  await expect(admin.getByRole('status').filter({ hasText: 'Undangan sudah terbit' })).toBeVisible()

  await admin.getByRole('link', { name: 'Tamu' }).click()
  await admin.getByLabel('Tempel daftar nama').fill('Bu Rina')
  await admin.getByRole('button', { name: 'Tambah Tamu' }).click()
  await expect(admin.getByText('1 tamu ditambahkan')).toBeVisible()
  await expect(admin.getByText('Kirim Daftar ke Orang tua')).toBeVisible()

  const wa = await admin.locator('a[href^="https://wa.me/"]:not([href*="Daftar%20link%20undangan"])').first().getAttribute('href')
  const message = new URL(wa!).searchParams.get('text')!
  expect(message).toContain('*Kayla*')
  expect(message).not.toContain('{nama}')
  const guestUrl = message.match(/https?:\/\/\S+/)![0]

  const guest = await browser.newPage()
  await guest.goto(new URL(guestUrl).pathname + new URL(guestUrl).search)
  await expect(guest).toHaveTitle(/Undangan Ulang Tahun ke-5 Kayla/)
  await expect(guest.getByText('Undangan Ulang Tahun', { exact: true })).toBeVisible()
  await guest.getByRole('button', { name: 'Buka Undangan' }).click()
  await expect(guest.getByRole('heading', { name: 'Yang Berulang Tahun' })).toBeVisible()

  const rsvp = guest.locator('[data-section="rsvp"]')
  await rsvp.getByText('Hadir', { exact: true }).click()
  await rsvp.getByRole('button', { name: 'Kirim Konfirmasi' }).click()
  await expect(rsvp.getByText('Konfirmasi Anda sudah kami terima.')).toBeVisible()
})
