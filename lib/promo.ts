import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRECOS, PROMO_ACTIVA, PROMO_FIN } from "@/lib/config";

// Cuántas vagas de la promo de lanzamiento quedan (las compras con promo=true las marca el webhook de la Hotmart).
// Si algo falla, no bloquea la página: muestra todas las vagas.
export async function vagasPromoRestantes() {
  if (!PROMO_ACTIVA) return 0;
  await connection(); // la fecha de cierre se evalúa en cada visita, no en el build
  // La promo dura 3 días: pasada la fecha de cierre desaparece sola, haya o no cupos.
  if (Date.now() > new Date(PROMO_FIN).getTime()) return 0;
  try {
    const { count, error } = await createAdminClient()
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("promo", true)
      .is("refunded_at", null);
    if (error) throw error;
    return Math.max(0, PRECOS.promo.vagas - (count ?? 0));
  } catch {
    return PRECOS.promo.vagas;
  }
}
