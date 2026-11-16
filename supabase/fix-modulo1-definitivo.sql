-- ============================================================
-- Corrección definitiva del Módulo 1, por ID (no por nombre, para no fallar
-- por mayúsculas/acentos). Basado en lo que mostró tu SELECT:
--
-- SACA (no pertenecen al Módulo 1):
--   - "Postura y agarre de la máquina"      (c3938356-119e-4eb8-8df1-2531a1ceb04d)
--   - "Tu primer corte completo"             (edd785ba-a3cc-4576-82b0-931bcf6b951b)
--   - "Errores comunes del principiante"     (3e90f78f-53cd-47e5-ad48-11e3b0f05952)
--
-- CREA (nunca se habían llegado a cargar):
--   - "Cómo funciona la plataforma"
--   - "Soporte, clases en vivo y comunidad"
--   - "Cómo sacarle el máximo al curso"
--   - "Próximos pasos"
--   - "Qué esperar de este curso" (sin video todavía; queda al final)
--
-- Deja el Módulo 1 con el orden exacto que pediste y el video en cada una.
-- Es idempotente: se puede correr más de una vez sin duplicar ni romper nada.
-- ============================================================

-- 1) Saca las 3 clases que no pertenecen al Módulo 1
delete from public.lessons
where id in (
  'c3938356-119e-4eb8-8df1-2531a1ceb04d',  -- Postura y agarre de la máquina
  'edd785ba-a3cc-4576-82b0-931bcf6b951b',  -- Tu primer corte completo
  '3e90f78f-53cd-47e5-ad48-11e3b0f05952'   -- Errores comunes del principiante
);

-- 2) Crea las clases que faltaban (solo si todavía no existen con ese título en el módulo),
--    usando como referencia el módulo de la clase "Bienvenida"
insert into public.lessons (module_id, title, description, position, unlock_after_days)
select mod1.module_id, v.titulo, v.descripcion, v.pos, 0
from (select module_id from public.lessons where id = '7db34062-c7bb-4974-92ac-d635fac09109') as mod1
join (values
  ('Cómo funciona la plataforma',         'Módulos, clases, progreso, comentarios y comunidad.', 90),
  ('Soporte, clases en vivo y comunidad', 'Dónde preguntar, cómo funcionan las lives y cómo pedir ayuda.', 91),
  ('Cómo sacarle el máximo al curso',     'Ritmo de estudio, práctica y cómo conseguir tu certificado.', 92),
  ('Próximos pasos',                      'Qué hacer ahora y cómo seguir al Módulo 2.', 93),
  ('Qué esperar de este curso',           'Cómo está armado el curso y qué vas a lograr al terminarlo.', 94)
) as v(titulo, descripcion, pos) on true
where not exists (
  select 1 from public.lessons l2 where l2.module_id = mod1.module_id and l2.title = v.titulo
);

-- 3) Orden final y video de cada clase (por ID cuando ya existía, por título para las nuevas)
update public.lessons l
set position = v.pos,
    video_url = coalesce(v.video, l.video_url)
from (values
  ('7db34062-c7bb-4974-92ac-d635fac09109'::uuid, 1, 'https://iframe.mediadelivery.net/embed/808490/a88ff276-4d30-461f-8dc2-746bec86fd7b'),
  ('5b53b18d-d0bc-4881-a296-f4b36f9f0458'::uuid, 3, 'https://iframe.mediadelivery.net/embed/808490/8f77d2fe-3812-4c43-aed0-55cdffef8b1e'),
  ('1abcc353-00a5-441b-b51e-e2d3fe4e839d'::uuid, 4, 'https://iframe.mediadelivery.net/embed/808490/77772e51-a28d-4cd1-8215-4f1dd565457e'),
  ('0d6fe905-0061-478c-a1e3-c6ddc7132b1c'::uuid, 7, 'https://iframe.mediadelivery.net/embed/808490/8bc51c07-b13b-475b-854b-07face9f3021')
) as v(id, pos, video)
where l.id = v.id;

update public.lessons l
set position = v.pos,
    video_url = coalesce('https://iframe.mediadelivery.net/embed/808490/' || v.guid, l.video_url)
from (select module_id from public.lessons where id = '7db34062-c7bb-4974-92ac-d635fac09109') as mod1
join (values
  ('Cómo funciona la plataforma',         2, '71ec2d58-2138-49d1-ba9c-5f2f9cd6bc1b'),
  ('Soporte, clases en vivo y comunidad', 5, '1fa732b4-a9f5-40b8-a9c9-16a6d04c4c16'),
  ('Cómo sacarle el máximo al curso',     6, 'a36a5d9b-a3f8-4a22-b8a5-0648b869f299'),
  ('Próximos pasos',                      8, '98942711-ce48-4a4e-b204-50a2c1d4546e'),
  ('Qué esperar de este curso',           9, null)
) as v(titulo, pos, guid) on true
where l.module_id = mod1.module_id and l.title = v.titulo;

-- 4) Verificación: tiene que mostrar exactamente estas 9 filas, en este orden
select l.position, l.title, (l.video_url is not null) as tiene_video
from public.lessons l
where l.module_id = (select module_id from public.lessons where id = '7db34062-c7bb-4974-92ac-d635fac09109')
order by l.position;
