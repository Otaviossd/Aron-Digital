-- Deja el Módulo 2 con EXACTAMENTE estas 13 clases, en este orden (borra cualquier otra que tuviera).
-- Rodar una vez en el SQL Editor del Supabase. Es idempotente: se puede correr de nuevo sin romper nada.
-- El video de "Introducción" queda vacío: lo completás en admin/contenido con el link del Bunny.

do $$
declare
  v_modulo uuid;
begin
  select id into v_modulo from public.modules where position = 2;

  -- 1) Borra cualquier clase del módulo 2 que no esté en la lista final
  delete from public.lessons
  where module_id = v_modulo
    and title not in (
      'Introducción',
      'Huesos del cráneo',
      'Cambios de plano',
      'Grados y elevaciones',
      'Peso, volumen y masa',
      'Longitudes, y volumen y perímetros',
      'Tipos de cabello',
      'Divisiones secciones y particiones',
      'Líneas de cortes',
      'Distribución',
      'Formas triangulares, cuadradas y redondas',
      'Texturas y soportes internos',
      'Uso de producto para peinar'
    );

  -- 2) Crea las que todavía no existan
  insert into public.lessons (module_id, title, position, unlock_after_days)
  select v_modulo, v.titulo, v.pos, 0
  from (values
    ('Introducción', 1),
    ('Huesos del cráneo', 2),
    ('Cambios de plano', 3),
    ('Grados y elevaciones', 4),
    ('Peso, volumen y masa', 5),
    ('Longitudes, y volumen y perímetros', 6),
    ('Tipos de cabello', 7),
    ('Divisiones secciones y particiones', 8),
    ('Líneas de cortes', 9),
    ('Distribución', 10),
    ('Formas triangulares, cuadradas y redondas', 11),
    ('Texturas y soportes internos', 12),
    ('Uso de producto para peinar', 13)
  ) as v(titulo, pos)
  where not exists (select 1 from public.lessons l where l.module_id = v_modulo and l.title = v.titulo);

  -- 3) Fija el orden exacto (por si alguna ya existía con otra posición)
  update public.lessons l set position = v.pos
  from (values
    ('Introducción', 1),
    ('Huesos del cráneo', 2),
    ('Cambios de plano', 3),
    ('Grados y elevaciones', 4),
    ('Peso, volumen y masa', 5),
    ('Longitudes, y volumen y perímetros', 6),
    ('Tipos de cabello', 7),
    ('Divisiones secciones y particiones', 8),
    ('Líneas de cortes', 9),
    ('Distribución', 10),
    ('Formas triangulares, cuadradas y redondas', 11),
    ('Texturas y soportes internos', 12),
    ('Uso de producto para peinar', 13)
  ) as v(titulo, pos)
  where l.module_id = v_modulo and l.title = v.titulo;
end $$;
