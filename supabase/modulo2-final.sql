-- Deja el Módulo 2 con EXACTAMENTE estas 13 clases, en este orden, ya con el video de cada una.
-- Rodar una vez en el SQL Editor del Supabase. Es idempotente.

do $$
declare
  v_modulo uuid;
begin
  select id into v_modulo from public.modules where position = 2;

  -- 1) Borra cualquier clase del módulo 2 que no esté en la lista final
  delete from public.lessons
  where module_id = v_modulo
    and title not in (
      'Introducción', 'Huesos del cráneo', 'Cambios de plano', 'Grados y elevaciones',
      'Peso, volumen y masa', 'Longitudes, y volumen y perímetros', 'Tipos de cabello',
      'Divisiones secciones y particiones', 'Líneas de cortes', 'Distribución',
      'Formas triangulares, cuadradas y redondas', 'Texturas y soportes internos', 'Uso de producto para peinar'
    );

  -- 2) Crea las que todavía no existan
  insert into public.lessons (module_id, title, position, unlock_after_days)
  select v_modulo, v.titulo, v.pos, 0
  from (values
    ('Introducción', 1), ('Huesos del cráneo', 2), ('Cambios de plano', 3), ('Grados y elevaciones', 4),
    ('Peso, volumen y masa', 5), ('Longitudes, y volumen y perímetros', 6), ('Tipos de cabello', 7),
    ('Divisiones secciones y particiones', 8), ('Líneas de cortes', 9), ('Distribución', 10),
    ('Formas triangulares, cuadradas y redondas', 11), ('Texturas y soportes internos', 12), ('Uso de producto para peinar', 13)
  ) as v(titulo, pos)
  where not exists (select 1 from public.lessons l where l.module_id = v_modulo and l.title = v.titulo);

  -- 3) Fija el orden exacto y conecta el video de cada una (biblioteca Bunny 808490)
  update public.lessons l set
    position = v.pos,
    video_url = 'https://iframe.mediadelivery.net/embed/808490/' || v.guid
  from (values
    ('Introducción', 1, '251be0c8-9ae1-42f8-97cd-0c44712c779b'),
    ('Huesos del cráneo', 2, '81882991-f81b-4e4e-88a8-3fa85408f6fb'),
    ('Cambios de plano', 3, '95dd6154-c9ba-4523-a206-b3b2d6d45d7f'),
    ('Grados y elevaciones', 4, '5de1605e-bac6-4724-ae72-edf083077d5c'),
    ('Peso, volumen y masa', 5, '9b6afd0e-7181-46c9-88c7-702fe928b277'),
    ('Longitudes, y volumen y perímetros', 6, '4a222633-d3d2-45f3-a217-8c945b4fb6ad'),
    ('Tipos de cabello', 7, 'fc4f0808-e794-439e-9ae9-c8adb4d2e18a'),
    ('Divisiones secciones y particiones', 8, 'd7e25423-418a-40a7-8ec6-add796b57eac'),
    ('Líneas de cortes', 9, 'bb5f316a-c30f-4fab-a64e-a7f82d4eea10'),
    ('Distribución', 10, '93d574ee-ccfd-42d1-819f-2f139bf4b0f3'),
    ('Formas triangulares, cuadradas y redondas', 11, 'b3d342f9-ff48-4a48-b5c6-2191827af3f0'),
    ('Texturas y soportes internos', 12, 'd5bd7bb3-f4f4-4880-9074-9c0c09c80670'),
    ('Uso de producto para peinar', 13, '4b442890-f827-4d4b-b2ea-290df7ec577c')
  ) as v(titulo, pos, guid)
  where l.module_id = v_modulo and l.title = v.titulo;
end $$;
