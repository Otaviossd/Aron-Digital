-- ============================================================
-- Plataforma v2: comentarios en clases (con sello de Instructor), comunidad,
-- certificado en PDF y clases en vivo con chat.
--
-- Es ADITIVO: no borra datos ni tablas existentes. Se puede ejecutar más de una vez.
-- Pegar entero en el SQL Editor de Supabase y ejecutar.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Ayudas
-- ------------------------------------------------------------

-- Tiene acceso al curso: suscripción vigente o admin.
create or replace function public.tiene_acceso()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.subscriptions s
    where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and s.refunded_at is null
      and (
        (s.status = 'active' and (s.access_until is null or s.access_until > now()))
        or (s.status = 'cancelled' and s.access_until is not null and s.access_until > now())
      )
  )
$$;

-- Los módulos de clases en vivo (grabaciones) no cuentan para el progreso ni para el certificado.
alter table public.modules add column if not exists is_live boolean not null default false;

-- my_modules() ahora también devuelve is_live (el resto queda igual).
drop function if exists public.my_modules();
create or replace function public.my_modules()
returns table (
  id uuid,
  title text,
  description text,
  "position" int,
  unlock_after_days int,
  cover_url text,
  accent text,
  unlock_at timestamptz,
  is_unlocked boolean,
  is_bonus boolean,
  is_live boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id,
    m.title,
    m.description,
    m.position,
    m.unlock_after_days,
    m.cover_url,
    m.accent,
    public.module_unlock_at(m.id) as unlock_at,
    coalesce(public.module_unlock_at(m.id) <= now(), false) as is_unlocked,
    m.is_bonus,
    m.is_live
  from public.modules m
  where public.tiene_acceso()
  order by m.position
$$;

-- Instructores verificados: sus comentarios y mensajes salen con el sello "Instructor".
create table if not exists public.instructores (
  email text primary key,
  nombre text not null default 'Aaron Dalla Rosa'
);
alter table public.instructores enable row level security;

drop policy if exists "instructores_admin_all" on public.instructores;
create policy "instructores_admin_all" on public.instructores
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.es_instructor(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.instructores i where lower(i.email) = lower(coalesce(p_email, '')))
$$;

-- ------------------------------------------------------------
-- 1. Comentarios (por clase) y comunidad (feed general)
-- ------------------------------------------------------------

create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('aula', 'comunidad')),
  lesson_id uuid references public.lessons(id) on delete cascade,
  parent_id uuid references public.comentarios(id) on delete cascade,
  autor_email text not null,
  autor_nombre text not null,
  autor_avatar text,
  cuerpo text not null check (char_length(btrim(cuerpo)) between 1 and 2000),
  fijado boolean not null default false,
  created_at timestamptz not null default now(),
  check ((tipo = 'aula') = (lesson_id is not null))
);

create index if not exists comentarios_aula_idx on public.comentarios (lesson_id, created_at desc) where tipo = 'aula';
create index if not exists comentarios_tipo_idx on public.comentarios (tipo, created_at desc);
create index if not exists comentarios_parent_idx on public.comentarios (parent_id);
create index if not exists comentarios_autor_idx on public.comentarios (lower(autor_email), created_at desc);

create table if not exists public.comentario_likes (
  comentario_id uuid not null references public.comentarios(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  primary key (comentario_id, email)
);

alter table public.comentarios enable row level security;
alter table public.comentario_likes enable row level security;

-- Los alumnos no leen estas tablas directo (traerían los e-mails de los demás): usan las funciones de abajo.
drop policy if exists "comentarios_admin_all" on public.comentarios;
create policy "comentarios_admin_all" on public.comentarios
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "comentario_likes_admin_select" on public.comentario_likes;
create policy "comentario_likes_admin_select" on public.comentario_likes
  for select to authenticated
  using (public.is_admin());

-- Lista los comentarios de una clase ("aula") o el feed ("comunidad"), con respuestas, likes y sello.
-- p_antes: para paginar (trae los principales anteriores a esa fecha).
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
    t.fijado,
    t.created_at,
    (select count(*)::int from public.comentario_likes l where l.comentario_id = t.id),
    exists (select 1 from public.comentario_likes l where l.comentario_id = t.id and lower(l.email) = (select email from yo))
  from todos t
  order by t.created_at asc
$$;

-- Publica un comentario o una respuesta. Valida acceso, que la clase esté abierta y frena el spam.
create or replace function public.publicar_comentario(
  p_tipo text,
  p_lesson_id uuid,
  p_parent_id uuid,
  p_cuerpo text,
  p_nombre text,
  p_avatar text
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
  v_parent public.comentarios;
  v_lesson uuid := p_lesson_id;
  v_tipo text := p_tipo;
  v_id uuid;
begin
  if v_email = '' or not public.tiene_acceso() then
    raise exception 'sin_acceso';
  end if;
  if char_length(v_cuerpo) = 0 or char_length(v_cuerpo) > 2000 then
    raise exception 'texto_invalido';
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

  insert into public.comentarios (tipo, lesson_id, parent_id, autor_email, autor_nombre, autor_avatar, cuerpo)
  values (v_tipo, v_lesson, v_parent.id, v_email, v_nombre, nullif(btrim(coalesce(p_avatar, '')), ''), v_cuerpo)
  returning id into v_id;

  return v_id;
end;
$$;

-- Like / quitar like. Devuelve true si quedó con like.
create or replace function public.alternar_like(p_comentario_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if v_email = '' or not public.tiene_acceso() then
    raise exception 'sin_acceso';
  end if;
  if not exists (select 1 from public.comentarios where id = p_comentario_id) then
    raise exception 'comentario_inexistente';
  end if;
  if exists (select 1 from public.comentario_likes where comentario_id = p_comentario_id and lower(email) = v_email) then
    delete from public.comentario_likes where comentario_id = p_comentario_id and lower(email) = v_email;
    return false;
  end if;
  insert into public.comentario_likes (comentario_id, email) values (p_comentario_id, v_email);
  return true;
end;
$$;

-- Borra un comentario propio (o cualquiera, si es admin). Las respuestas se van con él.
create or replace function public.borrar_comentario(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  delete from public.comentarios
  where id = p_id and (public.is_admin() or lower(autor_email) = v_email);
  return found;
end;
$$;

-- Fija / desfija un comentario (solo admin).
create or replace function public.fijar_comentario(p_id uuid, p_fijado boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'solo_admin'; end if;
  update public.comentarios set fijado = p_fijado where id = p_id and parent_id is null;
end;
$$;

-- ------------------------------------------------------------
-- 2. Certificado
-- ------------------------------------------------------------

create table if not exists public.certificados (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  email text not null,
  nombre_completo text not null,
  horas numeric(6, 1) not null default 0,
  clases int not null default 0,
  emitido_at timestamptz not null default now()
);
create unique index if not exists certificados_email_idx on public.certificados (lower(email));

alter table public.certificados enable row level security;

drop policy if exists "certificados_select_own" on public.certificados;
create policy "certificados_select_own" on public.certificados
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "certificados_admin_select" on public.certificados;
create policy "certificados_admin_select" on public.certificados
  for select to authenticated
  using (public.is_admin());

-- Avance del curso principal (sin bonos ni clases en vivo), contando TODAS las clases publicadas,
-- también las que todavía no se abrieron: el certificado exige haber terminado el curso completo.
create or replace function public.progreso_curso()
returns table (total int, hechas int, minutos int, elegible boolean)
language sql
stable
security definer
set search_path = public
as $$
  with yo as (select lower(coalesce(auth.jwt() ->> 'email', '')) as email),
  base as (
    select
      count(*)::int as total,
      count(p.lesson_id)::int as hechas,
      coalesce(sum(l.duration_minutes), 0)::int as minutos
    from public.lessons l
    join public.modules m on m.id = l.module_id
    left join public.lesson_progress p
      on p.lesson_id = l.id and lower(p.user_email) = (select email from yo)
    where not m.is_bonus and not m.is_live and l.published_at <= now()
  )
  select b.total, b.hechas, b.minutos, (b.total > 0 and b.hechas = b.total)
  from base b
  where public.tiene_acceso()
$$;

-- Emite (o actualiza el nombre de) el certificado de quien terminó el 100% del curso.
create or replace function public.emitir_certificado(p_nombre text)
returns public.certificados
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_nombre text := regexp_replace(btrim(coalesce(p_nombre, '')), '\s+', ' ', 'g');
  v_prog record;
  v_cert public.certificados;
  v_codigo text;
begin
  if v_email = '' or not public.tiene_acceso() then
    raise exception 'sin_acceso';
  end if;
  if char_length(v_nombre) < 5 or char_length(v_nombre) > 80 or position(' ' in v_nombre) = 0 then
    raise exception 'nombre_invalido';
  end if;

  select * into v_prog from public.progreso_curso();
  if v_prog.elegible is not true then
    raise exception 'curso_incompleto';
  end if;

  select * into v_cert from public.certificados where lower(email) = v_email;
  if v_cert.id is not null then
    update public.certificados set nombre_completo = v_nombre where id = v_cert.id returning * into v_cert;
    return v_cert;
  end if;

  loop
    v_codigo := 'LNO-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4))
                || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    exit when not exists (select 1 from public.certificados where codigo = v_codigo);
  end loop;

  insert into public.certificados (codigo, email, nombre_completo, horas, clases)
  values (v_codigo, v_email, v_nombre, round(v_prog.minutos / 60.0, 1), v_prog.total)
  returning * into v_cert;

  return v_cert;
end;
$$;

-- Verificación pública: cualquiera con el código puede comprobar que el certificado existe.
create or replace function public.verificar_certificado(p_codigo text)
returns table (nombre_completo text, emitido_at timestamptz, horas numeric, clases int)
language sql
stable
security definer
set search_path = public
as $$
  select c.nombre_completo, c.emitido_at, c.horas, c.clases
  from public.certificados c
  where upper(c.codigo) = upper(btrim(coalesce(p_codigo, '')))
$$;

-- ------------------------------------------------------------
-- 3. Clases en vivo
-- ------------------------------------------------------------

create table if not exists public.lives (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  estado text not null default 'programada' check (estado in ('programada', 'en_vivo', 'terminada')),
  -- URL para incrustar el directo (YouTube en vivo no listado, por ejemplo)
  video_url text,
  programada_para timestamptz,
  inicio_at timestamptz,
  fin_at timestamptz,
  -- clase creada en el módulo "Clases en vivo" al terminar
  lesson_id uuid references public.lessons(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Solo puede haber una clase en vivo a la vez.
create unique index if not exists lives_una_en_vivo_idx on public.lives ((estado)) where estado = 'en_vivo';

alter table public.lives enable row level security;

drop policy if exists "lives_admin_all" on public.lives;
create policy "lives_admin_all" on public.lives
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.live_mensajes (
  id bigint generated always as identity primary key,
  live_id uuid not null references public.lives(id) on delete cascade,
  autor_id uuid,
  autor_nombre text not null,
  autor_avatar text,
  es_instructor boolean not null default false,
  cuerpo text not null check (char_length(btrim(cuerpo)) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists live_mensajes_idx on public.live_mensajes (live_id, id);

alter table public.live_mensajes enable row level security;

-- No guarda e-mails: se puede leer (y recibir por realtime) sin exponer a nadie.
drop policy if exists "live_mensajes_select" on public.live_mensajes;
create policy "live_mensajes_select" on public.live_mensajes
  for select to authenticated
  using ((select public.tiene_acceso()));

drop policy if exists "live_mensajes_admin_delete" on public.live_mensajes;
create policy "live_mensajes_admin_delete" on public.live_mensajes
  for delete to authenticated
  using (public.is_admin());

-- Lo que ve el alumno: la clase en vivo actual, o la próxima programada.
-- El enlace del directo solo sale cuando está en vivo.
create or replace function public.live_actual()
returns table (
  id uuid,
  titulo text,
  estado text,
  video_url text,
  programada_para timestamptz,
  inicio_at timestamptz,
  fin_at timestamptz,
  lesson_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select l.id, l.titulo, l.estado,
    case when l.estado = 'en_vivo' then l.video_url end,
    l.programada_para, l.inicio_at, l.fin_at, l.lesson_id
  from public.lives l
  where public.tiene_acceso()
    and (
      l.estado = 'en_vivo'
      or (l.estado = 'programada' and coalesce(l.programada_para, now()) > now() - interval '12 hours')
      -- terminó hace poco: así quien está viendo se entera y ve el aviso de cierre
      or (l.estado = 'terminada' and l.fin_at > now() - interval '30 minutes')
    )
  order by (l.estado = 'en_vivo') desc, (l.estado = 'terminada') asc, l.programada_para asc nulls last, l.fin_at desc
  limit 1
$$;

-- Envía un mensaje al chat de la clase en vivo.
create or replace function public.enviar_mensaje_live(
  p_live_id uuid,
  p_cuerpo text,
  p_nombre text,
  p_avatar text
)
returns public.live_mensajes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_uid uuid := auth.uid();
  v_cuerpo text := btrim(coalesce(p_cuerpo, ''));
  v_nombre text := btrim(coalesce(p_nombre, ''));
  v_msg public.live_mensajes;
begin
  if v_email = '' or not public.tiene_acceso() then
    raise exception 'sin_acceso';
  end if;
  if char_length(v_cuerpo) = 0 or char_length(v_cuerpo) > 300 then
    raise exception 'texto_invalido';
  end if;
  if not exists (select 1 from public.lives where id = p_live_id and estado = 'en_vivo') then
    raise exception 'live_cerrada';
  end if;
  if exists (
    select 1 from public.live_mensajes
    where live_id = p_live_id and autor_id is not distinct from v_uid and created_at > now() - interval '1 second'
  ) then
    raise exception 'muy_rapido';
  end if;
  if v_nombre = '' then v_nombre := split_part(v_email, '@', 1); end if;

  insert into public.live_mensajes (live_id, autor_id, autor_nombre, autor_avatar, es_instructor, cuerpo)
  values (
    p_live_id, v_uid,
    case when public.es_instructor(v_email)
      then coalesce((select i.nombre from public.instructores i where lower(i.email) = v_email), left(v_nombre, 60))
      else left(v_nombre, 60) end,
    nullif(btrim(coalesce(p_avatar, '')), ''),
    public.es_instructor(v_email),
    v_cuerpo
  )
  returning * into v_msg;

  return v_msg;
end;
$$;

-- Garantiza que exista el módulo donde quedan las grabaciones.
create or replace function public.modulo_lives()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then raise exception 'solo_admin'; end if;
  select id into v_id from public.modules where is_live order by position limit 1;
  if v_id is null then
    insert into public.modules (title, description, position, unlock_after_days, is_live, accent)
    values (
      'Clases en vivo',
      'Todas las clases en vivo de Aaron, grabadas completas. Entran solas apenas termina cada live.',
      90, 0, true, '#ff3d71'
    )
    returning id into v_id;
  end if;
  return v_id;
end;
$$;

-- Termina el directo. Si p_publicar, crea la clase con la grabación en el módulo "Clases en vivo"
-- con el título "Clase en vivo del 16 de noviembre de 2026" y queda disponible para quien compre después.
-- Devuelve el id de la clase creada (o null).
create or replace function public.finalizar_live(
  p_live_id uuid,
  p_publicar boolean default true,
  p_video_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_live public.lives;
  v_modulo uuid;
  v_lesson uuid;
  v_meses text[] := array['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  v_local timestamp;
  v_titulo text;
  v_video text;
  v_minutos int;
begin
  if not public.is_admin() then raise exception 'solo_admin'; end if;

  select * into v_live from public.lives where id = p_live_id for update;
  if v_live.id is null then raise exception 'live_inexistente'; end if;
  if v_live.estado = 'terminada' and v_live.lesson_id is not null then
    return v_live.lesson_id;
  end if;

  update public.lives
  set estado = 'terminada', fin_at = coalesce(fin_at, now())
  where id = p_live_id
  returning * into v_live;

  if not coalesce(p_publicar, true) then
    return null;
  end if;

  v_video := coalesce(nullif(btrim(coalesce(p_video_url, '')), ''), v_live.video_url);
  v_local := coalesce(v_live.inicio_at, now()) at time zone 'America/Asuncion';
  v_titulo := 'Clase en vivo del ' || extract(day from v_local)::int || ' de '
              || v_meses[extract(month from v_local)::int] || ' de ' || extract(year from v_local)::int;
  v_minutos := greatest(1, round(extract(epoch from (v_live.fin_at - coalesce(v_live.inicio_at, v_live.fin_at))) / 60.0)::int);
  v_modulo := public.modulo_lives();

  insert into public.lessons (module_id, title, description, position, video_url, duration_minutes, unlock_after_days)
  values (
    v_modulo,
    v_titulo,
    v_live.titulo,
    -- las más nuevas arriba
    coalesce((select min(l.position) from public.lessons l where l.module_id = v_modulo), 0) - 1,
    v_video,
    v_minutos,
    0
  )
  returning id into v_lesson;

  update public.lives set lesson_id = v_lesson where id = p_live_id;
  return v_lesson;
end;
$$;

-- Realtime: el chat llega en directo a alumnos y al panel de Aaron.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_mensajes'
     ) then
    alter publication supabase_realtime add table public.live_mensajes;
  end if;
end $$;

-- ------------------------------------------------------------
-- 4. Permisos de ejecución (solo logueados; la verificación del certificado es pública)
-- ------------------------------------------------------------

revoke execute on function
  public.tiene_acceso(), public.es_instructor(text),
  public.listar_comentarios(text, uuid, int, timestamptz),
  public.publicar_comentario(text, uuid, uuid, text, text, text),
  public.alternar_like(uuid), public.borrar_comentario(uuid), public.fijar_comentario(uuid, boolean),
  public.progreso_curso(), public.emitir_certificado(text),
  public.live_actual(), public.enviar_mensaje_live(uuid, text, text, text),
  public.modulo_lives(), public.finalizar_live(uuid, boolean, text)
from public, anon;

grant execute on function
  public.tiene_acceso(), public.es_instructor(text),
  public.listar_comentarios(text, uuid, int, timestamptz),
  public.publicar_comentario(text, uuid, uuid, text, text, text),
  public.alternar_like(uuid), public.borrar_comentario(uuid), public.fijar_comentario(uuid, boolean),
  public.progreso_curso(), public.emitir_certificado(text),
  public.live_actual(), public.enviar_mensaje_live(uuid, text, text, text),
  public.modulo_lives(), public.finalizar_live(uuid, boolean, text)
to authenticated, service_role;

grant execute on function public.verificar_certificado(text) to anon, authenticated, service_role;
