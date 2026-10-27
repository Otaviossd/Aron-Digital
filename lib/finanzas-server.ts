import type { SupabaseClient } from "@supabase/supabase-js";
import { calcularFinanzas, type CompraFila, type ExtraFila } from "./finanzas.ts";

// Período: últimos N días, todo (null) o un rango de fechas AAAA-MM-DD (horario de Paraguay, UTC-3).
export type Periodo = number | null | { desde: string; hasta: string };

const inicioDia = (d: string) => new Date(`${d}T00:00:00-03:00`).toISOString();
const inicioDiaSiguiente = (d: string) => new Date(new Date(`${d}T00:00:00-03:00`).getTime() + 86400000).toISOString();

// Lee las compras y extras del período y hace las cuentas.
export async function cargarFinanzas(supabase: SupabaseClient, periodo: Periodo) {
  const rango = typeof periodo === "object" && periodo !== null ? periodo : null;
  const dias = typeof periodo === "number" ? periodo : null;
  const desdeIso = rango ? inicioDia(rango.desde) : dias ? new Date(Date.now() - dias * 86400000).toISOString() : null;
  const hastaIso = rango ? inicioDiaSiguiente(rango.hasta) : null;
  let qCompras = supabase.from("subscriptions").select("*").order("purchased_at", { ascending: false }).limit(5000);
  let qExtras = supabase.from("extra_compras").select("*").limit(5000);
  if (desdeIso) {
    qCompras = qCompras.gte("purchased_at", desdeIso);
    qExtras = qExtras.gte("created_at", desdeIso);
  }
  if (hastaIso) {
    qCompras = qCompras.lt("purchased_at", hastaIso);
    qExtras = qExtras.lt("created_at", hastaIso);
  }
  const [compras, extras] = await Promise.all([qCompras, qExtras]);
  return { f: calcularFinanzas((compras.data ?? []) as CompraFila[], (extras.data ?? []) as ExtraFila[]) };
}
