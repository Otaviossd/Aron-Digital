import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelSubscription } from "@/lib/paypal";

// El alumno cancela las próximas cobranzas. El acceso sigue hasta el fin del período pagado.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "no autenticado" }, { status: 401 });

  // RLS garantiza que solo vemos nuestra propia suscripción
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("paypal_subscription_id, status")
    .eq("status", "active")
    .order("purchased_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return NextResponse.json({ error: "sin suscripción activa" }, { status: 404 });

  try {
    await cancelSubscription(sub.paypal_subscription_id, "Cancelado por el alumno desde su cuenta");
    await createAdminClient()
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("paypal_subscription_id", sub.paypal_subscription_id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("cancel error", err);
    return NextResponse.json({ error: "no se pudo cancelar" }, { status: 502 });
  }
}
