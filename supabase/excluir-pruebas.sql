-- Excluir e-mails de teste dos números do painel. Rode no SQL Editor do Supabase (pode repetir).
-- Para excluir mais e-mails: insert into public.emails_excluidos (email) values ('alguien@gmail.com');

-- ============================================================
-- E-mails de teste: não contam em nenhum número do painel do admin
-- ============================================================
create table if not exists public.emails_excluidos (
  email text primary key check (email = lower(email))
);
alter table public.emails_excluidos enable row level security;
drop policy if exists "emails_excluidos_admin_select" on public.emails_excluidos;
create policy "emails_excluidos_admin_select" on public.emails_excluidos
  for select to authenticated using (public.is_admin());
insert into public.emails_excluidos (email) values
  ('otavio.gabriel.0256@gmail.com'),
  ('tape.agency.py@gmail.com')
on conflict do nothing;

create or replace function public.es_prueba(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.emails_excluidos where email = lower(p_email))
$$;

create or replace function public.email_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'leads', (select count(*) from public.leads where not public.es_prueba(email)),
    'captura', (select count(*) from public.leads where source = 'captura' and not public.es_prueba(email)),
    'pendientes', (select count(*) from public.leads where checkout_at is not null and converted_at is null and unsubscribed_at is null and not public.es_prueba(email)),
    'bajas', (select count(*) from public.leads where unsubscribed_at is not null and not public.es_prueba(email)),
    'enviados', (
      select coalesce(jsonb_object_agg(step::text, n), '{}'::jsonb)
      from (select es.step, count(*) as n from public.email_sends es join public.leads ld on ld.id = es.lead_id where not public.es_prueba(ld.email) group by es.step) s
    ),
    -- recuperados: compraram depois de receber pelo menos um e-mail da sequência
    'recuperados', (
      select count(*) from public.leads l
      where l.converted_at is not null and not public.es_prueba(l.email)
        and exists (select 1 from public.email_sends e where e.lead_id = l.id and e.sent_at < l.converted_at)
    )
  )
  where public.is_admin()
$$;

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
    where s.refunded_at is null and not public.es_prueba(s.email)
      and ((s.status = 'active' and (s.access_until is null or s.access_until > now())) or (s.status = 'cancelled' and s.access_until is not null and s.access_until > now()))
    order by lower(s.email), s.purchased_at desc
  )
  select jsonb_build_object(
    'activos', (select count(*) from con_acceso),
    'activos_mensual', (select count(*) from con_acceso where plan = 'monthly'),
    'activos_anual', (select count(*) from con_acceso where plan = 'annual'),
    'activos_vitalicio', (select count(*) from con_acceso where plan = 'lifetime'),
    'compras', (select count(*) from public.subscriptions where not public.es_prueba(email)),
    'compras_7d', (select count(*) from public.subscriptions where purchased_at > now() - interval '7 days' and not public.es_prueba(email)),
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

create or replace function public.admin_alumnos()
returns table (
  email text, plan text, status text, purchased_at timestamptz, access_until timestamptz,
  refunded_at timestamptz, con_acceso boolean, completadas int, vistas int, ultima_vista timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.email, s.plan, s.status, s.purchased_at, s.access_until, s.refunded_at,
    (s.refunded_at is null and ((s.status = 'active' and (s.access_until is null or s.access_until > now())) or (s.status = 'cancelled' and s.access_until is not null and s.access_until > now()))),
    (select count(*)::int from public.lesson_progress p where lower(p.user_email) = lower(s.email)),
    (select coalesce(sum(v.views), 0)::int from public.lesson_views v where lower(v.user_email) = lower(s.email)),
    (select max(v.last_viewed_at) from public.lesson_views v where lower(v.user_email) = lower(s.email))
  from public.subscriptions s
  where public.is_admin() and not public.es_prueba(s.email)
  order by s.purchased_at desc
  limit 1000
$$;

create or replace function public.admin_embudo(p_days int default 30)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with ev as (
    select * from public.page_events
    where created_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
  )
  select jsonb_build_object(
    'paginas', (
      select coalesce(jsonb_agg(t order by t.path), '[]'::jsonb) from (
        select path,
          (count(distinct visitor_id) filter (where kind = 'view'))::int as visitantes,
          (count(distinct visitor_id) filter (where kind = 'lead'))::int as registros,
          (count(distinct visitor_id) filter (where kind = 'checkout'))::int as checkout
        from ev group by path
      ) t
    ),
    'origenes', (
      select coalesce(jsonb_agg(t order by t.visitantes desc), '[]'::jsonb) from (
        select coalesce(nullif(source, ''), 'directo') as origen,
          (count(distinct visitor_id) filter (where kind = 'view'))::int as visitantes,
          (count(distinct visitor_id) filter (where kind = 'lead'))::int as registros,
          (count(distinct visitor_id) filter (where kind = 'checkout'))::int as checkout
        from ev group by 1 order by 2 desc limit 10
      ) t
    ),
    'registros_lista', (
      select count(*) from public.leads
      where source = 'captura' and not public.es_prueba(email) and created_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
    ),
    'compras', (
      select count(*) from public.subscriptions
      where not public.es_prueba(email) and purchased_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
    )
  )
  where public.is_admin()
$$;
