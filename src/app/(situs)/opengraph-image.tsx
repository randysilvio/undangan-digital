import { ImageResponse } from 'next/og'
import { BRAND, BRAND_TAGLINE } from '@/lib/brand'

export const alt = `${BRAND}: ${BRAND_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Gambar pratinjau saat link situs dibagikan di WhatsApp atau media sosial. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f6f1ea', color: '#2a211c', padding: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: '#7a2e2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: '#f6efe4', fontSize: 48, fontWeight: 700 }}>V</div>
            </div>
            <div style={{ fontSize: 44, fontWeight: 700 }}>{BRAND}</div>
          </div>
          <div style={{ marginTop: 40, fontSize: 64, lineHeight: 1.1, fontWeight: 700, maxWidth: 640 }}>Undangan yang menyapa setiap tamu dengan namanya.</div>
          <div style={{ marginTop: 28, fontSize: 28, color: '#6f625a' }}>Pernikahan · Ulang tahun · Syukuran</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {[
            ['#ff6b6b', '#4ecdc4', 'Kayla'],
            ['#3d3329', '#3d3329', 'Budi & Ani'],
            ['#2f3b2d', '#5f7a5b', 'Opa Slamet'],
          ].map(([a, b, name], i) => (
            <div
              key={name}
              style={{
                width: 150,
                height: 260,
                borderRadius: 26,
                background: `linear-gradient(160deg, ${a}, ${b})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transform: `rotate(${(i - 1) * 7}deg)`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: 3 }}>UNDANGAN</div>
              <div style={{ marginTop: 10, fontSize: 24, fontWeight: 700 }}>{name}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
