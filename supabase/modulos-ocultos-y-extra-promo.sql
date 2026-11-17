-- ============================================================
-- 1) Módulos ocultos: para los cortes que todavía no se grabaron.
--    A diferencia de un módulo "bloqueado" (que muestra título, portada y
--    candado), un módulo OCULTO no aparece para nada en la plataforma del
--    alumno hasta que vos le saques el tilde en el admin. El admin lo sigue
--    viendo siempre, para poder cargarlo de a poco.
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
    and (not m.oculto or public.is_admin())
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
