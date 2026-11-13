-- Jenis undangan: pernikahan dan beberapa jenis ulang tahun, plus tema baru.
-- Untuk ulang tahun, kolom groom_* menyimpan data yang berulang tahun dan kolom bride_* dikosongkan.
-- Undangan lama otomatis menjadi 'pernikahan' sehingga tampilannya tidak berubah.
alter table public.invitations
  add column kind text not null default 'pernikahan'
    check (kind in ('pernikahan', 'ultah_anak', 'sweet_seventeen', 'ultah_dewasa', 'ultah_syukur')),
  add column age smallint check (age between 1 and 150),
  alter column bride_name drop not null,
  alter column bride_nickname drop not null,
  add constraint invitations_wedding_couple
    check (kind <> 'pernikahan' or (bride_name is not null and bride_nickname is not null));

alter table public.invitations
  drop constraint invitations_theme_check,
  add constraint invitations_theme_check
    check (theme in ('elegan', 'modern', 'botani', 'mewah', 'ceria', 'pastel'));
