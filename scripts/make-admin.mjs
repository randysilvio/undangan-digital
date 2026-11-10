// Pemakaian: npm run make-admin -- email@contoh.com
import { findUserByEmail, serviceClient } from './lib.mjs'

const email = process.argv[2]
if (!email) {
  console.error('Pemakaian: npm run make-admin -- email@contoh.com')
  process.exit(1)
}

const sb = serviceClient()
const user = await findUserByEmail(sb, email)
if (!user) {
  console.error(`User ${email} belum ada. Buat dulu di Supabase → Authentication → Users → Add user.`)
  process.exit(1)
}
const { error } = await sb.from('admins').upsert({ user_id: user.id })
if (error) {
  console.error(error.message)
  process.exit(1)
}
console.log(`OK: ${email} sekarang admin.`)
