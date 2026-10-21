-- Cuenta de alumno para la revisión de la Hotmart (área de miembros externa).
-- 1) Antes, en Supabase: Authentication > Users > Add user > Create new user
--    Email: revisor@lanuevaolaacademy.com   Contraseña: la que vas a pasarle a la Hotmart   (marcá "Auto Confirm User").
-- 2) Después corré este SQL: le da acceso vitalicio de alumno a esa cuenta.
insert into public.subscriptions (email, status, plan, purchased_at, access_until, hotmart_transaction)
values ('revisor@lanuevaolaacademy.com', 'active', 'lifetime', now() - interval '30 days', null, 'REVISOR-HOTMART')
on conflict (hotmart_transaction) do nothing;
