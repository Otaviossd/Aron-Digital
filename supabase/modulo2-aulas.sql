-- Clases del Módulo 2, en el orden que pediste. Rodar una vez en el SQL Editor del Supabase.
-- Es idempotente: si corrés de nuevo, no duplica (se fija por título dentro del módulo).
-- El video_url queda vacío: lo agregás por admin/contenido con el link de cada video del Bunny.

insert into public.lessons (module_id, title, position, unlock_after_days)
select m.id, v.titulo, v.pos, 0
from public.modules m
join (values
  ('Huesos del cráneo', 1),
  ('Cambios de plano', 2),
  ('Grados y elevaciones', 3),
  ('Peso, volumen y masa', 4),
  ('Longitudes, y volumen y perímetros', 5),
  ('Tipos de cabello', 6),
  ('Divisiones secciones y particiones', 7),
  ('Líneas de cortes', 8),
  ('Distribución', 9),
  ('Formas triangulares, cuadradas y redondas', 10),
  ('Texturas y soportes internos', 11),
  ('Uso de producto para peinar', 12)
) as v(titulo, pos) on true
where m.position = 2
  and not exists (select 1 from public.lessons l where l.module_id = m.id and l.title = v.titulo);
