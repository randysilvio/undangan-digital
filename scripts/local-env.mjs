// Mengisi .env.local dengan alamat & kunci Supabase LOKAL (Docker), lalu menyiapkan akun admin lokal.
// Pemakaian: npm run db:start  (otomatis memanggil skrip ini setelah Supabase lokal menyala)
// Kunci lokal ini hanya berlaku di komputer ini — bukan kunci proyek Supabase online.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const ENV = '.env.local'
const CLI = ['--yes', 'supabase@3.1.0']

const raw = execFileSync('npx', [...CLI, 'status', '-o', 'json'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
  stdio: ['ignore', 'pipe', 'inherit'],
})
const status = JSON.parse(raw.slice(raw.indexOf('{')))
const pick = (...names) => names.map((n) => status[n]).find(Boolean)

const values = {
  NEXT_PUBLIC_SUPABASE_URL: pick('API_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: pick('ANON_KEY', 'PUBLISHABLE_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: pick('SERVICE_ROLE_KEY', 'SECRET_KEY'),
  SUPABASE_DB_URL: pick('DB_URL'),
}
const missing = Object.entries(values).filter(([, v]) => !v).map(([k]) => k)
if (missing.length) {
  console.error(`Supabase lokal belum lengkap (${missing.join(', ')}). Pastikan Docker Desktop menyala, lalu ulangi.`)
  process.exit(1)
}

if (!existsSync(ENV)) copyFileSync('.env.example', ENV)
let text = readFileSync(ENV, 'utf8')
const current = (name) => text.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.trim() ?? ''
const set = (name, value) => {
  const line = `${name}=${value}`
  text = new RegExp(`^${name}=.*$`, 'm').test(text) ? text.replace(new RegExp(`^${name}=.*$`, 'm'), line) : `${text.trimEnd()}\n${line}\n`
}

for (const [k, v] of Object.entries(values)) set(k, v)
if (!current('NEXT_PUBLIC_SITE_URL')) set('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
const email = current('E2E_ADMIN_EMAIL') || 'admin@undangan.test'
const password = current('E2E_ADMIN_PASSWORD') || `Admin-${randomBytes(4).toString('hex')}`
set('E2E_ADMIN_EMAIL', email)
set('E2E_ADMIN_PASSWORD', password)
writeFileSync(ENV, text)

// Akun admin lokal: buat bila belum ada, lalu daftarkan di tabel admins.
const sb = createClient(values.NEXT_PUBLIC_SUPABASE_URL, values.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const { data: list, error: listErr } = await sb.auth.admin.listUsers({ perPage: 1000 })
if (listErr) throw listErr
let user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
if (!user) {
  const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw error
  user = data.user
} else {
  const { error } = await sb.auth.admin.updateUserById(user.id, { password })
  if (error) throw error
}
const { error: adminErr } = await sb.from('admins').upsert({ user_id: user.id })
if (adminErr) {
  console.error(`Gagal mendaftarkan admin: ${adminErr.message}`)
  process.exit(1)
}

console.log(`OK: ${ENV} diisi dengan Supabase lokal (${values.NEXT_PUBLIC_SUPABASE_URL}).`)
console.log(`OK: akun admin lokal ${email} siap (password ada di ${ENV}, baris E2E_ADMIN_PASSWORD).`)
