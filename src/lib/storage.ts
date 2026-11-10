import imageCompression from 'browser-image-compression'
import { createBrowserSupabase } from './supabase/browser'
import { checkUpload, storageExtension } from './upload'

/** Dipanggil di browser admin: kompres foto, cek batas, unggah ke bucket "media". */
export async function uploadMedia(file: File, invitationId: string, kind: 'photo' | 'music'): Promise<{ url: string } | { error: string }> {
  let blob: Blob = file
  let type = kind === 'music' && file.type === 'audio/mp3' ? 'audio/mpeg' : file.type

  if (kind === 'photo') {
    try {
      blob = await imageCompression(file, { maxWidthOrHeight: 1920, maxSizeMB: 1, useWebWorker: true })
      type = blob.type
    } catch {
      return { error: 'Format foto tidak didukung, gunakan JPG atau PNG' }
    }
  }

  const problem = checkUpload({ type, size: blob.size }, kind)
  if (problem) return { error: problem }

  const sb = createBrowserSupabase()
  const path = `${invitationId}/${crypto.randomUUID()}.${storageExtension(type)}`
  const { error } = await sb.storage.from('media').upload(path, blob, { contentType: type, cacheControl: '31536000' })
  if (error) return { error: 'Gagal mengunggah, coba lagi' }
  return { url: sb.storage.from('media').getPublicUrl(path).data.publicUrl }
}
