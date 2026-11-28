-- Cria (ou reemplaza) una suscripción "trial" de prueba para ver la plataforma exactamente como la ve
-- quien entra por el funil de US$1: Módulo 1 completo + 2 clases del Módulo 2, el resto bloqueado,
-- con el banner de upgrade a la promo de US$25.
-- Requiere haber corrido antes supabase/funil-trial-1-dolar.sql (si no, el plan "trial" no existe).
-- Cambiá el email de abajo por uno que uses para entrar (podés usar uno nuevo con ese +trial).
-- Ejecutar en el SQL Editor de Supabase.

insert into public.subscriptions (
  email, payer_email, hotmart_transaction, plan, promo, status, purchased_at, access_until,
  gross_amount, currency, fee_amount, producer_amount, coproducer_amount, affiliate_amount
)
values (
  'TU_EMAIL_DE_PRUEBA@gmail.com', 'TU_EMAIL_DE_PRUEBA@gmail.com', 'manual:teste-trial', 'trial', false, 'active', now(), null,
  1, 'USD', 0, 1, null, null
)
on conflict (hotmart_transaction) do nothing;
