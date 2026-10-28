import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarPasoExtra } from "@/lib/marketing";
import { enlaceExtra, precioExtra, URLS_EXTRA } from "@/lib/extra";
import { MAX_HORAS_EXTRA, pasoExtraDebido } from "@/lib/sequence-extra";
import { FECHA_LANZAMIENTO } from "@/lib/config";

const LOTE = 300;

function autorizado(request: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return false;
  const a = Buffer.from(request.headers.get("authorization") ?? "");
  const b = Buffer.from(`Bearer ${secreto}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Llamado cada hora (ver .github/workflows/cron-abandonados.yml). Manda los emails de la clase extra
// a quien compró el curso y todavía no la compró. Apagado hasta poner EXTRA_EMAILS_ACTIVAS=1 en la Vercel.
export async function GET(request: NextRequest) {
  if (!autorizado(request)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  if (process.env.EXTRA_EMAILS_ACTIVAS !== "1") return NextResponse.json({ activo: false, enviados: 0 });

  const admin = createAdminClient();
  const ahora = new Date();
  let desde = new Date(ahora.getTime() - MAX_HORAS_EXTRA * 3600000);
  // Solo compras desde el lanzamiento (o EXTRA_EMAILS_DESDE): así las compras de prueba anteriores no reciben nada.
  const piso = process.env.EXTRA_EMAILS_DESDE || FECHA_LANZAMIENTO;
  if (piso) {
    const p = new Date(`${piso.length === 10 ? `${piso}T00:00:00-03:00` : piso}`);
    if (!Number.isNaN(p.getTime()) && p > desde) desde = p;
  }

  const { data: subs, error } = await admin
    .from("subscriptions")
    .select("email, purchased_at")
    .is("refunded_at", null)
    .eq("status", "active")
    .gte("purchased_at", desde.toISOString())
    .order("purchased_at")
    .limit(LOTE);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs || subs.length === 0) return NextResponse.json({ activo: true, revisados: 0, enviados: 0 });

  // una sola compra por email: la más antigua cuenta como "día 0"
  const compraPorEmail = new Map<string, Date>();
  for (const s of subs) {
    const e = s.email.trim().toLowerCase();
    const f = new Date(s.purchased_at);
    const previa = compraPorEmail.get(e);
    if (!previa || f < previa) compraPorEmail.set(e, f);
  }
  const emails = [...compraPorEmail.keys()];

  const [{ data: extras }, { data: leads }, { data: envios }] = await Promise.all([
    admin.from("extra_compras").select("email").in("email", emails),
    admin.from("leads").select("id, email, unsubscribed_at, unsubscribe_token").in("email", emails),
    admin.from("extra_sends").select("email, step, sent_at").in("email", emails),
  ]);
  const yaTienen = new Set((extras ?? []).map((x) => x.email.toLowerCase()));
  const leadPorEmail = new Map((leads ?? []).map((l) => [l.email, l]));
  const enviosPorEmail = new Map<string, { step: number; sent_at: string }[]>();
  for (const e of envios ?? []) enviosPorEmail.set(e.email, [...(enviosPorEmail.get(e.email) ?? []), { step: e.step, sent_at: e.sent_at }]);

  let enviados = 0;
  let fallos = 0;

  for (const [email, compraEn] of compraPorEmail) {
    if (yaTienen.has(email)) continue;
    const lead = leadPorEmail.get(email);
    if (lead?.unsubscribed_at) continue;

    const previos = enviosPorEmail.get(email) ?? [];
    const step = pasoExtraDebido({
      compraEn,
      ahora,
      enviados: previos.map((p) => p.step),
      ultimoEnvio: previos.length ? new Date(Math.max(...previos.map((p) => new Date(p.sent_at).getTime()))) : null,
    });
    if (step === null) continue;

    // Token de baja: si el alumno no está en leads, se crea (ya convertido: no entra al carrito abandonado).
    let token = lead?.unsubscribe_token as string | undefined;
    if (!token) {
      const { data: nuevo } = await admin
        .from("leads")
        .upsert({ email, source: "alumno", converted_at: ahora.toISOString() }, { onConflict: "email" })
        .select("unsubscribe_token, unsubscribed_at")
        .single();
      if (!nuevo || nuevo.unsubscribed_at) continue;
      token = nuevo.unsubscribe_token;
    }

    const precio = precioExtra(compraEn, ahora);
    const link = enlaceExtra(precio.enOferta, URLS_EXTRA, email);
    if (!link) continue;

    // Reserva el paso primero: la restricción única evita duplicados si dos ejecuciones se pisan.
    const { data: reserva, error: errReserva } = await admin.from("extra_sends").insert({ email, step }).select("id").single();
    if (errReserva || !reserva) continue;

    try {
      const { providerId, asunto } = await enviarPasoExtra({ email, step, token: token!, link, horasRestantes: precio.horasRestantes });
      await admin.from("extra_sends").update({ provider_id: providerId }).eq("id", reserva.id);
      await admin.from("email_log").insert({ to_email: email, kind: "extra", subject: asunto, status: "sent", provider_id: providerId });
      enviados++;
    } catch (err) {
      console.error("envío extra falló", email, step, err);
      await admin.from("extra_sends").delete().eq("id", reserva.id);
      await admin.from("email_log").insert({ to_email: email, kind: "extra", status: "failed", error: err instanceof Error ? err.message.slice(0, 300) : "error" });
      fallos++;
    }
  }

  return NextResponse.json({ activo: true, revisados: compraPorEmail.size, enviados, fallos });
}
