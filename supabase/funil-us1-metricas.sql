-- Números del funil de US$1 para el panel del equipo: separa a los que entraron por US$1 de los
-- alumnos que ya compraron de verdad, y mide cuántos vencieron el plazo de 3 días sin pasar a la
-- promo (candidatos a una campaña de reenganche con un % de descuento más adelante).
-- Requiere haber corrido antes supabase/funil-trial-1-dolar.sql (usa el plan "trial" y las columnas
-- incluido_en_prueba). Rodar una sola vez en el SQL Editor de Supabase.

-- 1) admin_resumen(): separa "activos" (compradores reales) de "activos_trial" (entraron por US$1),
--    para que el número principal del panel no mezcle las dos cosas.
create or replace function public.admin_resumen()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with con_acceso as (
    select distinct on (lower(s.email)) lower(s.email) as email, s.plan
    from public.subscriptions s
    where s.refunded_at is null and not public.es_prueba(s.email) and s.plan <> 'trial'
      and ((s.status = 'active' and (s.access_until is null or s.access_until > now())) or (s.status = 'cancelled' and s.access_until is not null and s.access_until > now()))
    order by lower(s.email), s.purchased_at desc
  ),
  trial_activos as (
    select distinct on (lower(s.email)) lower(s.email) as email
    from public.subscriptions s
    where s.plan = 'trial' and s.refunded_at is null and not public.es_prueba(s.email) and s.status = 'active'
    order by lower(s.email), s.purchased_at desc
  )
  select jsonb_build_object(
    'activos', (select count(*) from con_acceso),
    'activos_mensual', (select count(*) from con_acceso where plan = 'monthly'),
    'activos_anual', (select count(*) from con_acceso where plan = 'annual'),
    'activos_vitalicio', (select count(*) from con_acceso where plan = 'lifetime'),
    'activos_trial', (select count(*) from trial_activos),
    'compras', (select count(*) from public.subscriptions where not public.es_prueba(email) and plan <> 'trial'),
    'compras_7d', (select count(*) from public.subscriptions where purchased_at > now() - interval '7 days' and not public.es_prueba(email) and plan <> 'trial'),
    'reembolsos', (select count(*) from public.subscriptions where refunded_at is not null and not public.es_prueba(email)),
    'viendo_24h', (select count(distinct lower(user_email)) from public.lesson_views where last_viewed_at > now() - interval '24 hours' and not public.es_prueba(user_email)),
    'viendo_7d', (select count(distinct lower(user_email)) from public.lesson_views where last_viewed_at > now() - interval '7 days' and not public.es_prueba(user_email)),
    'viendo_30d', (select count(distinct lower(user_email)) from public.lesson_views where last_viewed_at > now() - interval '30 days' and not public.es_prueba(user_email)),
    'vistas', (select coalesce(sum(views), 0) from public.lesson_views where not public.es_prueba(user_email)),
    'completadas', (select count(*) from public.lesson_progress where not public.es_prueba(user_email)),
    'aulas', (select count(*) from public.lessons where published_at <= now()),
    'modulos', (select count(*) from public.modules),
    'top_clases', (
      select coalesce(jsonb_agg(t order by t.vistas desc), '[]'::jsonb) from (
        select l.title, sum(v.views)::int as vistas, count(*)::int as alumnos
        from public.lesson_views v join public.lessons l on l.id = v.lesson_id
        where not public.es_prueba(v.user_email)
        group by l.id, l.title order by sum(v.views) desc limit 5
      ) t
    ),
    'actividad', (
      select coalesce(jsonb_agg(t order by t.cuando desc), '[]'::jsonb) from (
        select v.user_email as email, l.title as clase, v.last_viewed_at as cuando
        from public.lesson_views v join public.lessons l on l.id = v.lesson_id
        where not public.es_prueba(v.user_email)
        order by v.last_viewed_at desc limit 8
      ) t
    )
  )
  where public.is_admin()
$$;

-- 2) admin_funil_trial(): el detalle de quién entró por US$1 — cuántos ya vieron todo lo disponible,
--    cuántos siguen dentro de los 3 días para pasar a la promo, cuántos lo dejaron vencer sin pasarse
--    (para una futura campaña de reenganche con descuento) y cuántos ya se convirtieron en alumnos reales.
create or replace function public.admin_funil_trial()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with trial_activos as (
    select distinct on (lower(s.email)) lower(s.email) as email, s.purchased_at
    from public.subscriptions s
    where s.plan = 'trial' and s.refunded_at is null and not public.es_prueba(s.email) and s.status = 'active'
    order by lower(s.email), s.purchased_at desc
  ),
  total_trial as (
    select count(*)::int as n
    from public.lessons l
    join public.modules m on m.id = l.module_id
    where l.published_at <= now() and (m.incluido_en_prueba or l.incluido_en_prueba)
  ),
  detalle as (
    select
      t.email,
      t.purchased_at,
      (
        select count(*) from public.lesson_progress p
        join public.lessons l on l.id = p.lesson_id
        join public.modules m on m.id = l.module_id
        where lower(p.user_email) = t.email and (m.incluido_en_prueba or l.incluido_en_prueba)
      )::int as hechas,
      (now() > t.purchased_at + interval '3 days') as vencido,
      exists (
        select 1 from public.subscriptions s2
        where lower(s2.email) = t.email and s2.plan <> 'trial' and s2.refunded_at is null
      ) as convertido
    from trial_activos t
  )
  select jsonb_build_object(
    'activos', (select count(*) from trial_activos),
    'completaron_contenido', (select count(*) from detalle, total_trial where total_trial.n > 0 and detalle.hechas >= total_trial.n),
    'dentro_del_plazo', (select count(*) from detalle where not vencido and not convertido),
    'vencidos_sin_upgrade', (select count(*) from detalle where vencido and not convertido),
    'convertidos', (select count(*) from detalle where convertido)
  )
  where public.is_admin()
$$;
