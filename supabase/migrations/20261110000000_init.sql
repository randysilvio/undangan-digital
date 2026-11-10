-- Skema awal undangan digital (Tahap 1)

-- ── Admin ────────────────────────────────────────────────────────────────
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- ── Tabel ────────────────────────────────────────────────────────────────
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  status text not null default 'draft' check (status in ('draft', 'published')),
  theme text not null default 'elegan' check (theme in ('elegan', 'modern')),
  timezone text not null default 'Asia/Jakarta'
    check (timezone in ('Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura')),
  groom_name text not null check (char_length(groom_name) <= 100),
  groom_nickname text not null check (char_length(groom_nickname) <= 30),
  groom_parents text check (char_length(groom_parents) <= 200),
  groom_photo_url text,
  bride_name text not null check (char_length(bride_name) <= 100),
  bride_nickname text not null check (char_length(bride_nickname) <= 30),
  bride_parents text check (char_length(bride_parents) <= 200),
  bride_photo_url text,
  cover_photo_url text,
  opening_text text check (char_length(opening_text) <= 1000),
  music_url text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null check (char_length(name) <= 60),
  date date not null,
  start_time text not null check (start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  end_time text check (end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  venue_name text not null check (char_length(venue_name) <= 100),
  address text not null check (char_length(address) <= 300),
  maps_url text check (maps_url ~ '^https://'),
  sort_order int not null default 0
);
create index events_invitation_idx on public.events (invitation_id, sort_order);

create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);
create index gallery_invitation_idx on public.gallery_photos (invitation_id, sort_order);

create table public.gift_accounts (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  provider text not null check (char_length(provider) <= 50),
  account_number text not null check (account_number ~ '^[0-9 ]{5,30}$'),
  account_holder text not null check (char_length(account_holder) <= 100),
  sort_order int not null default 0
);
create index gifts_invitation_idx on public.gift_accounts (invitation_id, sort_order);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null check (char_length(name) <= 100),
  phone text,
  code text not null check (code ~ '^[a-z0-9]{6}$'),
  created_at timestamptz not null default now(),
  unique (invitation_id, code)
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_code text check (guest_code ~ '^[a-z0-9]{6}$'),
  name text not null check (char_length(name) between 1 and 100),
  attendance text not null check (attendance in ('hadir', 'tidak', 'ragu')),
  party_size int not null check (party_size between 0 and 10),
  created_at timestamptz not null default now()
);
create index rsvps_invitation_idx on public.rsvps (invitation_id, created_at desc);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  message text not null check (char_length(message) between 1 and 500),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index wishes_invitation_idx on public.wishes (invitation_id, created_at desc);

-- ── Hak akses dasar (RLS tetap menjadi batas utama) ─────────────────────
revoke all on all tables in schema public from anon, authenticated;
grant select on public.invitations, public.events, public.gallery_photos, public.gift_accounts, public.wishes
  to anon, authenticated;
grant insert on public.rsvps, public.wishes to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Row Level Security ──────────────────────────────────────────────────
alter table public.admins enable row level security;
alter table public.invitations enable row level security;
alter table public.events enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.gift_accounts enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;

-- Admin: akses penuh ke semua tabel data.
create policy admin_all on public.invitations for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_all on public.events for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_all on public.gallery_photos for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_all on public.gift_accounts for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_all on public.guests for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_all on public.rsvps for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_all on public.wishes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Publik: hanya undangan yang sudah terbit.
create policy public_read on public.invitations for select to anon, authenticated
  using (status = 'published');

create policy public_read on public.events for select to anon, authenticated
  using (exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published'));
create policy public_read on public.gallery_photos for select to anon, authenticated
  using (exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published'));
create policy public_read on public.gift_accounts for select to anon, authenticated
  using (exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published'));

create policy public_read on public.wishes for select to anon, authenticated
  using (hidden = false
    and exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published'));
create policy public_insert on public.wishes for insert to anon, authenticated
  with check (hidden = false
    and exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published'));

create policy public_insert on public.rsvps for insert to anon, authenticated
  with check (exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published'));

-- ── Storage: bucket "media" (baca publik, tulis hanya admin) ────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg'])
on conflict (id) do nothing;

create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
