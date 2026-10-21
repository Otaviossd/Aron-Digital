-- ============================================================
-- Contenido de EJEMPLO para ver el curso "completo" (módulos, bonos y clases con candado).
-- Es idempotente: se puede correr más de una vez sin duplicar nada.
-- Reemplazá los títulos y videos reales desde /admin/contenido cuando Aaron los tenga.
-- ============================================================

-- Módulos principales (4 y 5 con candado) y bonos (ambos con candado a los 7 días)
insert into public.modules (title, description, position, unlock_after_days, is_bonus)
select v.title, v.description, v.position, v.dias, v.bono
from (values
  ('Módulo 4: Barba y perfilado', 'Diseño de barba, líneas limpias y toalla caliente.', 4, 7, false),
  ('Módulo 5: Tu negocio de barbería', 'Precios, clientes fijos y cómo vender más sin bajar tu valor.', 5, 14, false),
  ('Bono: Color', 'Técnicas de color para barberos. Se libera a los 7 días de tu acceso.', 100, 7, true),
  ('Bono: Mindset del barbero rico', 'Hábitos, finanzas y mentalidad para vivir bien de la barbería.', 101, 7, true)
) as v(title, description, position, dias, bono)
where not exists (select 1 from public.modules m where m.title = v.title);

-- Clases de ejemplo: solo se cargan en módulos que todavía no tienen clases.
-- La 4ª columna es el candado: días después de la compra en que se abre la clase (0 = abre con el módulo).
insert into public.lessons (module_id, title, description, position, unlock_after_days, duration_minutes)
select m.id, l.title, l.descripcion, l.pos, l.dias, l.minutos
from public.modules m
join (values
  ('Módulo 1: Fundamentos', 'Bienvenida y herramientas', 'Qué necesitás para empezar y cómo cuidarlo.', 1, 0, 12),
  ('Módulo 1: Fundamentos', 'Postura y agarre de la máquina', 'La base para cortes limpios sin cansarte.', 2, 0, 15),
  ('Módulo 1: Fundamentos', 'Tu primer corte completo', 'Paso a paso con modelo real.', 3, 0, 24),
  ('Módulo 1: Fundamentos', 'Errores comunes del principiante', 'Lo que más se repite y cómo evitarlo.', 4, 7, 18),
  ('Módulo 2: Degradê', 'Mapa de la cabeza y guías', 'Cómo dividir la cabeza para degradar bien.', 1, 0, 16),
  ('Módulo 2: Degradê', 'Degradê bajo paso a paso', 'El clásico, explicado en detalle.', 2, 0, 28),
  ('Módulo 2: Degradê', 'Degradê medio y alto', 'Variaciones y transiciones.', 3, 7, 26),
  ('Módulo 3: Avançado', 'Acabamentos con navaja', 'Líneas perfectas y contornos.', 1, 0, 20),
  ('Módulo 3: Avançado', 'Atención premium al cliente', 'La experiencia que hace que vuelvan.', 2, 7, 17),
  ('Módulo 4: Barba y perfilado', 'Diseño de barba según el rostro', 'Cómo elegir la forma ideal.', 1, 0, 19),
  ('Módulo 4: Barba y perfilado', 'Perfilado con navaja', 'Líneas limpias y seguras.', 2, 7, 22),
  ('Módulo 4: Barba y perfilado', 'Toalla caliente y finalización', 'El toque que se cobra aparte.', 3, 7, 14),
  ('Módulo 5: Tu negocio de barbería', 'Cómo poner tus precios', 'Cobrá por valor, no por tiempo.', 1, 0, 21),
  ('Módulo 5: Tu negocio de barbería', 'Clientes fijos y agenda llena', 'Sistema simple de fidelización.', 2, 7, 23),
  ('Bono: Color', 'Teoría del color para barberos', 'Lo mínimo que tenés que dominar.', 1, 0, 20),
  ('Bono: Color', 'Decoloración y mechas', 'Proceso seguro paso a paso.', 2, 0, 30),
  ('Bono: Color', 'Matizado y mantenimiento', 'Cómo sostener el color.', 3, 7, 18),
  ('Bono: Mindset del barbero rico', 'Mentalidad de dueño', 'Dejá de pensar como empleado.', 1, 0, 15),
  ('Bono: Mindset del barbero rico', 'Tus números: cuánto ganás de verdad', 'Control de ingresos, costos y metas.', 2, 0, 18),
  ('Bono: Mindset del barbero rico', 'Marca personal y redes', 'Cómo atraer clientes que pagan bien.', 3, 7, 22)
) as l(modulo, title, descripcion, pos, dias, minutos) on l.modulo = m.title
where not exists (select 1 from public.lessons x where x.module_id = m.id);
