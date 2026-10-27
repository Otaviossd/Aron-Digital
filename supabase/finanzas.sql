-- Finanzas: montos reales de cada compra. Ejecutar UNA vez en el SQL Editor de Supabase.

-- 0) Por si todavía no existe la tabla de la clase extra (si ya existe, no cambia nada)
create table if not exists public.extra_compras (
  transaction text primary key,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.extra_compras enable row level security;

-- 1) Montos reales de cada compra (los llena el webhook de la Hotmart)
--    gross  = lo que pagó el cliente
--    fee    = tarifa de la Hotmart (comisión "MARKETPLACE")
--    producer / coproducer / affiliate = lo que la Hotmart le paga a cada parte
alter table public.subscriptions
  add column if not exists gross_amount numeric(12,2),
  add column if not exists currency text,
  add column if not exists fee_amount numeric(12,2),
  add column if not exists producer_amount numeric(12,2),
  add column if not exists coproducer_amount numeric(12,2),
  add column if not exists affiliate_amount numeric(12,2);

alter table public.extra_compras
  add column if not exists gross_amount numeric(12,2),
  add column if not exists currency text,
  add column if not exists fee_amount numeric(12,2),
  add column if not exists producer_amount numeric(12,2),
  add column if not exists coproducer_amount numeric(12,2),
  add column if not exists affiliate_amount numeric(12,2);

drop policy if exists "extra_compras_admin_select" on public.extra_compras;
create policy "extra_compras_admin_select" on public.extra_compras for select to authenticated using (public.is_admin());

-- 2) Compras anteriores: recuperar el monto pagado desde el evento guardado de la Hotmart
update public.subscriptions s
set gross_amount = coalesce(s.gross_amount, nullif(e.payload #>> '{data,purchase,price,value}', '')::numeric),
    currency = coalesce(s.currency, nullif(e.payload #>> '{data,purchase,price,currency_value}', ''))
from public.webhook_events e
where e.event_type = 'PURCHASE_APPROVED'
  and e.payload #>> '{data,purchase,transaction}' = s.hotmart_transaction
  and s.gross_amount is null;
