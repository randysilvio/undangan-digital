-- Teks undangan yang bisa diedit (template agama dipilih di formulir admin).
-- Null = undangan lama: aplikasi memakai teks template "Umum" (sama dengan teks sebelum fitur ini).
alter table public.invitations
  add column intro_text text check (char_length(intro_text) <= 500),
  add column closing_text text check (char_length(closing_text) <= 500),
  add column wa_message text check (char_length(wa_message) <= 1500 and position('{link}' in wa_message) > 0);
