-- Comunidad: fotos de corte + instructor en evidencia. Rodar uma vez no SQL Editor do Supabase.
-- Idempotente: pode rodar de novo sem problema.

-- 1. Coluna para guardar a foto (URL pública no bucket "comunidad").
alter table public.comentarios add column if not exists imagen_url text;

-- 2. Bucket público para as fotos que os alunos mandam na comunidad.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comunidad', 'comunidad', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8388608, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "comunidad_fotos_subir" on storage.objects;
create policy "comunidad_fotos_subir" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'comunidad' and public.tiene_acceso());

drop policy if exists "comunidad_fotos_leer" on storage.objects;
create policy "comunidad_fotos_leer" on storage.objects
  for select to public
  using (bucket_id = 'comunidad');

-- 3. listar_comentarios: agora también devuelve la foto.
create or replace function public.listar_comentarios(
  p_tipo text,
  p_lesson_id uuid default null,
  p_limit int default 30,
  p_antes timestamptz default null
)
returns table (
  id uuid,
  parent_id uuid,
  autor_nombre text,
  autor_avatar text,
  es_instructor boolean,
  es_mio boolean,
  cuerpo text,
  imagen_url text,
  fijado boolean,
  created_at timestamptz,
  likes int,
  yo_di_like boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with yo as (
    select lower(coalesce(auth.jwt() ->> 'email', '')) as email
  ),
  principales as (
    select c.*
    from public.comentarios c
    where public.tiene_acceso()
      and c.tipo = p_tipo
      and c.parent_id is null
      and (p_tipo <> 'aula' or c.lesson_id = p_lesson_id)
      and (p_antes is null or c.created_at < p_antes)
    order by c.created_at desc
    limit greatest(1, least(coalesce(p_limit, 30), 100))
  ),
  todos as (
    select * from principales
    union all
    select r.*
    from public.comentarios r
    where r.parent_id in (select p.id from principales p)
  )
  select
    t.id,
    t.parent_id,
    case when public.es_instructor(t.autor_email)
      then coalesce((select i.nombre from public.instructores i where lower(i.email) = lower(t.autor_email)), t.autor_nombre)
      else t.autor_nombre end,
    t.autor_avatar,
    public.es_instructor(t.autor_email),
    lower(t.autor_email) = (select email from yo),
    t.cuerpo,
    t.imagen_url,
    t.fijado,
    t.created_at,
    (select count(*)::int from public.comentario_likes l where l.comentario_id = t.id),
    exists (select 1 from public.comentario_likes l where l.comentario_id = t.id and lower(l.email) = (select email from yo))
  from todos t
  order by t.created_at asc
$$;

-- 4. publicar_comentario: acepta ahora una foto opcional (p_imagen_url).
drop function if exists public.publicar_comentario(text, uuid, uuid, text, text, text);
create or replace function public.publicar_comentario(
  p_tipo text,
  p_lesson_id uuid,
  p_parent_id uuid,
  p_cuerpo text,
  p_nombre text,
  p_avatar text,
  p_imagen_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_cuerpo text := btrim(coalesce(p_cuerpo, ''));
  v_nombre text := btrim(coalesce(p_nombre, ''));
  v_imagen text := nullif(btrim(coalesce(p_imagen_url, '')), '');
  v_parent public.comentarios;
  v_lesson uuid := p_lesson_id;
  v_tipo text := p_tipo;
  v_id uuid;
begin
  if v_email = '' or not public.tiene_acceso() then
    raise exception 'sin_acceso';
  end if;
  if char_length(v_cuerpo) = 0 and v_imagen is null then
    raise exception 'texto_invalido';
  end if;
  if char_length(v_cuerpo) > 2000 then
    raise exception 'texto_invalido';
  end if;
  if v_imagen is not null and v_imagen not like 'https://%/storage/v1/object/public/comunidad/%' then
    raise exception 'imagen_invalida';
  end if;
  if exists (
    select 1 from public.comentarios
    where lower(autor_email) = v_email and created_at > now() - interval '3 seconds'
  ) then
    raise exception 'muy_rapido';
  end if;

  if p_parent_id is not null then
    select * into v_parent from public.comentarios where id = p_parent_id;
    if v_parent.id is null then raise exception 'comentario_inexistente'; end if;
    -- las respuestas se cuelgan siempre del comentario principal
    if v_parent.parent_id is not null then
      select * into v_parent from public.comentarios where id = v_parent.parent_id;
    end if;
    v_tipo := v_parent.tipo;
    v_lesson := v_parent.lesson_id;
  end if;

  if v_tipo = 'aula' then
    if v_lesson is null or not coalesce(public.lesson_unlock_at(v_lesson) <= now(), false) then
      raise exception 'clase_cerrada';
    end if;
  elsif v_tipo = 'comunidad' then
    v_lesson := null;
  else
    raise exception 'tipo_invalido';
  end if;

  if v_nombre = '' then v_nombre := split_part(v_email, '@', 1); end if;
  v_nombre := left(v_nombre, 60);

  insert into public.comentarios (tipo, lesson_id, parent_id, autor_email, autor_nombre, autor_avatar, cuerpo, imagen_url)
  values (v_tipo, v_lesson, v_parent.id, v_email, v_nombre, nullif(btrim(coalesce(p_avatar, '')), ''), coalesce(v_cuerpo, ''), v_imagen)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.listar_comentarios(text, uuid, int, timestamptz) to authenticated;
grant execute on function public.publicar_comentario(text, uuid, uuid, text, text, text, text) to authenticated;
