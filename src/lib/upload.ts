const MB = 1024 * 1024

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MUSIC_TYPES = ['audio/mpeg', 'audio/mp3']
export const MAX_PHOTO_BYTES = 5 * MB
export const MAX_MUSIC_BYTES = 10 * MB
export const MAX_GALLERY_PHOTOS = 30

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
