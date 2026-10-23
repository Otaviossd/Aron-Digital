import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import { hottokValido, leerCompra, type MontosCompra } from "@/lib/hotmart";

// 42703 = columna inexistente (Postgres), PGRST204 = columna inexistente en el caché de PostgREST
const faltaColumna = (e: { code?: string }) => e.code === "42703" || e.code === "PGRST204";

const columnasMontos = (m: MontosCompra) => ({
  gross_amount: m.bruto,
  currency: m.moneda,
  fee_amount: m.tarifa,
  producer_amount: m.productor,
  coproducer_amount: m.coproductor,
  affiliate_amount: m.afiliado,
});

// Webhook de la Hotmart. En la Hotmart: Herramientas > Webhook > Registrar webhook, con la URL
// https://TU-DOMINIO/api/hotmart/webhook y los eventos de compra. El "hottok" va en HOTMART_HOTTOK.
export async function POST(request: NextRequest) {
  if (!hottokValido(request.headers.get("x-hotmart-hottok"), process.env.HOTMART_HOTTOK)) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  let evento: any;
  try {
    evento = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const admin = createAdminClient();
  const idEvento = typeof evento?.id === "string" ? `hotmart:${evento.id}` : null;

  // Idempotencia: la Hotmart reenvía eventos. Si ya lo procesamos, respondemos 200.
  if (idEvento) {
    const { error } = await admin.from("webhook_events").insert({ id: idEvento, event_type: String(evento?.event ?? ""), payload: evento });
    if (error) {
      if (error.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  try {
    await procesar(admin, evento);
  } catch (err) {
    if (idEvento) await admin.from("webhook_events").delete().eq("id", idEvento);
    console.error("hotmart webhook error", evento?.event, err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

async function procesar(admin: ReturnType<typeof createAdminClient>, evento: any) {
  switch (evento?.event) {
    case "PURCHASE_APPROVED": {
      const c = leerCompra(evento);
      if (!c) throw new Error("Compra sin email o transacción");
      // Bump / producto extra barato: el evento ya queda guardado en webhook_events; no crea suscripción.
      if (c.extra) {
        const base = { transaction: c.transaccion, email: c.email };
        const r = await admin.from("extra_compras").upsert({ ...base, ...columnasMontos(c.montos) }, { onConflict: "transaction" });
        if (r.error && faltaColumna(r.error)) await admin.from("extra_compras").upsert(base, { onConflict: "transaction" });
        return;
      }
      const ahora = new Date();
      const compra = {
        email: c.email,
        payer_email: c.email,
        hotmart_transaction: c.transaccion,
        plan: c.plan,
        promo: c.promo,
        status: "active",
        purchased_at: ahora.toISOString(),
        // vitalicio = sin vencimiento; 1 año = 365 días desde la compra
        access_until: c.plan === "lifetime" ? null : new Date(ahora.getTime() + 365 * 86400000).toISOString(),
      };
      const guardar = (fila: Record<string, unknown>) =>
        admin.from("subscriptions").upsert(fila, { onConflict: "hotmart_transaction", ignoreDuplicates: false }).select("id, welcome_sent_at").single();
      let { data: fila, error } = await guardar({ ...compra, ...columnasMontos(c.montos) });
      // Si todavía no se ejecutó supabase/finanzas.sql faltan las columnas de montos: no frenamos la compra por eso.
      if (error && faltaColumna(error)) ({ data: fila, error } = await guardar(compra));
      if (error || !fila) throw error ?? new Error("No se pudo guardar la compra");

      // Compró: corta la secuencia de carrito abandonado y completa el contacto
      await admin
        .from("leads")
        .update({ converted_at: ahora.toISOString(), ...(c.nombre ? { name: c.nombre } : {}), ...(c.telefono ? { phone: c.telefono } : {}) })
        .eq("email", c.email)
        .is("converted_at", null);

      if (!fila.welcome_sent_at) {
        await sendWelcomeEmail({ to: c.email, plan: c.plan });
        await admin.from("subscriptions").update({ welcome_sent_at: ahora.toISOString() }).eq("id", fila.id);
      }
      return;
    }

    case "PURCHASE_REFUNDED":
    case "PURCHASE_CHARGEBACK": {
      const t = evento?.data?.purchase?.transaction;
      if (typeof t !== "string") return;
      await admin.from("extra_compras").delete().eq("transaction", t);
      await admin.from("subscriptions").update({ refunded_at: new Date().toISOString(), status: "cancelled" }).eq("hotmart_transaction", t);
      return;
    }

    case "PURCHASE_OUT_OF_SHOPPING_CART": {
      // Abandonó el checkout: guardamos/actualizamos el contacto y arranca la secuencia de recuperación.
      const email = typeof evento?.data?.buyer?.email === "string" ? evento.data.buyer.email.trim().toLowerCase() : "";
      if (!email) return;
      const nombre = typeof evento.data.buyer.name === "string" ? evento.data.buyer.name : null;
      const tel = typeof evento.data.buyer.checkout_phone === "string" ? evento.data.buyer.checkout_phone : null;
      const { data: existente } = await admin.from("leads").select("id, checkout_at").eq("email", email).maybeSingle();
      const ahora = new Date().toISOString();
      if (!existente) {
        await admin.from("leads").insert({ email, name: nombre, phone: tel, source: "checkout", checkout_at: ahora });
      } else if (!existente.checkout_at) {
        await admin.from("leads").update({ checkout_at: ahora, ...(nombre ? { name: nombre } : {}), ...(tel ? { phone: tel } : {}) }).eq("id", existente.id);
      }
      return;
    }

    default:
      return;
  }
}
