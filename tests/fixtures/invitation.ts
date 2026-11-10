import type { InvitationFull } from '@/lib/types'

export function makeInvitation(overrides: Partial<InvitationFull> = {}): InvitationFull {
  const id = 'inv-1'
  return {
    id,
    slug: 'budi-ani',
    status: 'published',
    theme: 'elegan',
    timezone: 'Asia/Jayapura',
    groom_name: 'Budi Santoso',
    groom_nickname: 'Budi',
    groom_parents: 'Putra dari Bapak Slamet & Ibu Sumi',
    groom_photo_url: null,
    bride_name: 'Ani Lestari',
    bride_nickname: 'Ani',
    bride_parents: 'Putri dari Bapak Joko & Ibu Rini',
    bride_photo_url: null,
    cover_photo_url: null,
    opening_text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup.',
    intro_text: null,
    closing_text: null,
    wa_message: null,
    music_url: null,
    created_at: '2026-11-01T00:00:00Z',
    events: [
      {
        id: 'ev-1',
        invitation_id: id,
        name: 'Akad',
        date: '2026-12-12',
        start_time: '08:00',
        end_time: '10:00',
        venue_name: 'Masjid Raya',
        address: 'Jl. Merdeka 1, Jayapura',
        maps_url: 'https://maps.google.com/?q=Masjid+Raya+Jayapura',
        sort_order: 0,
      },
      {
        id: 'ev-2',
        invitation_id: id,
        name: 'Resepsi',
        date: '2026-12-12',
        start_time: '11:00',
        end_time: '14:00',
        venue_name: 'Gedung Serbaguna',
        address: 'Jl. Sudirman 5, Jayapura',
        maps_url: null,
        sort_order: 1,
      },
    ],
    gallery: [
      { id: 'g-1', invitation_id: id, url: 'https://example.supabase.co/storage/v1/object/public/media/inv-1/a.jpg', sort_order: 0 },
      { id: 'g-2', invitation_id: id, url: 'https://example.supabase.co/storage/v1/object/public/media/inv-1/b.jpg', sort_order: 1 },
    ],
    gifts: [{ id: 'gf-1', invitation_id: id, provider: 'BCA', account_number: '1234567890', account_holder: 'Budi Santoso', sort_order: 0 }],
    ...overrides,
  }
}
