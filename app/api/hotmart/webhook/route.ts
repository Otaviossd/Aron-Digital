import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import { hottokValido, leerCompra } from "@/lib/hotmart";

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
      if (c.extra) return;
      const ahora = new Date();
      const { data: fila, error } = await admin
        .from("subscriptions")
        .upsert(
          {
            email: c.email,
            payer_email: c.email,
            hotmart_transaction: c.transaccion,
            plan: c.plan,
            promo: c.promo,
            status: "active",
            purchased_at: ahora.toISOString(),
            // vitalicio = sin vencimiento; 1 año = 365 días desde la compra
            access_until: c.plan === "lifetime" ? null : new Date(ahora.getTime() + 365 * 86400000).toISOString(),
          },
          { onConflict: "hotmart_transaction", ignoreDuplicates: false },
        )
        .select("id, welcome_sent_at")
        .single();
      if (error) throw error;

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
