-- Módulo extra (redes sociales): se puede comprar (o venir gratis por promo) en cualquier momento,
-- pero el contenido recién se libera 7 días después de esa compra/entitlement. Rodar una vez en el
-- SQL Editor del Supabase (idempotente).

create or replace function public.estado_extra()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with fecha as (
    select min(d) as desde from (
      select e.created_at as d from public.extra_compras e where lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      union all
      select s.purchased_at as d from public.subscriptions s
      where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', '')) and s.promo = true and s.refunded_at is null
    ) x
  )
  select case
    when public.is_admin() then jsonb_build_object('tiene_acceso', true, 'liberado', true, 'libera_en', null)
    when (select desde from fecha) is null then jsonb_build_object('tiene_acceso', false, 'liberado', false, 'libera_en', null)
    else jsonb_build_object(
      'tiene_acceso', true,
      'liberado', (select desde from fecha) + interval '7 days' <= now(),
      'libera_en', (select desde from fecha) + interval '7 days'
    )
  end
$$;
grant execute on function public.estado_extra() to authenticated;
