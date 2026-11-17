-- ============================================================
-- 1) Módulos "sin información todavía": para los cortes que se van a grabar
--    recién después del lanzamiento (no sabemos todavía cuántas clases van
--    a tener ni de qué corte van a ser).
--    El módulo SIGUE apareciendo en la lista (para que el alumno sepa que
--    va a haber más contenido) y SIGUE mostrando cuándo se libera, pero sin
--    título real, sin portada y sin descripción: se ve un cartel genérico
--    "Próximamente" con el candado. El admin siempre ve el título real (para
--    poder ir completándolo), y apenas le saques el tilde "oculto" en el
--    admin, el alumno empieza a ver el título y la portada de verdad.
-- ============================================================
alter table public.modules add column if not exists oculto boolean not null default false;

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
  is_live boolean,
  sin_info boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id,
    case when m.oculto and not public.is_admin() then 'Próximamente' else m.title end,
    case when m.oculto and not public.is_admin() then null else m.description end,
    m.position,
    m.unlock_after_days,
    case when m.oculto and not public.is_admin() then null else m.cover_url end,
    m.accent,
    public.module_unlock_at(m.id) as unlock_at,
    coalesce(public.module_unlock_at(m.id) <= now(), false) as is_unlocked,
    m.is_bonus,
    m.is_live,
    (m.oculto and not public.is_admin()) as sin_info
  from public.modules m
  where public.tiene_acceso()
  order by m.position
$$;

-- ============================================================
-- 2) Módulo extra (redes sociales): ahora también es gratis para quienes
--    compraron con el precio de lanzamiento (primeras 50 personas, promo=true
--    en subscriptions). Para el resto sigue siendo el upsell pago de siempre.
-- ============================================================
create or replace function public.tiene_extra()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.extra_compras e
      where lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
    or exists (
      select 1 from public.subscriptions s
      where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and s.promo = true
        and s.refunded_at is null
    )
$$;
