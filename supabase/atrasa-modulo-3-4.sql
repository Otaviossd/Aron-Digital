-- Atrasa 1 día más la apertura del Módulo 3 y el Módulo 4.
-- unlock_after_days se cuenta desde la compra de cada alumno (module_unlock_at), así que
-- sumar 1 acá también atrasa a quien ya compró y todavía no llegó a esos módulos.
-- Rodar una vez en el SQL Editor del Supabase.

update public.modules
set unlock_after_days = unlock_after_days + 1
where title in ('Módulo 3: Corte 1', 'Módulo 4: Corte 2', 'Módulo 3: Corte 1 · Pelo largo', 'Módulo 4: Corte 2 · (a definir)');
