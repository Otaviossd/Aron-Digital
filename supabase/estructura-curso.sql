-- ============================================================
-- Estructura del curso (sin videos todavía): Aaron solo completa títulos y sube los videos desde /admin/contenido.
-- Reemplaza los módulos de EJEMPLO (solo si ninguna clase tiene video). Es idempotente.
-- Los módulos "Corte 2" y "Corte 3" son plantillas: renombralos cuando Aaron elija los cortes.
-- ============================================================

-- 1) Borra los módulos de ejemplo viejos (si ya tienen un video cargado no se toca nada)
delete from public.modules m
where m.title in (
  'Módulo 1: Fundamentos', 'Módulo 2: Degradê', 'Módulo 3: Avançado',
  'Módulo 4: Barba y perfilado', 'Módulo 5: Tu negocio de barbería'
)
and not exists (select 1 from public.lessons l where l.module_id = m.id and l.video_url is not null);

-- 2) Módulos nuevos
insert into public.modules (title, description, position, unlock_after_days, is_bonus)
select v.title, v.description, v.position, 0, false
from (values
  ('Módulo 1: Bienvenida', 'Empezá acá: qué vas a aprender, cómo funciona la plataforma y cómo sacarle el máximo.', 1),
  ('Módulo 2: Fundamentos de la barbería', 'La base de todo corte: herramientas, higiene, cabello, postura y atención al cliente.', 2),
  ('Módulo 3: Corte 1 · Pelo largo', 'Clase práctica completa, de la consulta al acabado final.', 3),
  ('Módulo 4: Corte 2 · (a definir)', 'Clase práctica completa, de la consulta al acabado final.', 4),
  ('Módulo 5: Corte 3 · (a definir)', 'Clase práctica completa, de la consulta al acabado final.', 5)
) as v(title, description, position)
where not exists (select 1 from public.modules m where m.title = v.title);

-- 3) Clases (solo en módulos que todavía no tienen clases). Columnas: módulo, título, descripción, orden, minutos estimados
insert into public.lessons (module_id, title, description, position, duration_minutes, unlock_after_days)
select m.id, l.titulo, l.descripcion, l.pos, l.minutos, 0
from public.modules m
join (values
  -- Módulo 1: clases cortas, 3 a 4 minutos
  ('Módulo 1: Bienvenida', 'Bienvenida', 'Aaron te da la bienvenida a La Nueva Ola Academy.', 1, 3),
  ('Módulo 1: Bienvenida', 'Qué esperar de este curso', 'Cómo está armado el curso y qué vas a lograr al terminarlo.', 2, 4),
  ('Módulo 1: Bienvenida', 'Cómo funciona la plataforma', 'Módulos, clases, progreso, comentarios y comunidad.', 3, 4),
  ('Módulo 1: Bienvenida', 'Cómo entrar a tu cuenta', 'Entrá con tu Gmail, recibí tu acceso y guardalo en tu celular.', 4, 4),
  ('Módulo 1: Bienvenida', 'Clases bloqueadas y módulos bonus', 'Por qué algunas clases se abren con los días y dónde están los bonos.', 5, 4),
  ('Módulo 1: Bienvenida', 'Soporte, clases en vivo y comunidad', 'Dónde preguntar, cómo funcionan las lives y cómo pedir ayuda.', 6, 4),
  ('Módulo 1: Bienvenida', 'Cómo sacarle el máximo al curso', 'Ritmo de estudio, práctica y cómo conseguir tu certificado.', 7, 4),
  ('Módulo 1: Bienvenida', 'Clase extra: cómo crecer en redes sociales', 'Cómo acceder a la clase extra y por qué te ayuda a conseguir más clientes.', 8, 4),
  ('Módulo 1: Bienvenida', 'Próximos pasos', 'Qué hacer ahora y cómo seguir al Módulo 2.', 9, 3),

  -- Módulo 2: fundamentos
  ('Módulo 2: Fundamentos de la barbería', 'Herramientas y equipamiento', 'Qué necesitás para empezar y cómo cuidarlo.', 1, 10),
  ('Módulo 2: Fundamentos de la barbería', 'Higiene y bioseguridad', 'Cómo mantener tu puesto y tus herramientas impecables.', 2, 8),
  ('Módulo 2: Fundamentos de la barbería', 'Tipos de cabello y cuero cabelludo', 'Cómo leer el cabello de cada cliente antes de cortar.', 3, 10),
  ('Módulo 2: Fundamentos de la barbería', 'Mapa de la cabeza', 'Cómo dividir la cabeza para trabajar con orden.', 4, 10),
  ('Módulo 2: Fundamentos de la barbería', 'Postura y agarre', 'La base para cortes limpios sin cansarte.', 5, 10),
  ('Módulo 2: Fundamentos de la barbería', 'Consulta con el cliente', 'Cómo escuchar, proponer y acordar el corte antes de empezar.', 6, 8),

  -- Módulos 3 a 5: misma plantilla para cada corte
  ('Módulo 3: Corte 1 · Pelo largo', 'Introducción al corte', 'Cómo es, a quién le queda bien y los cuidados que necesita.', 1, 8),
  ('Módulo 3: Corte 1 · Pelo largo', 'Herramientas y productos', 'Todo lo que vas a usar en este corte.', 2, 6),
  ('Módulo 3: Corte 1 · Pelo largo', 'Parte 1', 'Primer paso del corte.', 3, 10),
  ('Módulo 3: Corte 1 · Pelo largo', 'Parte 2', 'Segundo paso del corte.', 4, 10),
  ('Módulo 3: Corte 1 · Pelo largo', 'Parte 3', 'Tercer paso del corte.', 5, 10),
  ('Módulo 3: Corte 1 · Pelo largo', 'Parte 4', 'Cuarto paso del corte.', 6, 10),
  ('Módulo 3: Corte 1 · Pelo largo', 'Parte 5', 'Quinto paso del corte.', 7, 10),
  ('Módulo 3: Corte 1 · Pelo largo', 'Parte 6', 'Sexto paso del corte.', 8, 10),
  ('Módulo 3: Corte 1 · Pelo largo', 'Acabado y errores comunes', 'El toque final y lo que más se repite.', 9, 8),

  ('Módulo 4: Corte 2 · (a definir)', 'Introducción al corte', 'Cómo es, a quién le queda bien y los cuidados que necesita.', 1, 8),
  ('Módulo 4: Corte 2 · (a definir)', 'Herramientas y productos', 'Todo lo que vas a usar en este corte.', 2, 6),
  ('Módulo 4: Corte 2 · (a definir)', 'Parte 1', 'Primer paso del corte.', 3, 10),
  ('Módulo 4: Corte 2 · (a definir)', 'Parte 2', 'Segundo paso del corte.', 4, 10),
  ('Módulo 4: Corte 2 · (a definir)', 'Parte 3', 'Tercer paso del corte.', 5, 10),
  ('Módulo 4: Corte 2 · (a definir)', 'Parte 4', 'Cuarto paso del corte.', 6, 10),
  ('Módulo 4: Corte 2 · (a definir)', 'Parte 5', 'Quinto paso del corte.', 7, 10),
  ('Módulo 4: Corte 2 · (a definir)', 'Parte 6', 'Sexto paso del corte.', 8, 10),
  ('Módulo 4: Corte 2 · (a definir)', 'Acabado y errores comunes', 'El toque final y lo que más se repite.', 9, 8),

  ('Módulo 5: Corte 3 · (a definir)', 'Introducción al corte', 'Cómo es, a quién le queda bien y los cuidados que necesita.', 1, 8),
  ('Módulo 5: Corte 3 · (a definir)', 'Herramientas y productos', 'Todo lo que vas a usar en este corte.', 2, 6),
  ('Módulo 5: Corte 3 · (a definir)', 'Parte 1', 'Primer paso del corte.', 3, 10),
  ('Módulo 5: Corte 3 · (a definir)', 'Parte 2', 'Segundo paso del corte.', 4, 10),
  ('Módulo 5: Corte 3 · (a definir)', 'Parte 3', 'Tercer paso del corte.', 5, 10),
  ('Módulo 5: Corte 3 · (a definir)', 'Parte 4', 'Cuarto paso del corte.', 6, 10),
  ('Módulo 5: Corte 3 · (a definir)', 'Parte 5', 'Quinto paso del corte.', 7, 10),
  ('Módulo 5: Corte 3 · (a definir)', 'Parte 6', 'Sexto paso del corte.', 8, 10),
  ('Módulo 5: Corte 3 · (a definir)', 'Acabado y errores comunes', 'El toque final y lo que más se repite.', 9, 8)
) as l(modulo, titulo, descripcion, pos, minutos) on l.modulo = m.title
where not exists (select 1 from public.lessons x where x.module_id = m.id);

-- 4) Si el Módulo 1 ya tenía la versión anterior (7 clases), suma las nuevas y reordena sin tocar videos cargados
insert into public.lessons (module_id, title, description, position, duration_minutes, unlock_after_days)
select m.id, v.t, v.d, v.p, 4, 0
from public.modules m
join (values
  ('Cómo entrar a tu cuenta', 'Entrá con tu Gmail, recibí tu acceso y guardalo en tu celular.', 4),
  ('Clases bloqueadas y módulos bonus', 'Por qué algunas clases se abren con los días y dónde están los bonos.', 5),
  ('Clase extra: cómo crecer en redes sociales', 'Cómo acceder a la clase extra y por qué te ayuda a conseguir más clientes.', 8)
) as v(t, d, p) on true
where m.title = 'Módulo 1: Bienvenida'
and not exists (select 1 from public.lessons x where x.module_id = m.id and x.title = v.t);

update public.lessons l set position = v.p
from public.modules m, (values
  ('Bienvenida', 1), ('Qué esperar de este curso', 2), ('Cómo funciona la plataforma', 3),
  ('Cómo entrar a tu cuenta', 4), ('Clases bloqueadas y módulos bonus', 5),
  ('Soporte, clases en vivo y comunidad', 6), ('Cómo sacarle el máximo al curso', 7),
  ('Clase extra: cómo crecer en redes sociales', 8), ('Próximos pasos', 9)
) as v(t, p)
where m.title = 'Módulo 1: Bienvenida' and l.module_id = m.id and l.title = v.t;

delete from public.lessons l using public.modules m
where m.title = 'Módulo 1: Bienvenida' and l.module_id = m.id
and l.title = 'Cómo acceder desde cualquier dispositivo' and l.video_url is null;
