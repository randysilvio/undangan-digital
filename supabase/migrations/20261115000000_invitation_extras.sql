-- Bagian tambahan undangan: cerita/perjalanan hidup, daftar keluarga, dan dress code.
-- story: [{ "year": "1955", "title": "Lahir di Klaten", "text": "..." }], paling banyak 12 butir.
alter table public.invitations
  add column story jsonb not null default '[]'::jsonb
    check (jsonb_typeof(story) = 'array' and jsonb_array_length(story) <= 12),
  add column family text check (char_length(family) <= 1500),
  add column dress_code text check (char_length(dress_code) <= 200);
