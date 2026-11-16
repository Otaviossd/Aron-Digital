-- ============================================================
-- Corrige el Módulo 1 de una vez: nombre, el orden exacto que pediste,
-- los videos de Bunny en cada clase, y saca cualquier clase de OTRO
-- módulo que haya quedado mezclada ahí adentro. Es idempotente: podés
-- correrlo más de una vez sin que duplique ni rompa nada.
--
-- Orden final del Módulo 1:
--   1. Bienvenida
--   2. Cómo funciona la plataforma
--   3. Cómo entrar a tu cuenta
--   4. Clases bloqueadas y módulos bonus
--   5. Soporte, clases en vivo y comunidad
--   6. Cómo sacarle el máximo al curso
--   7. Clase extra: cómo crecer en redes sociales
--   8. Próximos pasos
--   9. Qué esperar de este curso  (todavía sin video; queda al final, no se borra)
-- ============================================================

-- 0) Asegura el nombre del módulo
update public.modules
set title = 'Módulo 1: Bienvenida y primeros pasos'
where title in ('Módulo 1: Bienvenida', 'Módulo 1: Bienvenida y primeros pasos');

-- 1) Por las dudas: si alguna clase de OTRO módulo (por ej. "Postura y agarre",
--    que es del Módulo 2, o algo de "Corte 1") quedó con el module_id del
--    Módulo 1 por error, la devuelve a su módulo correcto según el título.
update public.lessons l
set module_id = destino.id
from public.modules origen, public.modules destino, (values
  ('Herramientas y equipamiento', 'Módulo 2: Fundamentos de la barbería'),
  ('Higiene y bioseguridad', 'Módulo 2: Fundamentos de la barbería'),
  ('Tipos de cabello y cuero cabelludo', 'Módulo 2: Fundamentos de la barbería'),
  ('Mapa de la cabeza', 'Módulo 2: Fundamentos de la barbería'),
  ('Postura y agarre', 'Módulo 2: Fundamentos de la barbería'),
  ('Consulta con el cliente', 'Módulo 2: Fundamentos de la barbería')
) as v(titulo, modulo_destino)
where origen.title = 'Módulo 1: Bienvenida y primeros pasos'
and l.module_id = origen.id
and l.title = v.titulo
and destino.title = v.modulo_destino;

-- 2) Si quedaron clases DUPLICADAS con el mismo título dentro del Módulo 1
--    (mismo título, dos filas), deja solo una: la que ya tiene video, o si
--    ninguna tiene, la más vieja.
delete from public.lessons l
using public.lessons l2, public.modules m
where m.title = 'Módulo 1: Bienvenida y primeros pasos'
and l.module_id = m.id and l2.module_id = m.id
and l.title = l2.title
and (
  (l.video_url is null and l2.video_url is not null)
  or (l.video_url is null and l2.video_url is null and l.created_at > l2.created_at)
  or (l.video_url is not null and l2.video_url is not null and l.created_at > l2.created_at)
);

-- 3) Orden y video de cada clase (GUID de Bunny, library 808490)
update public.lessons l
set position = v.pos,
    video_url = coalesce('https://iframe.mediadelivery.net/embed/808490/' || v.guid, l.video_url)
from public.modules m, (values
  ('Bienvenida',                                 1, 'a88ff276-4d30-461f-8dc2-746bec86fd7b'),
  ('Cómo funciona la plataforma',                2, '71ec2d58-2138-49d1-ba9c-5f2f9cd6bc1b'),
  ('Cómo entrar a tu cuenta',                    3, '8f77d2fe-3812-4c43-aed0-55cdffef8b1e'),
  ('Clases bloqueadas y módulos bonus',          4, '77772e51-a28d-4cd1-8215-4f1dd565457e'),
  ('Soporte, clases en vivo y comunidad',        5, '1fa732b4-a9f5-40b8-a9c9-16a6d04c4c16'),
  ('Cómo sacarle el máximo al curso',            6, 'a36a5d9b-a3f8-4a22-b8a5-0648b869f299'),
  ('Clase extra: cómo crecer en redes sociales', 7, '8bc51c07-b13b-475b-854b-07face9f3021'),
  ('Próximos pasos',                             8, '98942711-ce48-4a4e-b204-50a2c1d4546e'),
  ('Qué esperar de este curso',                  9, null)
) as v(titulo, pos, guid)
where m.title = 'Módulo 1: Bienvenida y primeros pasos'
and l.module_id = m.id
and l.title = v.titulo;

-- 4) Verificación: esto te tiene que mostrar exactamente 9 filas, en este orden
select l.position, l.title, l.video_url is not null as tiene_video
from public.lessons l
join public.modules m on m.id = l.module_id
where m.title = 'Módulo 1: Bienvenida y primeros pasos'
order by l.position;
