import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_AGE_HOURS, pasoDebido } from "@/lib/sequence";
import { enviarPasoAbandono } from "@/lib/marketing";

const LOTE = 200;

function autorizado(request: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return false;
  const recibido = request.headers.get("authorization") ?? "";
  const esperado = `Bearer ${secreto}`;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Chamado a cada hora por um agendador externo (ver .github/workflows/cron-abandonados.yml).
export async function GET(request: NextRequest) {
  if (!autorizado(request)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });

  const admin = createAdminClient();
  const ahora = new Date();
  const desde = new Date(ahora.getTime() - MAX_AGE_HOURS * 3600000).toISOString();

  const { data: leads, error } = await admin
    .from("leads")
    .select("id, email, created_at, converted_at, unsubscribed_at, unsubscribe_token")
    .is("converted_at", null)
    .is("unsubscribed_at", null)
    .gte("created_at", desde)
    .order("created_at")
    .limit(LOTE);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!leads || leads.length === 0) return NextResponse.json({ enviados: 0, revisados: 0 });

  // Seguro extra: quem já tem assinatura não recebe carrinho abandonado (e passa a contar como convertido)
  const emails = leads.map((l) => l.email);
  const { data: compradores } = await admin.from("subscriptions").select("email").in("email", emails);
  const compraron = new Set((compradores ?? []).map((c) => c.email.toLowerCase()));

  const { data: envios } = await admin
    .from("email_sends")
    .select("lead_id, step")
    .eq("sequence", "abandono")
    .in("lead_id", leads.map((l) => l.id));
  const porLead = new Map<string, number[]>();
  for (const e of envios ?? []) porLead.set(e.lead_id, [...(porLead.get(e.lead_id) ?? []), e.step]);

  let enviados = 0;
  let fallos = 0;

  for (const lead of leads) {
    if (compraron.has(lead.email)) {
      await admin.from("leads").update({ converted_at: ahora.toISOString() }).eq("id", lead.id);
      continue;
    }

    const step = pasoDebido({
      createdAt: new Date(lead.created_at),
      now: ahora,
      enviados: porLead.get(lead.id) ?? [],
      convertedAt: null,
      unsubscribedAt: null,
    });
    if (step === null) continue;

    // Reserva a etapa primeiro: a restrição única impede envio duplicado se duas execuções se sobrepuserem.
    const { data: reserva, error: errReserva } = await admin
      .from("email_sends")
      .insert({ lead_id: lead.id, sequence: "abandono", step })
      .select("id")
      .single();
    if (errReserva || !reserva) continue;

    try {
      const providerId = await enviarPasoAbandono({
        email: lead.email,
        step,
        token: lead.unsubscribe_token,
      });
      await admin.from("email_sends").update({ provider_id: providerId }).eq("id", reserva.id);
      enviados++;
    } catch (err) {
      console.error("envio falhou", lead.id, step, err);
      // Libera a etapa para tentar de novo na próxima execução
      await admin.from("email_sends").delete().eq("id", reserva.id);
      fallos++;
    }
  }

  return NextResponse.json({ revisados: leads.length, enviados, fallos });
}
