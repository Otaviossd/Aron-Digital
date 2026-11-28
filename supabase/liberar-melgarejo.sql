-- Acceso manual para melgarejocarlos2501@gmail.com: pagó por alias directo (no por la Hotmart),
-- precio de lanzamiento (US$25, vitalicio + el módulo extra incluido). Cuenta como alumno normal,
-- SIN excluir de Finanzas ni de ningún número del panel (a diferencia del otorgamiento de prueba).
-- Ejecutar una sola vez en el SQL Editor de Supabase.

insert into public.subscriptions (
  email, payer_email, hotmart_transaction, plan, promo, status, purchased_at, access_until,
  gross_amount, currency, fee_amount, producer_amount, coproducer_amount, affiliate_amount
)
values (
  'melgarejocarlos2501@gmail.com', 'melgarejocarlos2501@gmail.com', 'manual:melgarejocarlos2501', 'lifetime', true, 'active', now(), null,
  25, 'USD', 0, 25, null, null
)
on conflict (hotmart_transaction) do nothing;
