-- Finanzas: gasto en anuncios + montos reales de cada compra. Ejecutar UNA vez en el SQL Editor de Supabase.

-- 1) Gasto en anuncios (se carga a mano desde Admin > Finanzas)
create table if not exists public.ad_spend (
  id uuid primary key default gen_random_uuid(),
  spent_on date not null default current_date,
  platform text not null default 'Meta',
  amount_usd numeric(12,2) not null check (amount_usd > 0),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists ad_spend_spent_on_idx on public.ad_spend (spent_on desc);
alter table public.ad_spend enable row level security;

drop policy if exists "ad_spend_admin_select" on public.ad_spend;
drop policy if exists "ad_spend_admin_insert" on public.ad_spend;
drop policy if exists "ad_spend_admin_delete" on public.ad_spend;
create policy "ad_spend_admin_select" on public.ad_spend for select to authenticated using (public.is_admin());
create policy "ad_spend_admin_insert" on public.ad_spend for insert to authenticated with check (public.is_admin());
create policy "ad_spend_admin_delete" on public.ad_spend for delete to authenticated using (public.is_admin());

-- 2) Montos reales de cada compra (los llena el webhook de la Hotmart)
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

-- 3) Compras anteriores: recuperar el monto pagado desde el evento guardado de la Hotmart
update public.subscriptions s
set gross_amount = coalesce(s.gross_amount, nullif(e.payload #>> '{data,purchase,price,value}', '')::numeric),
    currency = coalesce(s.currency, nullif(e.payload #>> '{data,purchase,price,currency_value}', ''))
from public.webhook_events e
where e.event_type = 'PURCHASE_APPROVED'
  and e.payload #>> '{data,purchase,transaction}' = s.hotmart_transaction
  and s.gross_amount is null;
