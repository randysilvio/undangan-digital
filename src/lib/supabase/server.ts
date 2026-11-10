import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

/** Klien per-request dengan sesi login dari cookie. */
export async function createServerSupabase() {
  // Sesi Supabase membandingkan masa berlaku token dengan Date.now(); tunggu request sungguhan
  // agar validasi prerender (yang juga menyediakan cookie) tidak sampai ke situ.
  await connection()
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Dipanggil dari Server Component: cookie tidak bisa ditulis; proxy yang menyegarkan sesi.
        }
      },
    },
  })
}
