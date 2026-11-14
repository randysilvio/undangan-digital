-- Ulang tahun bersama (dua orang, mis. kakak-adik atau Opa & Oma) dan tanggal lahir.
-- Orang kedua memakai kolom bride_* yang sudah ada; age2 dan birth_date2 untuk orang kedua.
-- Semua kolom baru boleh kosong, sehingga undangan lama tidak berubah.
alter table public.invitations
  add column age2 smallint check (age2 between 1 and 150),
  add column birth_date date,
  add column birth_date2 date;
