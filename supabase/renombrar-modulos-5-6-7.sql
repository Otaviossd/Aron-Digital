-- Saca el "(a definir)" de los módulos 5, 6 y 7 (todavía sin corte asignado) y deja un nombre
-- genérico de marca ("Corte exclusivo") en su lugar, hasta que Otávio decida/grabe el corte real.
-- Rodar una vez en el SQL Editor de Supabase. Es seguro correrlo aunque alguno ya tenga el nombre
-- nuevo (el where position=N siempre apunta al módulo correcto, no depende del título actual).

update public.modules set title = 'Módulo 5: Corte exclusivo' where position = 5;
update public.modules set title = 'Módulo 6: Corte exclusivo' where position = 6;
update public.modules set title = 'Módulo 7: Corte exclusivo' where position = 7;
