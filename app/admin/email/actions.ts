"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cargarExcluidos } from "@/lib/excluidos";
import { enviarEmailUrgente } from "@/lib/marketing";
import type { VarianteUrgente } from "@/lib/emails/urgente";

async function exigirAdmin() {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) throw new Error("No autorizado");
}

export type ResultadoEnvioLead = { ok?: string; error?: string };

// Envío manual, contacto por contacto: Aaron elige en /admin/email (tabla "Últimos contactos") cuál de
// las 3 variantes de la "copy matadora" (lib/emails/urgente.ts) mandarle a cada quien llegó al checkout
// y no compró. La restricción única (lead_id, sequence, step) impide mandar la misma variante dos veces
// a la misma persona aunque se apriete el botón de nuevo (step = número de variante, 1/2/3).
// `leads`/`email_sends` solo aceptan escritura del service role, por eso acá se usa createAdminClient()
// después de confirmar con la sesión normal que quien aprieta el botón es admin.
export async function enviarUrgenteALead(_prev: ResultadoEnvioLead, formData: FormData): Promise<ResultadoEnvioLead> {
  try {
    await exigirAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const leadId = String(formData.get("lead_id") ?? "").trim();
  const variante = Number(formData.get("variante")) as VarianteUrgente;
  if (!leadId || ![1, 2, 3].includes(variante)) return { error: "Faltan datos." };

  const admin = createAdminClient();

  const { data: lead, error } = await admin
    .from("leads")
    .select("id, email, unsubscribe_token, converted_at, unsubscribed_at")
    .eq("id", leadId)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!lead) return { error: "No encontré ese contacto." };
  if (lead.converted_at) return { error: "Ya compró; no hace falta mandarle esto." };
  if (lead.unsubscribed_at) return { error: "Se dio de baja; no se le puede mandar." };

  const excluidos = await cargarExcluidos(admin);
  if (excluidos.includes(lead.email.toLowerCase())) return { error: "Es un email de prueba, no se manda." };

  // Reserva primero: si ya se había mandado esta variante (doble click), la restricción única lo frena acá.
  const { data: reserva, error: errReserva } = await admin
    .from("email_sends")
    .insert({ lead_id: lead.id, sequence: "urgente", step: variante })
    .select("id")
    .single();
  if (errReserva || !reserva) return { error: `Ya le habías mandado el email ${variante} a este contacto.` };

  try {
    const providerId = await enviarEmailUrgente({ email: lead.email, token: lead.unsubscribe_token, variante });
    await admin.from("email_sends").update({ provider_id: providerId }).eq("id", reserva.id);
  } catch (err) {
    console.error("envío urgente falló", lead.id, variante, err);
    await admin.from("email_sends").delete().eq("id", reserva.id);
    return { error: "Falló el envío. Probá de nuevo en un rato." };
  }

  revalidatePath("/admin/email");
  return { ok: `Email ${variante} enviado a ${lead.email}.` };
}
