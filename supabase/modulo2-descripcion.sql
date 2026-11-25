-- ============================================================
-- Arregla la descripción del Módulo 2, que había quedado con el texto viejo
-- ("herramientas, higiene, cabello, postura y atención al cliente") de antes
-- de cargar las clases reales (anatomía del cráneo, planos, grados, formas,
-- texturas). Es idempotente: solo toca el módulo si todavía tiene el texto viejo.
-- ============================================================
update public.modules
set description = 'Anatomía del cráneo, planos, grados y elevaciones, tipos de cabello, formas y texturas: la base técnica antes de tomar la tijera.'
where title = 'Módulo 2: Fundamentos de la barbería'
  and description = 'La base de todo corte: herramientas, higiene, cabello, postura y atención al cliente.';
