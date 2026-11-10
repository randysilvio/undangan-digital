import { createClient } from '@supabase/supabase-js'

export function requireEnv(...names) {
  const missing = names.filter((n) => !process.env[n])
  if (missing.length) {
    console.error(`Isi dulu di .env.local: ${missing.join(', ')}`)
    process.exit(1)
  }
}

/** Klien dengan service role — HANYA untuk skrip di komputer admin. */
export function serviceClient() {
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function findUserByEmail(sb, email) {
  for (let page = 1; ; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (user) return user
    if (data.users.length < 200) return null
  }
}
