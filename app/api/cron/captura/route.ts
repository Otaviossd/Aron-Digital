import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarLoteCaptura, type EmailCaptura } from "@/lib/marketing";
import { PASOS_CAPTURA, hayPasoVigente, pasoCapturaDebido } from "@/lib/sequence-captura";
import { sendWelcomeEmail } from "@/lib/email";

export const maxDuration = 60;

const LOTE = 100; // máximo por llamada de Resend
const MAX_LOTES = 5; // por ejecución (500 emails); el resto sale en la ejecución siguiente

function autorizado(request: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return false;
  const a = Buffer.from(request.headers.get("authorization") ?? "");
  const b = Buffer.from(`Bearer ${secreto}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Se llama cada hora (GitHub Actions). Hace dos cosas:
// 1) Manda los emails de la lista de espera a su hora (2 por día, 09:00 y 19:00 de Paraguay).
// 2) Reenvía el email de acceso a quien compró y no lo recibió (red de seguridad).
// Para pausar los emails de la lista: CAPTURA_EMAILS_PAUSADAS=1 en la Vercel.
export async function GET(request: NextRequest) {
  if (!autorizado(request)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });

  const admin = createAdminClient();
  const ahora = new Date();
  const resultado: Record<string, unknown> = {};

  // ── 2) Accesos pendientes: compra guardada, pero el email de acceso nunca salió ──
  try {
    const hace10min = new Date(ahora.getTime() - 10 * 60000).toISOString();
    const hace3dias = new Date(ahora.getTime() - 3 * 86400000).toISOString();
    const { data: pendientes } = await admin
      .from("subscriptions")
      .select("id, email, plan")
      .is("welcome_sent_at", null)
      .is("refunded_at", null)
      .eq("status", "active")
      .lt("purchased_at", hace10min)
      .gt("purchased_at", hace3dias)
      .limit(20);
    let reenviados = 0;
    for (const s of pendientes ?? []) {
      try {
        await sendWelcomeEmail({ to: s.email, plan: s.plan });
        await admin.from("subscriptions").update({ welcome_sent_at: ahora.toISOString() }).eq("id", s.id);
        reenviados++;
      } catch (err) {
        console.error("reenvío de acceso falló", s.email, err);
      }
    }
    resultado.accesosReenviados = reenviados;
    resultado.accesosPendientes = (pendientes ?? []).length;
  } catch (err) {
    console.error("accesos pendientes", err);
  }

  // ── 1) Emails de la lista de espera ──
  if (process.env.CAPTURA_EMAILS_PAUSADAS === "1") return NextResponse.json({ ...resultado, captura: "pausada" });
  if (!hayPasoVigente(ahora)) return NextResponse.json({ ...resultado, captura: "nada que enviar ahora" });

  const { data: leads, error } = await admin
    .from("leads")
    .select("id, email, name, created_at, converted_at, unsubscribed_at, unsubscribe_token")
    .eq("source", "captura")
    .is("unsubscribed_at", null)
    .is("converted_at", null)
    .order("created_at")
    .limit(5000);
  if (error) return NextResponse.json({ ...resultado, error: error.message }, { status: 500 });
  if (!leads || leads.length === 0) return NextResponse.json({ ...resultado, captura: "sin leads" });

  // Quien ya compró (aunque el lead no esté marcado) no recibe emails de la lista.
  const compraron = new Set<string>();
  for (let i = 0; i < leads.length; i += 200) {
    const { data } = await admin.from("subscriptions").select("email").in("email", leads.slice(i, i + 200).map((l) => l.email));
    for (const c of data ?? []) compraron.add(c.email.toLowerCase());
  }

  const enviosPorLead = new Map<string, number[]>();
  for (let i = 0; i < leads.length; i += 200) {
    const { data } = await admin
      .from("email_sends")
      .select("lead_id, step")
      .eq("sequence", "captura")
      .in("lead_id", leads.slice(i, i + 200).map((l) => l.id));
    for (const e of data ?? []) enviosPorLead.set(e.lead_id, [...(enviosPorLead.get(e.lead_id) ?? []), e.step]);
  }

  // Agrupa por paso: cada persona recibe, como máximo, UN email por ejecución (el más reciente que ya venció).
  const porPaso = new Map<number, typeof leads>();
  for (const l of leads) {
    const step = pasoCapturaDebido({
      creadoEn: new Date(l.created_at),
      ahora,
      enviados: enviosPorLead.get(l.id) ?? [],
      compro: compraron.has(l.email.toLowerCase()),
      baja: false,
    });
    if (step === null) continue;
    porPaso.set(step, [...(porPaso.get(step) ?? []), l]);
  }

  let enviados = 0;
  let fallos = 0;
  let lotes = 0;

  for (const [step, grupo] of porPaso) {
    const paso = PASOS_CAPTURA.find((p) => p.step === step)!;
    for (let i = 0; i < grupo.length && lotes < MAX_LOTES; i += LOTE) {
      const chunk = grupo.slice(i, i + LOTE);
      lotes++;

      // Reserva primero: la restricción única impide duplicados si dos ejecuciones se pisan.
      const { data: reservadas, error: errRes } = await admin
        .from("email_sends")
        .upsert(chunk.map((l) => ({ lead_id: l.id, sequence: "captura", step })), { onConflict: "lead_id,sequence,step", ignoreDuplicates: true })
        .select("id, lead_id");
      if (errRes || !reservadas || reservadas.length === 0) continue;
      const mias = new Map(reservadas.map((r) => [r.lead_id, r.id]));
      const lote: EmailCaptura[] = chunk
        .filter((l) => mias.has(l.id))
        .map((l) => ({ email: l.email, nombre: l.name, token: l.unsubscribe_token, id: paso.id }));
      const idsReserva = chunk.filter((l) => mias.has(l.id)).map((l) => mias.get(l.id)!);

      try {
        const { providerIds, asuntos } = await enviarLoteCaptura(lote);
        await Promise.all(idsReserva.map((rid, k) => admin.from("email_sends").update({ provider_id: providerIds[k] }).eq("id", rid)));
        await admin.from("email_log").insert(lote.map((l, k) => ({ to_email: l.email, kind: "captura", subject: asuntos[k], status: "sent", provider_id: providerIds[k] })));
        enviados += lote.length;
      } catch (err) {
        console.error("lote captura falló", paso.id, err);
        // libera los pasos para reintentar en la próxima ejecución (dentro de la ventana de vigencia)
        await admin.from("email_sends").delete().in("id", idsReserva);
        await admin.from("email_log").insert(lote.slice(0, 20).map((l) => ({ to_email: l.email, kind: "captura", status: "failed", error: err instanceof Error ? err.message.slice(0, 300) : "error" })));
        fallos += lote.length;
      }
    }
  }

  return NextResponse.json({ ...resultado, captura: "ok", leads: leads.length, enviados, fallos });
}
