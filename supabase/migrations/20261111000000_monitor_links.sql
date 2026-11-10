-- Link pantau mempelai: satu kode rahasia per undangan untuk melihat rekap RSVP tanpa login.

create table public.invitation_monitor_links (
  invitation_id uuid primary key references public.invitations (id) on delete cascade,
  token text not null unique check (token ~ '^[A-Za-z0-9_-]{32}$'),
  created_at timestamptz not null default now()
);

-- Default privileges Supabase memberi anon hak pada tabel baru; cabut eksplisit.
-- Grant di migrasi awal hanya berlaku untuk tabel yang sudah ada saat itu.
revoke all on public.invitation_monitor_links from anon;
grant select, insert, update, delete on public.invitation_monitor_links to authenticated;

alter table public.invitation_monitor_links enable row level security;
create policy admin_all on public.invitation_monitor_links for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Hanya angka yang keluar dari database; nama tamu tidak pernah dikembalikan.
-- Aturan hitung identik dengan summarizeRsvps (src/lib/rsvp.ts): jawaban terakhir per
-- kode tamu, atau per nama (huruf kecil, tanpa whitespace di tepi) bila tanpa kode.
create or replace function public.monitor_summary(p_token text)
returns table (
  groom_nickname text,
  bride_nickname text,
  theme text,
  timezone text,
  status text,
  hadir int,
  tidak int,
  ragu int,
  total_orang int,
  generated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with inv as (
    select i.id, i.groom_nickname, i.bride_nickname, i.theme, i.timezone, i.status
    from public.invitation_monitor_links l
    join public.invitations i on i.id = l.invitation_id
    where l.token = p_token
  ),
  keyed as (
    select
      coalesce('kode:' || r.guest_code, 'nama:' || lower(regexp_replace(r.name, '^\s+|\s+$', '', 'g'))) as respondent,
      r.attendance,
      r.party_size,
      r.created_at,
      r.id
    from public.rsvps r
    join inv on r.invitation_id = inv.id
  ),
  latest as (
    select distinct on (respondent) attendance, party_size
    from keyed
    order by respondent, created_at desc, id
  )
  select
    inv.groom_nickname,
    inv.bride_nickname,
    inv.theme,
    inv.timezone,
    inv.status,
    (select count(*) from latest where attendance = 'hadir')::int,
    (select count(*) from latest where attendance = 'tidak')::int,
    (select count(*) from latest where attendance = 'ragu')::int,
    coalesce((select sum(party_size) from latest where attendance = 'hadir'), 0)::int,
    now()
  from inv;
$$;

revoke execute on function public.monitor_summary(text) from public;
grant execute on function public.monitor_summary(text) to anon, authenticated;
