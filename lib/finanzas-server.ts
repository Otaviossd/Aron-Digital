import type { SupabaseClient } from "@supabase/supabase-js";
import { calcularFinanzas, type CompraFila, type ExtraFila, type Finanzas, type GastoFila } from "./finanzas.ts";

export type GastoListado = GastoFila & { id: string; note: string | null };

// Lee compras, extras, gastos y contactos del período (dias = null → todo) y hace las cuentas.
export async function cargarFinanzas(supabase: SupabaseClient, dias: number | null) {
  const desde = dias ? new Date(Date.now() - dias * 86400000) : null;
  const desdeIso = desde?.toISOString();
  const desdeDia = desde?.toISOString().slice(0, 10);

  let qCompras = supabase.from("subscriptions").select("*").order("purchased_at", { ascending: false }).limit(5000);
  let qExtras = supabase.from("extra_compras").select("*").limit(5000);
  let qGastos = supabase.from("ad_spend").select("id, spent_on, platform, amount_usd, note").order("spent_on", { ascending: false }).order("created_at", { ascending: false }).limit(5000);
  let qLeads = supabase.from("leads").select("id", { count: "exact", head: true });
  if (desdeIso && desdeDia) {
    qCompras = qCompras.gte("purchased_at", desdeIso);
    qExtras = qExtras.gte("created_at", desdeIso);
    qGastos = qGastos.gte("spent_on", desdeDia);
    qLeads = qLeads.gte("created_at", desdeIso);
  }
  const [compras, extras, gastos, leads] = await Promise.all([qCompras, qExtras, qGastos, qLeads]);

  const listaGastos = (gastos.data ?? []) as GastoListado[];
  const f: Finanzas = calcularFinanzas((compras.data ?? []) as CompraFila[], (extras.data ?? []) as ExtraFila[], listaGastos, leads.count ?? 0);
  return {
    f,
    gastos: listaGastos,
    // Si la tabla no existe todavía, falta ejecutar supabase/finanzas.sql
    faltaSql: Boolean(gastos.error),
    totalCompras: (compras.data ?? []).length,
  };
}
