import type { SupabaseClient } from "@supabase/supabase-js";
import { calcularFinanzas, type CompraFila, type ExtraFila } from "./finanzas.ts";

// Lee las compras y extras del período (dias = null → todo) y hace las cuentas.
export async function cargarFinanzas(supabase: SupabaseClient, dias: number | null) {
  const desdeIso = dias ? new Date(Date.now() - dias * 86400000).toISOString() : null;
  let qCompras = supabase.from("subscriptions").select("*").order("purchased_at", { ascending: false }).limit(5000);
  let qExtras = supabase.from("extra_compras").select("*").limit(5000);
  if (desdeIso) {
    qCompras = qCompras.gte("purchased_at", desdeIso);
    qExtras = qExtras.gte("created_at", desdeIso);
  }
  const [compras, extras] = await Promise.all([qCompras, qExtras]);
  return { f: calcularFinanzas((compras.data ?? []) as CompraFila[], (extras.data ?? []) as ExtraFila[]) };
}
