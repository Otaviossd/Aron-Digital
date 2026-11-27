-- Pone un piso (hora mínima) para que el Módulo 3 y el Módulo 4 abran recién mañana al mediodía,
-- para TODOS los que ya compraron, incluso si a alguno ya le tocaba abrir hoy por sus propios días
-- (unlock_after_days se cuenta desde la compra de cada alumno, así que sin este piso cada quien
-- abre en un horario distinto; con el piso, nadie lo ve antes de la hora fija).
-- Rodar una vez en el SQL Editor de Supabase.

-- 1) Columna nueva: hora mínima de apertura del módulo (independiente del día de compra de cada alumno).
--    Si queda en null, el módulo sigue abriendo solo por unlock_after_days, como siempre.
alter table public.modules add column if not exists unlock_at_min timestamptz;

-- 2) module_unlock_at() ahora respeta ese piso: abre en lo que sea más tarde entre
--    "compra + días" y el piso del módulo (si tiene uno puesto).
create or replace function public.module_unlock_at(p_module_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    -- admin ve todo liberado (para previsualizar el curso)
    case when public.is_admin() then now() - interval '1 second' end,
    (
      select greatest(
        sub.purchased_at + (m.unlock_after_days * interval '1 day'),
        coalesce(m.unlock_at_min, sub.purchased_at + (m.unlock_after_days * interval '1 day'))
      )
      from public.current_subscription() sub
      where sub.id is not null
    )
  )
  from public.modules m
  where m.id = p_module_id
$$;

-- 3) El piso de esta vez: Módulo 3 y Módulo 4 abren recién mañana (28/11) a las 12:00, hora de Paraguay.
update public.modules
set unlock_at_min = '2026-11-28 12:00:00-03'
where title in ('Módulo 3: Corte 1', 'Módulo 4: Corte 2', 'Módulo 3: Corte 1 · Pelo largo', 'Módulo 4: Corte 2 · (a definir)');
