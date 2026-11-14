-- Tema kustom buatan admin (warna, huruf, dan gambar hiasan) serta pengaturan situs publik.
-- Aman untuk undangan lama: kolom custom_theme_id boleh kosong, sehingga undangan lama tetap memakai tema bawaan.

create table public.custom_themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 3 and 40 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 40),
  description text check (char_length(description) <= 120),
  base_theme text not null check (base_theme in ('elegan', 'modern', 'botani', 'mewah', 'ceria', 'pastel')),
  colors jsonb not null default '{}'::jsonb check (jsonb_typeof(colors) = 'object'),
  fonts jsonb not null default '{}'::jsonb check (jsonb_typeof(fonts) = 'object'),
  assets jsonb not null default '{}'::jsonb check (jsonb_typeof(assets) = 'object'),
  particles text not null default 'tema' check (particles in ('tema', 'jatuh', 'naik', 'kelip', 'mati')),
  show_in_gallery boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tema yang masih dipakai undangan tidak bisa dihapus.
alter table public.invitations
  add column custom_theme_id uuid references public.custom_themes (id) on delete restrict;
create index invitations_custom_theme_idx on public.invitations (custom_theme_id);

-- Satu baris pengaturan untuk halaman publik (kontak & paket harga).
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  whatsapp text check (whatsapp ~ '^62[0-9]{8,13}$'),
  instagram text check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  email text check (char_length(email) <= 100),
  packages jsonb not null default '[]'::jsonb check (jsonb_typeof(packages) = 'array' and jsonb_array_length(packages) <= 4),
  show_credit boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

grant select on public.custom_themes, public.site_settings to anon, authenticated;
grant insert, update, delete on public.custom_themes, public.site_settings to authenticated;

alter table public.custom_themes enable row level security;
alter table public.site_settings enable row level security;

create policy admin_all on public.custom_themes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_all on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Publik hanya melihat tema yang dipamerkan di galeri atau dipakai undangan yang sudah terbit.
create policy public_read on public.custom_themes for select to anon, authenticated
  using (
    show_in_gallery
    or exists (select 1 from public.invitations i where i.custom_theme_id = custom_themes.id and i.status = 'published')
  );
create policy public_read on public.site_settings for select to anon, authenticated using (true);
