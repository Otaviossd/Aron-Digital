import { createAdminClient } from "@/lib/supabase/admin";
import { PRECOS, PROMO_ACTIVA } from "@/lib/config";

// Cuántas vagas de la promo de lanzamiento quedan (las compras con promo=true las marca el webhook de la Hotmart).
// Si algo falla, no bloquea la página: muestra todas las vagas.
export async function vagasPromoRestantes() {
  if (!PROMO_ACTIVA) return 0;
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
