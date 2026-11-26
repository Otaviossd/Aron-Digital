"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cargarExcluidos } from "@/lib/excluidos";
import { enviarEmailUrgente } from "@/lib/marketing";

async function exigirAdmin() {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) throw new Error("No autorizado");
}

export type ResultadoUrgente = { ok?: string; error?: string };

// Envío manual (un solo click) de la "copy matadora" a quien llegó al checkout y todavía no compró.
// Es aparte de la secuencia automática de carrito abandonado (otra `sequence` en email_sends), y la
// restricción única (lead_id, sequence, step) impide mandarlo dos veces a la misma persona aunque se
// apriete el botón de nuevo. `leads`/`email_sends` solo aceptan escritura del service role, por eso acá
// se usa createAdminClient() después de confirmar que quien aprieta el botón es admin.
export async function enviarUrgenteCheckout(_prev: ResultadoUrgente, _formData: FormData): Promise<ResultadoUrgente> {
  try {
    await exigirAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const admin = createAdminClient();
  const excluidos = new Set(await cargarExcluidos(admin));

  const { data: leads, error } = await admin
    .from("leads")
    .select("id, email, unsubscribe_token")
    .is("converted_at", null)
    .is("unsubscribed_at", null)
    .not("checkout_at", "is", null);
  if (error) return { error: error.message };

  const destinatarios = (leads ?? []).filter((l) => !excluidos.has(l.email.toLowerCase()));
  if (destinatarios.length === 0) return { ok: "No hay nadie pendiente en el checkout ahora mismo." };

  // Seguro extra: quien ya tiene suscripción no recibe esto (y de paso queda marcado como convertido).
  const emails = destinatarios.map((l) => l.email);
  const { data: compradores } = await admin.from("subscriptions").select("email").in("email", emails);
  const compraron = new Set((compradores ?? []).map((c) => c.email.toLowerCase()));

  let enviados = 0;
  let fallos = 0;

  for (const lead of destinatarios) {
    if (compraron.has(lead.email.toLowerCase())) {
      await admin.from("leads").update({ converted_at: new Date().toISOString() }).eq("id", lead.id);
      continue;
    }

    // Reserva primero: si ya se había mandado (doble click, u otra corrida), la restricción única lo frena acá.
    const { data: reserva, error: errReserva } = await admin
      .from("email_sends")
      .insert({ lead_id: lead.id, sequence: "urgente", step: 1 })
      .select("id")
      .single();
    if (errReserva || !reserva) continue;

    try {
      const providerId = await enviarEmailUrgente({ email: lead.email, token: lead.unsubscribe_token });
      await admin.from("email_sends").update({ provider_id: providerId }).eq("id", reserva.id);
      enviados++;
    } catch (err) {
      console.error("envío urgente falló", lead.id, err);
      await admin.from("email_sends").delete().eq("id", reserva.id);
      fallos++;
    }
  }

  revalidatePath("/admin/email");

  if (enviados === 0 && fallos === 0) return { ok: "Ya le habías mandado este email a todos los que seguían pendientes." };
  return { ok: `Enviado a ${enviados} de ${destinatarios.length}.${fallos ? ` ${fallos} fallaron, reintentá en un rato.` : ""}` };
}
