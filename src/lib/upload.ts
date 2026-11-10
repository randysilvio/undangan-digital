const MB = 1024 * 1024

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MUSIC_TYPES = ['audio/mpeg', 'audio/mp3']
export const MAX_PHOTO_BYTES = 5 * MB
export const MAX_MUSIC_BYTES = 10 * MB
export const MAX_GALLERY_PHOTOS = 30

/** Hanya URL publik bucket "media" di folder undangan itu sendiri yang boleh disimpan. */
export function isMediaUrl(url: string, supabaseUrl: string, invitationId: string): boolean {
  const prefix = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/media/${invitationId}/`
  if (!url.startsWith(prefix)) return false
  const rest = url.slice(prefix.length)
  return /^[A-Za-z0-9._-]+$/.test(rest) && !rest.includes('..')
}

export function storageExtension(type: string): string {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type.startsWith('audio/')) return 'mp3'
  return 'jpg'
}

/** Pesan error bila file tidak boleh diunggah, atau null bila boleh. */
export function checkUpload(file: { type: string; size: number }, kind: 'photo' | 'music'): string | null {
  if (kind === 'photo') {
    if (!PHOTO_TYPES.includes(file.type)) return 'Format foto tidak didukung, gunakan JPG atau PNG'
    if (file.size > MAX_PHOTO_BYTES) return 'Ukuran foto maksimal 5 MB'
    return null
  }
  if (!MUSIC_TYPES.includes(file.type)) return 'Musik harus berformat MP3'
  if (file.size > MAX_MUSIC_BYTES) return 'Ukuran musik maksimal 10 MB'
  return null
}
