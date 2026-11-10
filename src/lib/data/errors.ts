export const SAVE_FAILED = 'Gagal menyimpan, coba lagi'

/** Menerjemahkan error Postgres/Supabase ke pesan formulir. */
export function mapDbError(e: { code?: string }): Record<string, string> | string {
  if (e.code === '23505') return { slug: 'Alamat ini sudah dipakai undangan lain' }
  return SAVE_FAILED
}
