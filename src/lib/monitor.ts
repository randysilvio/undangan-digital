/** Kode link pantau: 24 byte acak dalam base64url = tepat 32 karakter. Sama dengan check di database. */
export const MONITOR_TOKEN_RE = /^[A-Za-z0-9_-]{32}$/

/** Web Crypto (CSPRNG) agar modul ini bisa diimpor di server maupun komponen klien. */
export function monitorToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_')
}

export function monitorLink(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/pantau/${token}`
}

export function monitorWaMessage(p: { coupleName: string; link: string }): string {
  return `Halo, berikut link untuk memantau rekap kehadiran tamu undangan *${p.coupleName}*:
${p.link}

Link ini pribadi, mohon tidak dibagikan ke orang lain. Angka diperbarui otomatis.`
}
