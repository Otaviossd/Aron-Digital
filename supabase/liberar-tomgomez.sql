-- Acceso manual para tomgomez_95@icloud.com (no compró por Hotmart, acceso vitalicio + clase extra).
-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- No lo junta con los emails de prueba (HOTMART_TEST_EMAILS / los que ya están en emails_excluidos):
-- esto es un otorgamiento manual propio, no una compra de prueba del equipo.

-- 1) Acceso al curso, vitalicio (sin transacción real de Hotmart, por eso el transaction "manual:...")
insert into public.subscriptions (email, payer_email, hotmart_transaction, plan, status, purchased_at, access_until)
values ('tomgomez_95@icloud.com', 'tomgomez_95@icloud.com', 'manual:tomgomez_95', 'lifetime', 'active', now(), null)
on conflict (hotmart_transaction) do nothing;

-- 2) Clase extra ("Cómo crecer en redes sociales como barbero")
insert into public.extra_compras (transaction, email)
values ('manual:tomgomez_95-extra', 'tomgomez_95@icloud.com')
on conflict (transaction) do nothing;

-- 3) No cuenta en Finanzas ni en ningún número del panel (mismo mecanismo de "Compras de prueba" en /admin/finanzas/pruebas)
insert into public.emails_excluidos (email) values ('tomgomez_95@icloud.com')
on conflict do nothing;
