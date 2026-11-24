-- Renombra 3 módulos. Rodar una vez en el SQL Editor del Supabase. Idempotente.

update public.modules set title = 'Módulo 3: Corte 1' where title = 'Módulo 3: Corte 1 · Pelo largo';
update public.modules set title = 'Módulo 4: Corte 2' where title = 'Módulo 4: Corte 2 · (a definir)';
update public.modules set title = 'Bono: Mentalidad de barbero exitoso' where title = 'Bono: Mindset del barbero rico';
