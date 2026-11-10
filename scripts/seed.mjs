// Membuat/memperbarui undangan demo "demo-budi-ani".
// Pemakaian: npm run db:seed            (tema elegan)
//            npm run db:seed -- --theme modern
import { serviceClient } from './lib.mjs'

const SLUG = 'demo-budi-ani'
const themeArg = process.argv.indexOf('--theme')
const theme = themeArg > -1 ? process.argv[themeArg + 1] : 'elegan'
if (!['elegan', 'modern'].includes(theme)) {
  console.error('Tema harus elegan atau modern')
  process.exit(1)
}

const sb = serviceClient()
const check = (r) => {
  if (r.error) {
    console.error(r.error.message)
    process.exit(1)
  }
  return r.data
}

const inDays = (n) => new Date(Date.now() + n * 86400_000).toISOString().slice(0, 10)
const photo = (seed, w = 800, h = 1000) => `https://picsum.photos/seed/${seed}/${w}/${h}`

const [inv] = check(
  await sb
    .from('invitations')
    .upsert(
      {
        slug: SLUG,
        status: 'published',
        theme,
        timezone: 'Asia/Jayapura',
        groom_name: 'Budi Santoso, S.T.',
        groom_nickname: 'Budi',
        groom_parents: 'Putra dari Bapak Slamet & Ibu Sumiati',
        groom_photo_url: photo('budi', 600, 600),
        bride_name: 'Ani Lestari, S.Pd.',
        bride_nickname: 'Ani',
        bride_parents: 'Putri dari Bapak Joko & Ibu Rini',
        bride_photo_url: photo('ani', 600, 600),
        cover_photo_url: photo('cover-budi-ani', 1080, 1600),
        opening_text:
          'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya. (QS. Ar-Rum: 21)',
        music_url: null,
      },
      { onConflict: 'slug' },
    )
    .select(),
)

for (const table of ['events', 'gallery_photos', 'gift_accounts']) {
  check(await sb.from(table).delete().eq('invitation_id', inv.id))
}

const date = inDays(30)
check(
  await sb.from('events').insert([
    {
      invitation_id: inv.id,
      name: 'Akad Nikah',
      date,
      start_time: '08:00',
      end_time: '10:00',
      venue_name: 'Masjid Raya Baiturrahim',
      address: 'Jl. Ahmad Yani, Jayapura, Papua',
      maps_url: 'https://maps.google.com/?q=Masjid+Raya+Baiturrahim+Jayapura',
      sort_order: 0,
    },
    {
      invitation_id: inv.id,
      name: 'Resepsi',
      date,
      start_time: '11:00',
      end_time: '14:00',
      venue_name: 'Gedung Serbaguna',
      address: 'Jl. Sam Ratulangi, Jayapura, Papua',
      maps_url: null,
      sort_order: 1,
    },
  ]),
)
check(
  await sb
    .from('gallery_photos')
    .insert([1, 2, 3, 4, 5, 6].map((n) => ({ invitation_id: inv.id, url: photo(`galeri-${n}`), sort_order: n }))),
)
check(
  await sb.from('gift_accounts').insert([
    { invitation_id: inv.id, provider: 'BCA', account_number: '1234567890', account_holder: 'Budi Santoso', sort_order: 0 },
    { invitation_id: inv.id, provider: 'DANA', account_number: '081234567890', account_holder: 'Ani Lestari', sort_order: 1 },
  ]),
)

console.log(`Seed OK: /${SLUG} (tema ${theme})`)
