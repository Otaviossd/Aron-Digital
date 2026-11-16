-- ============================================================
-- Videos del Módulo 1 (Bunny Stream, library 808490). Idempotente: solo
-- actualiza clases cuyo video_url esté vacío o sea el de otra clase/módulo.
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

update public.modules
set title = 'Módulo 1: Bienvenida y primeros pasos'
where title = 'Módulo 1: Bienvenida';

update public.lessons l
set video_url = 'https://iframe.mediadelivery.net/embed/808490/' || v.guid
from (values
  ('Bienvenida', 'a88ff276-4d30-461f-8dc2-746bec86fd7b'),
  ('Cómo funciona la plataforma', '71ec2d58-2138-49d1-ba9c-5f2f9cd6bc1b'),
  ('Clases bloqueadas y módulos bonus', '77772e51-a28d-4cd1-8215-4f1dd565457e'),
  ('Soporte, clases en vivo y comunidad', '1fa732b4-a9f5-40b8-a9c9-16a6d04c4c16'),
  ('Cómo entrar a tu cuenta', '8f77d2fe-3812-4c43-aed0-55cdffef8b1e'),
  ('Cómo sacarle el máximo al curso', 'a36a5d9b-a3f8-4a22-b8a5-0648b869f299'),
  ('Clase extra: cómo crecer en redes sociales', '8bc51c07-b13b-475b-854b-07face9f3021'),
  ('Próximos pasos', '98942711-ce48-4a4e-b204-50a2c1d4546e')
) as v(titulo, guid)
join public.modules m on m.title = 'Módulo 1: Bienvenida y primeros pasos'
where l.module_id = m.id
and l.title = v.titulo;
