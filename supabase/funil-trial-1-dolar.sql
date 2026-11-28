-- Funil de entrada por US$1: la persona compra, entra a la plataforma y ve el Módulo 1 completo
-- + las primeras 2 clases del Módulo 2 ("Introducción" y "Huesos del cráneo"). El resto queda
-- bloqueado con un CTA para pasar a la promo de US$25 (la oferta que ya existe en la Hotmart).
-- Rodar una sola vez en el SQL Editor de Supabase.

-- 1) Nuevo plan "trial" (además de monthly/annual/lifetime).
alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check check (plan in ('monthly', 'annual', 'lifetime', 'trial'));

-- 2) Qué contenido entra en el trial. Si querés ajustar más adelante, es solo marcar/desmarcar acá.
alter table public.modules add column if not exists incluido_en_prueba boolean not null default false;
alter table public.lessons add column if not exists incluido_en_prueba boolean not null default false;

-- 2b) unlock_at_min también puede no existir todavía (la crea supabase/modulo3-4-piso-manana.sql,
--     pero si ese archivo no se corrió antes, este de acá lo necesita igual más abajo).
alter table public.modules add column if not exists unlock_at_min timestamptz;

update public.modules set incluido_en_prueba = true where position = 1;
update public.lessons l set incluido_en_prueba = true
from public.modules m
where l.module_id = m.id and m.position = 2 and l.position <= 2;

-- 3) ¿El usuario logueado tiene una suscripción "trial" activa?
create or replace function public.es_trial()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.current_subscription() sub where sub.plan = 'trial'
  )
$$;

-- 4) module_unlock_at(): para trial, abre YA si el módulo está marcado incluido_en_prueba;
--    si no, queda bloqueado (null) para siempre -- no por días, por alcance de la prueba.
--    Para cualquier otro plan, se comporta exactamente igual que antes.
create or replace function public.module_unlock_at(p_module_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_admin() then now() - interval '1 second'
    when public.es_trial() then (case when m.incluido_en_prueba then now() - interval '1 second' else null end)
    else (
      select greatest(
        sub.purchased_at + (m.unlock_after_days * interval '1 day'),
        coalesce(m.unlock_at_min, sub.purchased_at + (m.unlock_after_days * interval '1 day'))
      )
      from public.current_subscription() sub
      where sub.id is not null
    )
  end
  from public.modules m
  where m.id = p_module_id
$$;

-- 5) lesson_unlock_at(): igual idea, a nivel de clase (incluye las 2 primeras del Módulo 2).
create or replace function public.lesson_unlock_at(p_lesson_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_admin() then now() - interval '1 second'
    when public.es_trial() then (case when m.incluido_en_prueba or l.incluido_en_prueba then now() - interval '1 second' else null end)
    else (
      select sub.purchased_at + (greatest(m.unlock_after_days, l.unlock_after_days) * interval '1 day')
      from public.current_subscription() sub
      where sub.id is not null
    )
  end
  from public.lessons l
  join public.modules m on m.id = l.module_id
  where l.id = p_lesson_id
$$;
