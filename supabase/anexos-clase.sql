-- ============================================================
-- Anexo (PDF) por clase: permite subir una guía descargable junto al video.
-- ============================================================

alter table public.lessons add column if not exists attachment_url text;
alter table public.lessons add column if not exists attachment_name text;

insert into storage.buckets (id, name, public)
values ('materiales', 'materiales', true)
on conflict (id) do nothing;

drop policy if exists "materiales_admin_write" on storage.objects;
create policy "materiales_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'materiales' and public.is_admin())
  with check (bucket_id = 'materiales' and public.is_admin());
